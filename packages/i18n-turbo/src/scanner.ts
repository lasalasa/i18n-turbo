import { glob } from 'glob';

export async function getSourceFiles(dir: string, excludes: string[] = []): Promise<string[]> {
  console.log(`Scanning dir: ${dir}, excludes: ${excludes}`);
  const files = await glob(`${dir}/**/*.{js,jsx,ts,tsx}`, {
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**', ...excludes]
  });
  console.log(`Found ${files.length} files.`);
  return files;
}
