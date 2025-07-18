import fs from 'fs';
import path from 'path';
import * as babel from '@babel/core';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import generate from '@babel/generator';
import { getSourceFiles } from './scanner';

export function reverseStringsFromDirectory(
  inputDir: string,
  i18nFile: string,
  fnName: string = 't'
): void {
  const translationMap: Record<string, string> = JSON.parse(fs.readFileSync(i18nFile, 'utf-8'));

  const files = getSourceFiles(inputDir);

  for (const file of files) {
    const code = fs.readFileSync(file, 'utf-8');
    const ast = babel.parseSync(code, {
      filename: file,
      presets: ['@babel/preset-typescript', '@babel/preset-react'],
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

          if (typeof originalText === 'string') {
            path.replaceWith(t.stringLiteral(originalText));
            modified = true;
          }
        }
      },
    });

    if (modified) {
      const output = generate(ast).code;
      fs.writeFileSync(file, output, 'utf-8');
    }
  }
}
