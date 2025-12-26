/**
 * i18n-turbo - Internationalization toolkit for React
 * 
 * This package provides:
 * - React components (I18nProvider, useTranslation) for runtime i18n
 * - CLI tool for extracting hardcoded strings from JSX/TSX files (run via CLI only)
 */

// React components and hooks
export {
    I18nProvider,
    useTranslation,
    createI18n,
    type I18nProviderProps,
    type I18nConfig,
    type I18nContextValue,
    type Translations,
    type TranslationDictionary,
    type InterpolationValues,
} from './react';

// Note: CLI functionality (extractStringsFromDirectory) is only available
// via the command line tool, not as a module export, since it uses Node.js APIs
// that are not compatible with browser environments.
