// src/extractor.ts
import fs from "fs";
import { promises as fsPromises } from "fs"; // Async FS
import path from "path";
import * as babel from "@babel/core";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
import type { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getSourceFiles } from "./scanner.js";
import { generateTranslationKey } from "./utils.js";
import { translate } from '@vitalets/google-translate-api';
import pLimit from "p-limit";
import { minimatch } from "minimatch";
import prettier from "prettier";

async function translateWithRetry(text: string, options: any, retries = 5, delay = 2000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await translate(text, options);
    } catch (err: any) {
      if (i === retries - 1) throw err;
      if (err.name === 'TooManyRequestsError' || err.statusCode === 429) {
        console.warn(`[RateLimit] Too many requests. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
}

import { I18nTurboConfig } from "./config.js";

interface ExtractOptions {
  fnName: string;
  dryRun: boolean;
  merge: boolean;
  lang?: string;
  force?: boolean;
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

          const isInsideIgnoredElement = (path: NodePath<any>): boolean => {
            const parent = path.findParent(p => p.isJSXElement());
            if (parent && parent.isJSXElement()) {
              const opening = parent.node.openingElement;

              // 1. Check Tag Name
              if (t.isJSXIdentifier(opening.name)) {
                const tagName = opening.name.name;
                const ignoredTags = ['code', 'pre', 'script', 'style', 'kbd', 'samp', 'var', ...(options.config?.ignoreTags || [])];
                if (ignoredTags.includes(tagName)) {
                  return true;
                }
              }

              // 2. Check Attributes (e.g. className="notranslate", data-i18n-ignore)
              const attributes = opening.attributes;
              for (const attr of attributes) {
                if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                  // Check for 'data-i18n-ignore' (presence is enough)
                  if (attr.name.name === 'data-i18n-ignore') return true;

                  // Check for className="... notranslate ..."
                  if (attr.name.name === 'className' && t.isStringLiteral(attr.value)) {
                    if (attr.value.value.includes('notranslate')) return true;
                  }
                }
              }

              // Recurse up? findParent goes to closest. 
              // We should probably check ALL ancestors? 
              // path.findParent traverses up. But we only checked the immediatate closest JSXElement here.
              // To be robust, we should check if ANY ancestor is ignored. 
              // `path.findParent` stops at the *first* match.

              // Better logic: Find ANY parent that matches criteria.
              const ignoredParent = path.findParent(p => {
                if (!p.isJSXElement()) return false;

                const opening = p.node.openingElement;
                const ignoredTags = ['code', 'pre', 'script', 'style', ...(options.config?.ignoreTags || [])];
                if (t.isJSXIdentifier(opening.name) && ignoredTags.includes(opening.name.name)) return true;

                const attrs = opening.attributes;
                return attrs.some(attr => {
                  if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                    if (attr.name.name === 'data-i18n-ignore') return true;
                    if (attr.name.name === 'className' && t.isStringLiteral(attr.value) && attr.value.value.includes('notranslate')) return true;
                  }
                  return false;
                });
              });

              return !!ignoredParent;
            }
            return false;
          };

          traverse(ast, {
            CallExpression(path: NodePath<t.CallExpression>) {
              const callee = path.node.callee;
              // Check for t('key')
              if (
                t.isIdentifier(callee, { name: options.fnName }) &&
                path.node.arguments.length >= 1 && // Can have 2 args (options)
                t.isStringLiteral(path.node.arguments[0])
              ) {
                const key = path.node.arguments[0].value;
                // We found an existing key. Add it to the map so we can translate it to other languages.
                // The value stored in namespaceMaps will be the key itself (since we don't know the original string from code).
                // IMPORTANT: Only add if not already present (to avoid overwriting real text extracted from JSX in the same pass)
                if (!namespaceMaps[currentNs][key]) {
                  namespaceMaps[currentNs][key] = key;
                }

                if (options.dryRun) {
                  console.log(`[DRY RUN] ${file}: Found existing key "${key}"`);
                }
              }
            },

            JSXText(path: NodePath<t.JSXText>) {
              const rawText = path.node.value.trim();
              if (!rawText || /^\{.*\}$/.test(rawText)) return;

              // ✅ Check for minimum length and alphanumeric content
              if (rawText.length < (options.config?.minStringLength || 2)) return;
              if (!/[a-zA-Z]/.test(rawText)) return;

              // ✅ Check if inside ignored tags (code, pre, etc.)
              if (isInsideIgnoredElement(path)) return;

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

              // ✅ Check if inside ignored tags (code, pre, etc.)
              if (isInsideIgnoredElement(path)) return;

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
                    // "alt",          // Likely want to translate alt
                    // "placeholder",  // Likely want to translate placeholder
                    "path",            // React Router
                    "to",              // Link
                    "element",         // Route
                    "defaultLocale",   // I18nProvider
                    "value",           // Inputs
                    "name",            // Inputs
                    "htmlFor",         // Labels
                    "as"               // Polymorphic
                  ].includes(attrName.name)
                ) {
                  return;
                }
              }

              // ✅ Ignore TS Literal Types (e.g. type T = "value")
              if (path.parentPath.isTSLiteralType()) return;

              // ✅ Ignore Import/Export Sources (e.g. import ... from 'source')
              if (path.parentPath.isImportDeclaration()) return;
              if (path.parentPath.isExportAllDeclaration()) return;
              if (path.parentPath.isExportNamedDeclaration() && path.parentPath.node.source === path.node) return;

              // ✅ Ignore arguments to system functions (require, etc)
              const callExpr = path.findParent(p => p.isCallExpression());
              if (callExpr && callExpr.isCallExpression()) {
                const callee = callExpr.node.callee;
                // Ignore require('path') or console.log('...') although log might be translated? 
                // Let's safe ignore require/import.
                if (t.isIdentifier(callee) && ['require', 'import'].includes(callee.name)) {
                  return;
                }
              }

              // ✅ Check for ignore comments (// i18n-ignore)
              const hasIgnoreComment = (node: t.Node) => {
                return (
                  node.leadingComments?.some((c) => c.value.includes("i18n-ignore")) ||
                  node.trailingComments?.some((c) => c.value.includes("i18n-ignore"))
                );
              };

              if (
                hasIgnoreComment(path.node) ||
                (path.parentPath?.node && hasIgnoreComment(path.parentPath.node)) ||
                (path.parentPath?.parentPath?.node && hasIgnoreComment(path.parentPath.parentPath.node))
              ) {
                return;
              }

              // ✅ Ignore ObjectProperty keys/values for styles/config
              const objProp = path.findParent(p => p.isObjectProperty());
              if (objProp && objProp.isObjectProperty()) {
                // If this string is the KEY of an object property, it's usually not translatable unless computed.
                // But StringLiterals as keys are usually 'key': 'value'. Babel might treat them as keys.
                if (objProp.node.key === path.node) return; // Ignore keys

                // If it's the value: check the key name
                if (t.isIdentifier(objProp.node.key) || t.isStringLiteral(objProp.node.key)) {
                  const keyName = t.isIdentifier(objProp.node.key) ? objProp.node.key.name : objProp.node.key.value;
                  if (['className', 'style', 'id', 'width', 'height', 'color', 'backgroundColor', 'fill', 'stroke', 'd', 'type', 'key', 'ref', 'src', 'href', 'behavior'].includes(keyName)) {
                    return;
                  }
                }
              }
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

              // ✅ Check if inside ignored tags (code, pre, etc.)
              if (isInsideIgnoredElement(path)) return;

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

              // ✅ Skip common DOM identifiers
              if (path.parentPath.isCallExpression()) {
                const callee = path.parentPath.node.callee;
                let fnName = '';
                if (t.isIdentifier(callee)) {
                  fnName = callee.name;
                } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
                  fnName = callee.property.name;
                }

                if ([
                  'getElementById',
                  'querySelector',
                  'querySelectorAll',
                  'addEventListener',
                  'removeEventListener',
                  'postMessage',
                  'setAttribute',
                  'getAttribute',
                  'navigate', // React Router
                  'require',
                  'import'
                ].includes(fnName)) {
                  return;
                }
              }

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

              if (false) { /*
                const attrName = attributePath.node.name;
                console.log(`DEBUG: checking attr ${t.isJSXIdentifier(attrName) ? attrName.name : 'unknown'} for val ${value}`);
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
                    // "alt",          // Likely want to translate alt
                    // "placeholder",  // Likely want to translate placeholder
                    "path",            // React Router
                    "to",              // Link
                    "element",         // Route
                    "defaultLocale",   // I18nProvider
                    "value",           // Inputs
                    "name",            // Inputs
                    "htmlFor",         // Labels
                    "as"               // Polymorphic
                  ].includes(attrName.name)
                ) {
                  // console.log(`DEBUG: Ignored attribute ${attrName.name} for value ${value}`);
                  return;
                } else {
                  // console.log(`DEBUG: NOT Ignored attribute ${t.isJSXIdentifier(attrName) ? attrName.name : 'unknown'} for value ${value}`);
                }
              }

              */ }

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
            const output = generate(ast, { retainLines: true }).code;

            // Format with Prettier
            let formatted = output;
            try {
              const configFile = await prettier.resolveConfigFile(file);
              const options = await prettier.resolveConfig(file);
              formatted = await prettier.format(output, {
                ...options,
                filepath: file,
                parser: "typescript" // Fallback parser
              });
            } catch (err) {
              console.warn(`[Prettier] Failed to format ${file}, saving unformatted.`, err);
            }

            // Write file async
            await fsPromises.writeFile(file, formatted);
          }
        } catch (err) {
          console.error(`Error processing file ${file}: `, err);
        }
      })
    )
  );

  // Debug: Log total keys found per namespace
  Object.entries(namespaceMaps).forEach(([ns, map]) => {
    console.log(`[DEBUG] Namespace '${ns}' has ${Object.keys(map).length} keys found.`);
  });

  if (!options.dryRun) {

    // Debug: Log total keys found per namespace
    Object.entries(namespaceMaps).forEach(([ns, map]) => {
      console.log(`[DEBUG] Namespace '${ns}' has ${Object.keys(map).length} keys found.`);
    });

    if (!options.dryRun) {
      if (outputDir !== ".") {
        await fsPromises.mkdir(outputDir, { recursive: true });
      }

      // Write all namespace files
      for (const [ns, map] of Object.entries(namespaceMaps)) {
        if (Object.keys(map).length === 0 && ns !== defaultNamespace) {
          console.log(`[DEBUG] Skipping empty namespace '${ns}'`);
          continue;
        }
        // Let's write them if they have content OR they are the expected output.
        if (Object.keys(map).length === 0 && !options.config?.namespaces) {
          console.log(`[DEBUG] Skipping empty default namespace`);
          continue;
        }

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

          let langPath;
          if (options.config?.namespaces) {
            langPath = path.join(outputDir, `${ns}_${options.lang}.json`);
          } else {
            langPath = path.join(path.dirname(outputFile), `${options.lang}.json`);
          }

          // Load existing translations for this language if available
          let existingTranslations: Record<string, string> = {};
          if (fs.existsSync(langPath)) {
            try {
              existingTranslations = JSON.parse(await fsPromises.readFile(langPath, 'utf-8'));
            } catch (e) {
              console.warn(`[WARN] Could not parse existing translation file ${langPath}`);
            }
          }

          // Determine Base Locale (default 'en' or configured)
          let baseLocaleFile = targetFile; // Default to output file (if it is the base)
          if (options.config?.namespaces) {
            baseLocaleFile = path.join(outputDir, `${ns}.json`);
          } else {
            // If not namespaced, assume outputFile is the base (e.g., locales/en.json) 
            // UNLESS we are in a sub-lang file, then we need to find the base.
            // But 'outputFile' passed from CLI is usually the base "src dest/en.json"
            baseLocaleFile = outputFile;
          }

          let baseTranslations: Record<string, string> = {};
          if (fs.existsSync(baseLocaleFile)) {
            try {
              baseTranslations = JSON.parse(await fsPromises.readFile(baseLocaleFile, 'utf-8'));
            } catch (e) {
              console.warn(`[WARN] Could not parse base locale file ${baseLocaleFile}. Using extracted keys as fallback.`);
            }
          } else {
            console.warn(`[WARN] Base locale file ${baseLocaleFile} not found. Translation might be inaccurate (using keys).`);
          }


          const validEntries = Object.entries(map).filter(([key]) => !(!options.force && existingTranslations[key]));

          // Existing translations (preseve them)
          for (const [key, val] of Object.entries(existingTranslations)) {
            translated[key] = val;
          }

          // Batch processing
          const BATCH_SIZE = 50;
          const DELIMITER = "\n~~~~\n";

          const updates: Record<string, string> = {};

          // Chunking
          for (let i = 0; i < validEntries.length; i += BATCH_SIZE) {
            const chunk = validEntries.slice(i, i + BATCH_SIZE);

            // Resolve source text from base translations
            const textToTranslateObj = chunk.map(([key, value]) => {
              const baseText = baseTranslations[key];
              if (!baseText) {
                console.warn(`[WARN] Key "${key}" not found in base locale (${baseLocaleFile}). Using key/value from code as fallback.`);
                return { key, text: value || key }; // Fallback
              }
              return { key, text: baseText };
            });

            const chunkText = textToTranslateObj.map(c => c.text).join(DELIMITER);


            try {
              // Rate limit wait (still good to keep albeit shorter/less frequent)
              await new Promise((resolve) => setTimeout(resolve, 2000));

              console.log(`Translating batch ${i / BATCH_SIZE + 1}/${Math.ceil(validEntries.length / BATCH_SIZE)} (${chunk.length} items)...`);
              const res = await translateWithRetry(chunkText, { to: options.lang });
              const translatedTexts = res.text.split(DELIMITER.trim()); // Google sometimes trims spaces

              if (translatedTexts.length !== chunk.length) {
                console.warn(`[WARN] Batch translation count mismatch (Expected ${chunk.length}, got ${translatedTexts.length}). Falling back to individual translation for this batch.`);
                // Fallback
                for (const item of textToTranslateObj) {
                  try {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    const resSingle = await translateWithRetry(item.text, { to: options.lang });
                    updates[item.key] = resSingle.text;

                  } catch (e) {
                    console.warn(`Translation failed for "${item.text}"`, e);
                    updates[item.key] = item.text;
                  }
                }
              } else {
                chunk.forEach((entry, idx) => {
                  updates[entry[0]] = translatedTexts[idx].trim();
                  console.log(`Translated [${ns}] "${entry[1]}" => "${translatedTexts[idx].trim()}"`);
                });
              }
            } catch (err: any) {
              console.warn(`[Batch Failed] ${err.message}. Retrying individually...`);
              // Fallback individual
              for (const item of textToTranslateObj) {
                try {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  const resSingle = await translateWithRetry(item.text, { to: options.lang });
                  updates[item.key] = resSingle.text;

                } catch (e) {
                  console.warn(`Translation failed for "${item.text}"`, e);
                  updates[item.key] = item.text;

                }
              }
            }
          }

          // Merge updates
          Object.assign(translated, updates);

          await fsPromises.writeFile(langPath, JSON.stringify(translated, null, 2), "utf-8");

        } else {
          // Default Language Extraction (e.g. en.json)
          // We must PRESERVE existing values if they differ from keys, 
          // because if we extracted `t("key")`, the map value is "key".
          // We don't want to overwrite "key": "Real Text" with "key": "key".

          let existingContent: Record<string, string> = {};
          if (fs.existsSync(targetFile)) {
            try {
              existingContent = JSON.parse(await fsPromises.readFile(targetFile, 'utf-8'));
            } catch (e) {
              console.warn(`[WARN] Could not parse target file ${targetFile}`);
            }
          }

          const finalMap: Record<string, string> = { ...existingContent };

          // Merge newly found keys. If a key is new, default it to its value (often the key itself, or the string literal).
          // If it already exists, we prefer the existing content (which might be the actual text).
          for (const [key, val] of Object.entries(mapToWrite)) {
            if (!finalMap[key]) {
              finalMap[key] = val;
            }
          }

          await fsPromises.writeFile(
            targetFile,
            JSON.stringify(finalMap, null, 2),
            "utf-8"
          );
          console.log(`Extracted to ${targetFile} (Preserved existing values)`);

          // --- Lockfile Logic ---
          // Save a lockfile next to the output file (or in root)
          // File: i18n-turbo.lock.json in the same dir as config or output

          const lockfilePath = path.join(path.dirname(outputFile), 'i18n-turbo.lock.json');
          let lockfileData: Record<string, string> = {};

          if (fs.existsSync(lockfilePath)) {
            try {
              lockfileData = JSON.parse(await fsPromises.readFile(lockfilePath, 'utf-8'));
            } catch (e) { console.warn('[Lockfile] Could not parse existing lockfile'); }
          }

          // Update lockfile with current extraction (prefer new values? or keep old?)
          // We want the ORIGINAL source text.
          // mapToWrite contains key -> rawText (the value found in code).
          // If we found it in code, it is the truth.

          Object.entries(mapToWrite).forEach(([key, val]) => {
            if (key !== val) {
              // We found a real string value (different from key), so we update the lockfile.
              lockfileData[key] = val;
            } else {
              // discovered value is same as key (likely t('key') call)
              // Only set if not already present in lockfile, to avoid overwriting existing real text.
              if (!lockfileData[key]) {
                lockfileData[key] = val;
              }
            }
          });

          await fsPromises.writeFile(lockfilePath, JSON.stringify(lockfileData, null, 2), 'utf-8');
          console.log(`[Lockfile] Updated ${lockfilePath}`);
        }
      }
    }
  }
}
