// bin/cli.ts or src/cli.ts

import path from 'path';
import fs from 'fs';
import { extractStringsFromDirectory } from './extractor.js';
import { reverseStringsFromDirectory } from './reverser.js';
import { loadConfig, I18nTurboConfig } from './config.js';
import { initConfig } from './init.js';

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

  const command = args[0];
  const isCommand = ['init', 'extract', 'trans'].includes(command);

  // Helper to get flag value (supports --flag or -f)
  const getFlagValue = (long: string, short: string) => {
    const longIndex = args.indexOf(long);
    if (longIndex !== -1 && args[longIndex + 1] && !args[longIndex + 1].startsWith('-')) {
      return args[longIndex + 1];
    }
    const shortIndex = args.indexOf(short);
    if (shortIndex !== -1 && args[shortIndex + 1] && !args[shortIndex + 1].startsWith('-')) {
      return args[shortIndex + 1];
    }
    return undefined;
  };

  const hasFlag = (long: string, short: string) => {
    return args.includes(long) || args.includes(short);
  };

  // Show Help
  if (hasFlag('--help', '-h')) {
    console.log(`
Usage: i18n-turbo <command> [options]

Commands:
  init      Initialize configuration file
  extract   Extract strings (default)
  trans     Extract and translate

Options:
  --lang, -l    Target language code
  --input, -i   Input directory
  --output, -o  Output file
  --dry-run, -d Dry run mode
  --force, -f   Force overwrite
  --merge       Merge with existing translations
  --reverse     Reverse translation to source
  --help, -h    Show this help message
`);
    process.exit(0);
  }

  // Command: Init
  if (command === 'init') {
    await initConfig();
    process.exit(0);
  }

  // Parse Options
  const lang = getFlagValue('--lang', '-l') || config.targetLang;
  const fnName = getFlagValue('--fn', '') || config.translationFunction || 't';
  const dryRun = hasFlag('--dry-run', '-d');
  const force = hasFlag('--force', '-f');
  const merge = hasFlag('--merge', ''); // No short alias for merge yet

  // Determine Input/Output
  // If command is present, positional args start at index 1. Else at 0.
  const positionalStartIndex = isCommand ? 1 : 0;

  // Positional args (excluding flags and their values)
  const positionalArgs: string[] = [];
  for (let i = positionalStartIndex; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('-')) {
      // Check if it consumes next arg
      if (['--lang', '-l', '--fn', '--input', '-i', '--output', '-o'].includes(arg)) {
        i++;
      }
    } else {
      positionalArgs.push(arg);
    }
  }

  const inputDir = getFlagValue('--input', '-i') || positionalArgs[0] || config.input;
  const outputFile = getFlagValue('--output', '-o') || positionalArgs[1] || config.output;

  if (!inputDir || !outputFile) {
    console.error('❌ Missing configuration. Please run "npx i18n-turbo init" or provide input/output.');
    process.exit(1);
  }


  const resolvedInputDir = path.resolve(inputDir);
  const resolvedOutputFile = path.resolve(outputFile);

  if (!fs.existsSync(resolvedInputDir)) {
    console.error(`❌ Input directory not found: ${resolvedInputDir}`);
    process.exit(1);
  }

  // Construct Options Object
  const options: CLIOptions = {
    fnName,
    dryRun,
    merge,
    lang, // Default to extracted lang or config lang
    force,
    config,
  };

  // Command Logic: Enforce command responsibilities
  if (command === 'trans') {
    console.log(`Running translation mode for target: ${lang}`);
  } else if (command === 'extract' || !isCommand) {
    // If not explicitly asked to translate via flag, ensure we default to base extraction
    if (!hasFlag('--lang', '-l')) {
      options.lang = undefined;
    }
  }

  if (args.includes('--reverse')) {
    await reverseStringsFromDirectory(resolvedInputDir, resolvedOutputFile, fnName);
    process.exit(0);
  }

  await extractStringsFromDirectory(resolvedInputDir, resolvedOutputFile, options);
}
