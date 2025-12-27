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

### 1. Initialize
Set up your project interactively:
```bash
npx i18n-turbo init
```
Follow the prompts to configure your source folder, target language, and output path.

### 2. Extract Strings
Scan your code and update your base locale file (e.g., `en.json`).
```bash
npx i18n-turbo extract
```
*or simply:*
```bash
npx i18n-turbo
```

### 3. Translate
Extract strings and automatically translate them to other languages using Google Translate.
```bash
npx i18n-turbo trans --lang fr
```
*Short alias:*
```bash
npx i18n-turbo trans -l fr
```

### Commands & Options

| Command | Description |
| :--- | :--- |
| `init` | Initialize configuration file |
| `extract` | Extract strings (Default) |
| `trans` | Extract and translate |

| Option | Alias | Description |
| :--- | :--- | :--- |
| `--lang` | `-l` | Target language code |
| `--input` | `-i` | Input directory |
| `--output` | `-o` | Output file path |
| `--dry-run` | `-d` | Simulate without writing files |
| `--force` | `-f` | Overwrite existing keys |
| `--merge` | | Merge with existing translations |
| `--reverse` | | Restore original text from keys |

## Configuration

Create an `i18n-turbo.config.js` (or `.cjs`) file in your project root to customize behavior.

```javascript
// i18n-turbo.config.js (or .cjs)
/** @type {import('i18n-turbo').I18nTurboConfig} */
module.exports = {
  // Main Options
  input: 'src', 
  output: 'src/locales/en.json',
  targetLang: 'en',
  secondaryLanguages: ['es', 'fr', 'de'],

  // Parsing options
  translationFunction: 't',
  minStringLength: 2,

  // Key Generation
  // Options: 'snake_case', 'camelCase', 'hash'
  keyGenerationStrategy: 'snake_case',

  // Advanced
  excludePatterns: ['**/*.test.tsx', '**/stories/**'],

  // Namespaces (optional)
  namespaces: {
    'common': 'src/components/**',
    'auth': 'src/features/auth/**'
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

### Ignoring Content
You can exclude specific content from extraction in several ways:

**1. Data Attribute (for JSX elements):**
```tsx
<div data-i18n-ignore>Do Not Translate</div>
```

**2. Ignore Comments (for lines/logic):**
Use `// i18n-ignore` or `/* i18n-ignore */` to skip specific lines or expressions.
```typescript
// i18n-ignore
element.scrollIntoView({ behavior: "smooth" });

const type = "preview" /* i18n-ignore */;
```

**3. Automatic Exclusion:**
Common non-translatable properties are automatically ignored:
`className`, `style`, `id`, `width`, `height`, `src`, `href`, `behavior`, `ref`, `key`, `type`...

**4. Global Config:**
```javascript
// i18n-turbo.config.js
module.exports = {
  ignoreTags: ['code', 'style', 'script'],
};
```

### Lockfile & Safety
`i18n-turbo` creates an `i18n-turbo.lock.json` file to map generated keys back to their original source text.
- **Data Preservation**: It ensures that running `extract` multiple times doesn't lose your original text.
- **Reverse Mode**: Enables `npx i18n-turbo --reverse` to restore your codebase to its original state using the lockfile data.

### Auto-Formatting
The CLI automatically formats your code using **Prettier** after modification, ensuring your code style remains consistent.

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
