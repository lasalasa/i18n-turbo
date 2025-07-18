// src/scanner.ts
import * as glob from 'glob';

export function getSourceFiles(dir: string): string[] {
  return glob.sync(`${dir}/**/*.{js,jsx,ts,tsx}`, {
    nodir: true
  });
}
