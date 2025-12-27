/** @type {import('i18n-turbo').I18nTurboConfig} */
module.exports = {
  // Parsing options
  translationFunction: 't', // The name of your translation function (default: 't')
  minStringLength: 2, // Minimum length of strings to extract

  // Output options 
  targetLang: 'en', // Default source language
  secondaryLanguages: [], // List of other languages (e.g. ['es', 'fr'])
  input: 'src', // Source directory to scan
  output: 'src/locales/en.json', // Path to the default language file

  keyGenerationStrategy: 'snake_case', // 'snake_case' | 'camelCase' | 'hash'

  // Advanced
  excludePatterns: [], // Glob patterns to exclude
  ignoreTags: ['scrollIntoView', 'setActiveTab']
};
