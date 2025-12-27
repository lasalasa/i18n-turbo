import fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import _traverse, { NodePath } from "@babel/traverse";
// @ts-ignore
const traverse = _traverse.default || _traverse;
import * as t from "@babel/types";
import _generate from "@babel/generator";
// @ts-ignore
const generate = _generate.default || _generate;
import { getSourceFiles } from "./scanner.js";

export async function reverseStringsFromDirectory(
  inputDir: string,
  i18nFile: string,
  fnName: string = "t"
): Promise<void> {
  try {
    const translationMap: Record<string, string> = JSON.parse(
      fs.readFileSync(i18nFile, "utf-8")
    );

    // --- Lockfile Logic ---
    const lockfilePath = path.join(path.dirname(i18nFile), 'i18n-turbo.lock.json');
    let lockfileData: Record<string, string> | null = null;
    if (fs.existsSync(lockfilePath)) {
      try {
        lockfileData = JSON.parse(fs.readFileSync(lockfilePath, 'utf-8'));
        console.log(`[Reverser] Loaded lockfile from ${lockfilePath}`);
      } catch (e) {
        console.warn(`[Reverser WARN] Failed to parsing lockfile`);
      }
    }

    const files = await getSourceFiles(inputDir);

    for (const file of files) {
      const code = fs.readFileSync(file, "utf-8");
      const ast = babel.parseSync(code, {
        filename: file,
        presets: ["@babel/preset-typescript", "@babel/preset-react"],
      });

      if (!ast) continue;

      let modified = false;

      traverse(ast, {
        CallExpression(path: NodePath<t.CallExpression>) {
          const callee = path.node.callee;
          const args = path.node.arguments;

          if (t.isIdentifier(callee, { name: fnName })) {

            // Check arguments: t("key") or t("key", { ... })
            if (args.length >= 1 && t.isStringLiteral(args[0])) {
              const key = args[0].value;

              // 1. Resolve Original Text
              // Priority: Lockfile -> Translation Map -> Fallback (Interactive/Skip)
              let originalText = lockfileData?.[key] || translationMap[key];

              if (typeof originalText !== "string") {
                console.warn(`[Reverser WARN] Key "${key}" not found in lockfile or translation map. Skipping.`);
                return;
              }

              // 2. Handle Interpolation (Arguments)
              // If we have a second argument, it's likely variables: t("welcome", { name: userName })
              let replacementNode: t.Expression | t.JSXExpressionContainer | t.JSXText | null = null;

              if (args.length > 1 && t.isObjectExpression(args[1])) {
                // Complexity: Reconstructing string with variables.
                // We need to match {{var}} in originalText with properties in the object.

                // Regex to find placeholders: {{name}}, {name}, etc. 
                // i18next uses {{name}} by default.

                // Simple strategy: Replace {{prop}} with ${value_expression} and create a TemplateLiteral

                const props = args[1].properties;
                const propMap: Record<string, t.Expression> = {};

                props.forEach(prop => {
                  if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                    if (t.isExpression(prop.value)) { // Ensure it's an expression (not Pattern/Rest)
                      propMap[prop.key.name] = prop.value as t.Expression;
                    }
                  }
                });

                // Parse parts: "Hello {{name}}!" -> ["Hello ", "name", "!"]
                // We can use a regex to split.
                const parts = originalText.split(/\{\{([^}]+)\}\}/g); // Split by {{var}}

                if (parts.length > 1) {
                  const quasis: t.TemplateElement[] = [];
                  const expressions: t.Expression[] = [];

                  let currentQuasi = "";

                  for (let i = 0; i < parts.length; i++) {
                    if (i % 2 === 0) {
                      // Text part
                      currentQuasi = parts[i];
                      // We need to push the quasi, but looking ahead if it's the last one
                      // Actually, TemplateLiteral construction is:
                      // quasis: [ "Hello ", "!" ] (cooked/raw)
                      // exprs:  [ nameVar ]
                      // Length of quasis is always exprs.length + 1

                      quasis.push(t.templateElement({ raw: currentQuasi, cooked: currentQuasi }, i === parts.length - 1));

                    } else {
                      // Variable part (e.g. "name")
                      const varName = parts[i].trim();
                      if (propMap[varName]) {
                        expressions.push(propMap[varName]);
                      } else {
                        console.warn(`[Reverser WARN] Variable "${varName}" in translation "${originalText}" not found in t() arguments.`);
                        // Fallback? convert to string literal "${varName}" ??
                        // For now, put undefined or a placeholder.
                        expressions.push(t.identifier("undefined"));
                      }
                    }
                  }

                  replacementNode = t.templateLiteral(quasis, expressions);
                } else {
                  // No interpolation found in string despite args? 
                  // Just use string literal
                  replacementNode = t.stringLiteral(originalText);
                }

              } else {
                // No arguments or non-object arg. Just string literal.
                replacementNode = t.stringLiteral(originalText);
              }

              if (replacementNode) {
                const parent = path.parentPath;

                if (parent?.isJSXExpressionContainer()) {
                  const containerParent = parent.parentPath;
                  // Case: <div attr={t('key')} />
                  if (
                    containerParent?.isJSXAttribute() &&
                    containerParent.node.value === parent.node
                  ) {
                    if (t.isStringLiteral(replacementNode)) {
                      containerParent.node.value = replacementNode;
                      parent.remove();
                    } else {
                      // Template literal in attribute: attr={`Hello ${name}`}
                      // JSXExpressionContainer is needed: attr={ `...` }
                      // So we just replace the call expression inside the container with the template literal
                      path.replaceWith(replacementNode);
                    }
                  } else {
                    // Case: <div>{t('key')}</div>
                    if (t.isStringLiteral(replacementNode)) {
                      // <div>{"Text"}</div>  -> <div>Text</div>
                      parent.replaceWith(t.jsxText(replacementNode.value));
                    } else {
                      // <div>{`Hello ${name}`}</div>
                      path.replaceWith(replacementNode);
                    }
                  }
                } else {
                  // Regular JS: const x = t('key');
                  path.replaceWith(replacementNode);
                }

                modified = true;
              }
            }
          }
        },
      });

      if (modified) {
        const output = generate(ast, { retainLines: true }).code;
        fs.writeFileSync(file, output, "utf-8");
        console.log(`[Reverser] Updated ${file}`);
      }
    }
  } catch (err) {
    console.error("[Reverser Error]", err);
    throw err;
  }
}
