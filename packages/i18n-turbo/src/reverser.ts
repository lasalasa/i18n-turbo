import fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { getSourceFiles } from "./scanner";

export async function reverseStringsFromDirectory(
  inputDir: string,
  i18nFile: string,
  fnName: string = "t"
): Promise<void> {
  const translationMap: Record<string, string> = JSON.parse(
    fs.readFileSync(i18nFile, "utf-8")
  );

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

        if (
          t.isIdentifier(callee, { name: fnName }) &&
          args.length === 1 &&
          t.isStringLiteral(args[0])
        ) {
          const key = args[0].value;
          const originalText = translationMap[key];

          if (typeof originalText === "string") {
            const parent = path.parentPath;

            if (parent?.isJSXExpressionContainer()) {
              const containerParent = parent.parentPath;

              if (
                containerParent?.isJSXAttribute() &&
                containerParent.node.value === parent.node
              ) {
                // If the expression is inside an attribute, set attribute value to string literal
                containerParent.node.value = t.stringLiteral(originalText);
                parent.remove(); // Remove the expression container if still present
              } else {
                // Otherwise, it's a JSX child
                parent.replaceWith(t.jsxText(originalText));
              }
            } else {
              // Not in JSX, just replace with a string literal
              path.replaceWith(t.stringLiteral(originalText));
            }

            modified = true;
          }
        }
      },
    });

    if (modified) {
      const output = generate(ast).code;
      fs.writeFileSync(file, output, "utf-8");
    }
  }
}
