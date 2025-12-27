import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

export async function initConfig(cwd: string = process.cwd()) {
    const configPath = path.join(cwd, 'i18n-turbo.config.cjs');

    if (fs.existsSync(configPath)) {
        console.warn('⚠️  i18n-turbo.config.cjs already exists.');
        return;
    }

    const response = await prompts([
        {
            type: 'text',
            name: 'targetLang',
            message: 'What is the default target language?',
            initial: 'en'
        },
        {
            type: 'text',
            name: 'input',
            message: 'Where are your source files located?',
            initial: 'src'
        },
        {
            type: 'text',
            name: 'output',
            message: 'Where should the translation file be generated?',
            initial: (prev, values) => {
                const lang = values.targetLang || 'en';
                return `src/locales/${lang}.json`;
            }
        }
    ]);

    // Handle cancellation
    if (!response.targetLang || !response.input || !response.output) {
        console.log('❌ Init cancelled.');
        return;
    }

    const content = `/** @type {import('i18n-turbo').I18nTurboConfig} */
module.exports = {
  // Parsing options
  translationFunction: 't', // The name of your translation function (default: 't')
  minStringLength: 2, // Minimum length of strings to extract
  
  // Output options 
  targetLang: '${response.targetLang}', // Default source language
  secondaryLanguages: [], // List of other languages (e.g. ['es', 'fr'])
  input: '${response.input}', // Source directory to scan
  output: '${response.output}', // Path to the default language file

  keyGenerationStrategy: 'snake_case', // 'snake_case' | 'camelCase' | 'hash'
  
  // Advanced
  excludePatterns: ['**/*.test.tsx', '**/stories/**'],
  // ignoreTags: ['code', 'pre'], to exclude
};
`;

    fs.writeFileSync(configPath, content, 'utf-8');
    console.log('✅ Created i18n-turbo.config.cjs');
    console.log('You can now run: npx i18n-turbo');
}
