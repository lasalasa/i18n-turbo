# i18n-turbo

> 🚀 **Turbocharge your i18n workflow.**
> Extract hardcoded strings from JSX/TSX/JS/TS files and export them to an i18n JSON format — with minimal configuration and maximum speed.

## Features

- ⚡ **Blazing Fast**: Asynchronous, parallel file processing for large codebases.
- 🎯 **Smart Extraction**: Detects strings in JSX text, attributes, and variables.
- ⚛️ **React Integration**: Built-in `I18nProvider` and `useTranslation` hook for type-safe internalization.
- 📁 **Namespaces**: Organize translations into multiple files (e.g., `auth.json`, `common.json`) based on file paths.
- 💬 **Context Support**: Extract comments (`i18n: ...`) as translation context for translators.
- 🤖 **Auto Translation**: Automatically translate missing keys to other languages (e.g. `--lang es`) using Google Translate.
- 🔧 **Configs**: Flexible `i18n-turbo.config.js` for custom key strategies, namespaces, and exclusions.
- 🔄 **Reverse Mode**: Revert `t('key')` back to original strings (great for refactoring).

## Install

```bash
npm install i18n-turbo
```

## React Integration

Wrap your app with `I18nProvider` and use the `useTranslation` hook.

```tsx
// src/App.tsx
import { I18nProvider, useTranslation } from 'i18n-turbo';
import en from './locales/en.json';
import es from './locales/es.json';

const translations = { en, es };

export default function App() {
  return (
    <I18nProvider translations={translations} defaultLocale="en">
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t, lang, setLang } = useTranslation();
  
  return (
    <div>
      <h1>{t("hello_world")}</h1>
      <button onClick={() => setLang('es')}>Español</button>
    </div>
  );
}
```

## CLI Usage

Run the CLI to extract strings and manage translations.

```bash
npx i18n-turbo <input-dir> <output-file> [options]
```

### Examples

**Basic Extraction:**
Extract strings from `./src` to `./locales/en.json`.
```bash
npx i18n-turbo ./src ./locales/en.json
```

**Add a New Language:**
Translate extracted strings to French (`fr`).
```bash
npx i18n-turbo ./src ./locales/en.json --lang fr
```

**Update Translations:**
Merge new keys without overwriting existing manual translations.
```bash
npx i18n-turbo ./src ./locales/en.json --merge
```

**Force Update:**
Re-translate all keys (overwrite everything).
```bash
npx i18n-turbo ./src ./locales/en.json --force
```

**Reverse Extraction:**
Restore original text from keys (undo `t('key')` replacement).
```bash
npx i18n-turbo ./src ./locales/en.json --reverse
```

## Configuration

Create an `i18n-turbo.config.js` file in your project root to customize behavior.

```javascript
// i18n-turbo.config.js
module.exports = {
  // Function Name (default: 't')
  translationFunction: 't',

  // String Length Threshold (default: 2)
  minStringLength: 3,

  // Key Generation
  // Options: 'snake_case', 'camelCase', 'hash', or function(text)
  keyGenerationStrategy: 'snake_case',

  // Exclude directories/files (glob patterns)
  excludePatterns: ['**/*.test.tsx', '**/stories/**'],

  // Namespaces (Map source globs to namespace files)
  namespaces: {
    'src/features/auth/**': 'auth',
    'src/features/dashboard/**': 'dashboard',
    'src/components/**': 'common',
  },
};
```

## Advanced Features

### Context Extraction
Provide context to translators by adding comments starting with `i18n:`.

**Input:**
```tsx
{/* i18n: Title for the landing page */}
<h1>Welcome Home</h1>

const label = "Submit"; // i18n: Button label
```

**Output (`en.json`):**
```json
{
  "welcome_home": "Welcome Home",
  "welcome_home_comment": "Title for the landing page",
  "submit": "Submit",
  "submit_comment": "Button label"
}
```

### Pluralization
`i18n-turbo` detects simple ternary plurals.

**Input:**
```tsx
<p>{count === 1 ? "One item" : "Many items"}</p>
```

**Output:**
Replaces with `t('one_item')` and `t('many_items')`.

## License

MIT
