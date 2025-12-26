import { glob } from 'glob';

export async function getSourceFiles(dir: string, excludes: string[] = []): Promise<string[]> {
  return glob(`${dir}/**/*.{js,jsx,ts,tsx}`, {
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**', ...excludes]
  });
}
