// bin/cli.ts or src/cli.ts

import path from 'path';
import { extractStringsFromDirectory } from './extractor';
import { reverseStringsFromDirectory } from './reverser';

interface CLIOptions {
  fnName: string;
  dryRun: boolean;
  merge: boolean;
  lang?: string;
}

export async function runCLI() {
  const args = process.argv.slice(2);
  const inputDir = args[0] || './src';
  const outputFile = args[1] || './locales/en.json';

  const fnNameIndex = args.indexOf('--fn');
  const fnName = fnNameIndex !== -1 && args[fnNameIndex + 1] ? args[fnNameIndex + 1] : 't';

  const langIndex = args.indexOf('--lang');
  const lang = langIndex !== -1 && args[langIndex + 1] ? args[langIndex + 1] : undefined;

  const options: CLIOptions = {
    fnName,
    dryRun: args.includes('--dry-run'),
    merge: args.includes('--merge'),
    lang,
  };

  const resolvedInputDir = path.resolve(inputDir);
  const resolvedOutputFile = path.resolve(outputFile);

  if (args.includes('--reverse')) {
    await reverseStringsFromDirectory(resolvedInputDir, resolvedOutputFile, fnName);
    process.exit(0);
  }

  await extractStringsFromDirectory(resolvedInputDir, resolvedOutputFile, options);
}
