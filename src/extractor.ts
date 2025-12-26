// src/extractor.ts
import fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";
import { getSourceFiles } from "./scanner";
import { generateTranslationKey } from "./utils";
import { translate } from '@vitalets/google-translate-api';

interface ExtractOptions {
  fnName: string;
  dryRun: boolean;
  merge: boolean;
  lang?: string;
}

export async function extractStringsFromDirectory(
  inputDir: string,
  outputFile: string,
  options: ExtractOptions
): Promise<void> {
  let translationMap: Record<string, string> = {};

  if (options.merge && fs.existsSync(outputFile)) {
    try {
      translationMap = JSON.parse(fs.readFileSync(outputFile, "utf-8"));
    } catch {
      console.warn(`[WARN] Could not parse ${outputFile}, starting fresh.`);
    }
  }

  const files = getSourceFiles(inputDir);

  for (const file of files) {
    const code = fs.readFileSync(file, "utf-8");
    const ast = babel.parseSync(code, {
      filename: file,
      presets: ["@babel/preset-typescript", "@babel/preset-react"],
    });

    if (!ast) continue;

    let modified = false;

    traverse(ast, {
      JSXText(path: NodePath<t.JSXText>) {
        const rawText = path.node.value.trim();
        if (!rawText || /^\{.*\}$/.test(rawText)) return;

        const key = generateTranslationKey(rawText);
        translationMap[key] = rawText;

        const replacement = t.jsxExpressionContainer(
          t.callExpression(t.identifier(options.fnName), [t.stringLiteral(key)])
        );

        path.replaceWith(replacement);
        modified = true;

        if (options.dryRun) {
          console.log(`[DRY RUN] ${file}: ${rawText} -> ${key}`);
        }
      },

      StringLiteral(path: NodePath<t.StringLiteral>) {
        const value = path.node.value;

        // ✅ Skip import declarations
        if (path.findParent((p) => p.isImportDeclaration())) return;

        // ✅ Skip require('...') calls
        if (
          path.parentPath.isCallExpression() &&
          t.isIdentifier(path.parentPath.node.callee) &&
          path.parentPath.node.callee.name === 'require'
        ) return;

        // ✅ Skip if already translated
        if (
          path.parentPath.isCallExpression() &&
          path.parentPath.node.callee.type === "Identifier" &&
          path.parentPath.node.callee.name === options.fnName
        )
          return;

        if (!value || value.length < 2 || value.length > 80) return;
        if (!/[a-zA-Z]/.test(value)) return;

        const key = generateTranslationKey(value);
        translationMap[key] = value;

        let replacement: t.Expression | t.JSXExpressionContainer;

        // ✅ Detect if inside JSX attribute
        if (path.parentPath.isJSXAttribute()) {
          const attrName = path.parentPath.node.name;
          if (t.isJSXIdentifier(attrName) && attrName.name === 'data-testid') return;

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
          console.log(`[DRY RUN] ${file}: "${value}" -> ${key}`);
        }
      },
    });

    if (!options.dryRun && modified) {
      const output = generate(ast).code;
      fs.writeFileSync(file, output);
    }
  }

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });

    if (options.lang && options.lang !== "en") {
      const translated: Record<string, string> = {};
      for (const [key, text] of Object.entries(translationMap)) {
        try {
          const res = await translate(text, { to: options.lang });
          console.log(`Translated "${text}" => "${res.text}"`);
          translated[key] = res.text;
        } catch (err) {
          console.warn(`Translation failed for "${text}"`, err);
          translated[key] = text;
        }
      }

      const langPath = path.join(
        path.dirname(outputFile),
        `${options.lang}.json`
      );
      fs.writeFileSync(langPath, JSON.stringify(translated, null, 2), "utf-8");
    } else {
      fs.writeFileSync(
        outputFile,
        JSON.stringify(translationMap, null, 2),
        "utf-8"
      );
    }
  }
}
