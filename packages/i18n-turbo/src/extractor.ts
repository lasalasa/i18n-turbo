// src/extractor.ts
import fs from "fs";
import { promises as fsPromises } from "fs"; // Async FS
import path from "path";
import * as babel from "@babel/core";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { getSourceFiles } from "./scanner";
import { generateTranslationKey } from "./utils";
import { translate } from '@vitalets/google-translate-api';
import pLimit from "p-limit";
import { minimatch } from "minimatch";

import { I18nTurboConfig } from "./config";

interface ExtractOptions {
  fnName: string;
  dryRun: boolean;
  merge: boolean;
  lang?: string;
  config?: I18nTurboConfig;
}

export async function extractStringsFromDirectory(
  inputDir: string,
  outputFile: string,
  options: ExtractOptions
): Promise<void> {
  // console.log('DEBUG: extractor options.config:', options.config);
  // Map of namespace name -> translation map
  const namespaceMaps: Record<string, Record<string, string>> = {};

  // Default namespace (if no specific match or fallback)
  const defaultNamespace = 'common'; // or derive from outputFile basename

  // Initialize default map
  if (!options.config?.namespaces) {
    // If no namespaces configured, use a single map keyed by "default" or just merge everything there.
    // actually we will simulate namespaces: "default" -> file content
    namespaceMaps[defaultNamespace] = {};
  } else {
    // initialize configured namespaces
    Object.values(options.config.namespaces).forEach(ns => {
      namespaceMaps[ns] = {};
    });
    // Ensure default exists for fallbacks
    namespaceMaps[defaultNamespace] = {};
  }

  // Load existing translations if merge is on
  // Logic update: If namespaces are used, we need to load MULTIPLE files.
  // For simplicity: If config.namespaces exists, we assume outputFile is a DIRECTORY or prefix base.
  // But strictly, if user passes `locales/en.json`, we might treat `locales` as the dir.

  const outputDir = path.extname(outputFile) ? path.dirname(outputFile) : outputFile;

  if (options.merge) {
    for (const ns of Object.keys(namespaceMaps)) {
      const nsFile = options.config?.namespaces
        ? path.join(outputDir, `${ns}.json`)
        : outputFile; // If no namespaces, use the single output file

      if (fs.existsSync(nsFile)) {
        try {
          namespaceMaps[ns] = JSON.parse(fs.readFileSync(nsFile, "utf-8"));
        } catch {
          console.warn(`[WARN] Could not parse ${nsFile}, starting fresh.`);
        }
      }
    }
  }

  const files = await getSourceFiles(inputDir, options.config?.excludePatterns);
  const limit = pLimit(50); // Concurrency limit

  await Promise.all(
    files.map((file) =>
      limit(async () => {
        try {
          // Read file async
          const code = await fsPromises.readFile(file, "utf-8");

          // Parse AST (still sync for now as babel.parseAsync just wraps it usually)
          const ast = babel.parseSync(code, {
            filename: file,
            presets: ["@babel/preset-typescript", "@babel/preset-react"],
          });

          if (!ast) return;

          // Determine namespace for this file
          let currentNs = defaultNamespace;
          if (options.config?.namespaces) {
            const relativePath = path.relative(process.cwd(), file); // or relative to inputDir? relative to CWD usually for globs
            // Check against globs
            for (const [pattern, nsName] of Object.entries(options.config.namespaces)) {
              if (minimatch(relativePath, pattern)) {
                currentNs = nsName;
                break;
              }
            }
          }

          // Ensure map exists (e.g. if we default to common)
          if (!namespaceMaps[currentNs]) namespaceMaps[currentNs] = {};

          let modified = false;

          const checkComments = (node: t.Node) => {
            if (node.leadingComments) {
              const c = node.leadingComments.find(c => c.value.trim().startsWith('i18n:'));
              if (c) return c.value.trim().replace(/^i18n:\s*/, '');
            }
            return undefined;
          };

          const getContextFromSibling = (path: NodePath<any>): string | undefined => {
            if (typeof path.key === 'number' && Array.isArray(path.container)) {
              let k = path.key - 1;
              while (k >= 0) {
                const prevNode = path.container[k];
                if (t.isJSXText(prevNode) && !prevNode.value.trim()) {
                  k--;
                  continue;
                }
                if (t.isJSXExpressionContainer(prevNode) && t.isJSXEmptyExpression(prevNode.expression)) {
                  const comments = prevNode.expression.innerComments;
                  if (comments) {
                    const c = comments.find((c: any) => c.value.trim().startsWith('i18n:'));
                    if (c) return c.value.trim().replace(/^i18n:\s*/, '');
                  }
                }
                // If we hit a non-empty text or other node that is not comment, stop?
                // The comment should be immediately preceding (ignoring whitespace).
                // If we found another Element, assume no comment for this one.
                break;
              }
            }
            return undefined;
          };

          traverse(ast, {
            JSXText(path: NodePath<t.JSXText>) {
              const rawText = path.node.value.trim();
              if (!rawText || /^\{.*\}$/.test(rawText)) return;

              // Check for context comments (i18n: ...)
              let contextComment: string | undefined;

              // Standard comments (leading)
              const comment = checkComments(path.node) ||
                (path.parentPath?.node && checkComments(path.parentPath.node));

              // Sibling comments (JSX expression container before parent Element)
              const siblingComment = path.parentPath ? getContextFromSibling(path.parentPath) : undefined;

              contextComment = comment || siblingComment;

              const key = generateTranslationKey(
                rawText,
                options.config?.keyGenerationStrategy
              );

              namespaceMaps[currentNs][key] = rawText;
              if (contextComment) {
                namespaceMaps[currentNs][`${key}_comment`] = contextComment;
              }

              const replacement = t.jsxExpressionContainer(
                t.callExpression(t.identifier(options.fnName), [
                  t.stringLiteral(key),
                ])
              );

              path.replaceWith(replacement);
              modified = true;

              if (options.dryRun) {
                console.log(`[DRY RUN] ${file} (${currentNs}): ${rawText} -> ${key}`);
              }
            },

            StringLiteral(path: NodePath<t.StringLiteral>) {
              const value = path.node.value;

              // ✅ Check for context comments (i18n: ...)
              // Check the node or its parent (e.g. if inside specific call/JSX)
              let contextComment: string | undefined;

              // Check current node, parent, or 2nd parent (e.g. JSXAttribute -> JSXOpeningElement -> JSXElement?)
              // For JSX: Text -> JSXElement (parent).
              // For StringLiteral inside JSX: StringLiteral -> JSXAttribute -> JSXOpeningElement ...
              // Test case: {/* comment */} <h1>Text</h1>
              // Here comment is sibling?
              // Babel attaches 'leadingComments' to the subsequent node.
              // So 'Text' might have leadingComments? Or 'h1' has them?
              // If 'Text' is inside 'h1', 'h1' has the comments.
              // so `path.parentPath`?

              const comment = checkComments(path.node) ||
                (path.parentPath?.node && checkComments(path.parentPath.node)) ||
                (path.parentPath?.parentPath?.node && checkComments(path.parentPath.parentPath.node));

              if (comment) {
                contextComment = comment;
              } else {
                // Try finding sibling comment if inside JSX Element (e.g. Attribute -> OpeningElement -> Element)
                const elementPath = path.findParent(p => p.isJSXElement());
                if (elementPath) {
                  contextComment = getContextFromSibling(elementPath);
                }
              }

              // ✅ Skip import declarations
              if (path.findParent((p) => p.isImportDeclaration())) return;

              // ✅ Skip require('...') calls
              if (
                path.parentPath.isCallExpression() &&
                t.isIdentifier(path.parentPath.node.callee) &&
                path.parentPath.node.callee.name === "require"
              )
                return;

              // ✅ Skip if already translated
              if (
                path.parentPath.isCallExpression() &&
                path.parentPath.node.callee.type === "Identifier" &&
                path.parentPath.node.callee.name === options.fnName
              )
                return;

              if (
                !value ||
                value.length < (options.config?.minStringLength || 2) ||
                value.length > 80
              )
                return;
              if (!/[a-zA-Z]/.test(value)) return;

              const key = generateTranslationKey(
                value,
                options.config?.keyGenerationStrategy
              );
              // console.log(`DEBUG: key for "${value}" -> "${key}"`);

              namespaceMaps[currentNs][key] = value;
              if (contextComment) {
                namespaceMaps[currentNs][`${key}_comment`] = contextComment;
              }

              let replacement: t.Expression | t.JSXExpressionContainer;

              // ✅ Detect if inside ignored JSX attribute (direct or nested)
              const attributePath = path.findParent((p) => p.isJSXAttribute());
              if (attributePath && attributePath.isJSXAttribute()) {
                const attrName = attributePath.node.name;
                if (
                  t.isJSXIdentifier(attrName) &&
                  [
                    "data-testid",
                    "className",
                    "style",
                    "id",
                    "key",
                    "ref",
                    "width",
                    "height",
                    "href",
                    "src",
                    "type",
                    "rel",
                    "target",
                    "alt",
                    "placeholder",
                  ].includes(attrName.name)
                )
                  return;
              }

              // ✅ If inside JSX attribute (but not ignored), we need JSX wrapper
              if (path.parentPath.isJSXAttribute()) {
                // Double check we are direct child (standard string attr)
                replacement = t.jsxExpressionContainer(
                  t.callExpression(t.identifier(options.fnName), [
                    t.stringLiteral(key),
                  ])
                );
              } else {
                replacement = t.callExpression(t.identifier(options.fnName), [
                  t.stringLiteral(key),
                ]);
              }

              path.replaceWith(replacement);
              modified = true;

              if (options.dryRun) {
                console.log(
                  `[DRY RUN] ${file} (${currentNs}): "${value}" -> ${key}`
                );
              }
            },
          });

          if (!options.dryRun && modified) {
            const output = generate(ast).code;
            // Write file async
            await fsPromises.writeFile(file, output);
          }
        } catch (err) {
          console.error(`Error processing file ${file}: `, err);
        }
      })
    )
  );

  if (!options.dryRun) {
    if (outputDir !== ".") {
      await fsPromises.mkdir(outputDir, { recursive: true });
    }

    // Write all namespace files
    for (const [ns, map] of Object.entries(namespaceMaps)) {
      if (Object.keys(map).length === 0 && ns !== defaultNamespace) continue; // Skip empty non-default/extra namespaces if explicit? Actually keep them empty if created? 
      // Let's write them if they have content OR they are the expected output.
      if (Object.keys(map).length === 0 && !options.config?.namespaces) continue; // If no config, don't write empty 'common' if empty? No, we should writes.

      let targetFile = outputFile;
      if (options.config?.namespaces) {
        // If namespaces are used, outputFile is treated as base dir for default locale?
        // Or we append ns to outputDir?

        // Logic: if namespaces active, we construct file paths like `outputDir/ns.json` 
        // OR if targetLang is active `outputDir/lang/ns.json`.

        // Wait, existing logic for Lang:
        // `path.join(path.dirname(outputFile), `${options.lang}.json`)`

        // New logic:
        // If namespaces:
        //   Target File = `outputDir/ns.json` (for default/en)
        //   If --lang: `outputDir/ns.lang.json` ?? OR `outputDir/lang/ns.json`?
        //   Common pattern: `locales/en/common.json`.

        // Let's assume `outputFile` denotes the folder structure for the default file.
        // e.g. `locales/en.json` -> outputDir = `locales`

        // If namespaces active: `locales/common.json`, `locales/auth.json`.

        targetFile = path.join(outputDir, `${ns}.json`);
      }

      const mapToWrite = map;

      // Translation logic
      if (options.lang && options.lang !== "en") {
        const translated: Record<string, string> = {};

        for (const [key, text] of Object.entries(map)) {
          try {
            const res = await translate(text, { to: options.lang });
            console.log(`Translated [${ns}] "${text}" => "${res.text}"`);
            translated[key] = res.text;
          } catch (err) {
            console.warn(`Translation failed for "${text}"`, err);
            translated[key] = text;
          }
        }

        // If namespaces active: `locales/lang/ns.json` or `locales/ns.lang.json`?
        // Let's do `locales/lang.json` if single file, 
        // BUT if namespaces: `locales/ns.json` (en), `locales/ns_fr.json`?
        // OR `locales/fr/ns.json`.

        // Let's stick to `locales/fr.json` if NO namespaces (legacy).
        // If namespaces: `locales/fr/ns.json`? Or `locales/ns.fr.json`?
        // Complexity increase!

        // Simplified for this task:
        // If namespaces: write `outputDir/ns.json`. If lang available, write `outputDir/ns_lang.json` (flat).

        let langPath;
        if (options.config?.namespaces) {
          langPath = path.join(outputDir, `${ns}_${options.lang}.json`);
        } else {
          langPath = path.join(path.dirname(outputFile), `${options.lang}.json`);
        }

        await fsPromises.writeFile(langPath, JSON.stringify(translated, null, 2), "utf-8");

      } else {
        // Default language (usually EN)
        await fsPromises.writeFile(
          targetFile,
          JSON.stringify(mapToWrite, null, 2),
          "utf-8"
        );
      }
    }
  }
}
