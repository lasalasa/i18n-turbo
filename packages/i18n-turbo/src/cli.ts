// bin/cli.ts or src/cli.ts

import path from 'path';
import { extractStringsFromDirectory } from './extractor.js';
import { reverseStringsFromDirectory } from './reverser.js';
import { loadConfig, I18nTurboConfig } from './config.js';

interface CLIOptions {
  fnName: string;
  dryRun: boolean;
  merge: boolean;
  lang?: string;
  force?: boolean;
  config?: I18nTurboConfig;
}

export async function runCLI() {
  const config = loadConfig();
  const args = process.argv.slice(2);
  const inputDir = args[0] || './src';
  const outputFile = args[1] || './locales/en.json';

  const fnNameIndex = args.indexOf('--fn');
  // CLI flag takes precedence over config
  const fnName = fnNameIndex !== -1 && args[fnNameIndex + 1]
    ? args[fnNameIndex + 1]
    : (config.translationFunction || 't');

  const langIndex = args.indexOf('--lang');
  const lang = langIndex !== -1 && args[langIndex + 1]
    ? args[langIndex + 1]
    : config.targetLang;

  const options: CLIOptions = {
    fnName,
    dryRun: args.includes('--dry-run'),
    merge: args.includes('--merge'),
    lang,
    force: args.includes('--force'),
    config,
  };

  const resolvedInputDir = path.resolve(inputDir);
  const resolvedOutputFile = path.resolve(outputFile);

  if (args.includes('--reverse')) {
    await reverseStringsFromDirectory(resolvedInputDir, resolvedOutputFile, fnName);
    process.exit(0);
  }

  await extractStringsFromDirectory(resolvedInputDir, resolvedOutputFile, options);
}
