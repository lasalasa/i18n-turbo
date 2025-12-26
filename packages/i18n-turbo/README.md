# i18n-turbo

> 🚀 **Turbocharge your i18n workflow.**
> Extract hardcoded strings from JSX/TSX/JS/TS files and export them to an i18n JSON format — with minimal configuration and maximum speed.

## Features

- ⚡ **Blazing Fast**: Asynchronous, parallel file processing for large codebases.
- 🎯 **Smart Extraction**: Detects strings in JSX text, attributes, and variables.
- 📁 **Namespaces**: Organize translations into multiple files (e.g., `auth.json`, `common.json`) based on file paths.
- 💬 **Context Support**: Extract comments (`i18n: ...`) as translation context for translators.
- 🔢 **Pluralization**: Automatically detects singular/plural patterns in ternary operators.
- 🔧 **Configs**: Flexible `i18n-turbo.config.js` for custom key strategies, exclusions, and more.
- 🔄 **Reverse Mode**: Revert `t('key')` back to original strings (great for refactoring).

## Install

```bash
npm install -g i18n-turbo
```

## Usage

```bash
i18n-turbo <input-dir> <output-file> [options]
```

### Examples

**Basic Extraction:**
```bash
i18n-turbo ./src ./locales/en.json
```

**Translate to French:**
```bash
i18n-turbo ./src ./locales/en.json --lang fr
```

**Dry Run (Preview changes):**
```bash
i18n-turbo ./src ./locales/en.json --dry-run
```

**Update existing translations:**
```bash
i18n-turbo ./src ./locales/en.json --merge
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

  // Default target language for machine translation
  targetLang: 'es'
};
```

## Advanced Features

### Namespaces
Control where your strings go by defining namespaces.
If you configure `namespaces`, `i18n-turbo` will output separate files in the output directory instead of a single file.

```javascript
// config
namespaces: {
  'src/auth/**': 'auth',
}
// Output: locales/auth.json, locales/common.json
```

### Context Extraction
Provide context to translators by adding comments starting with `i18n:`.
The tool is smart enough to find comments attached to the node or its JSX siblings.

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
`i18n-turbo` detects simple pluralization patterns in your code.

**Input:**
```tsx
<p>{count === 1 ? "One item" : "Many items"}</p>
```

**Output:**
Replaces with `t('one_item')` and `t('many_items')` (Base support).
*Future updates will implement automatic `t('key', { count })` merging.*

## Key Generation Strategies

- **snake_case**: `Hello World` -> `hello_world` (Default)
- **camelCase**: `Hello World` -> `helloWorld`
- **hash**: `Hello World` -> `a1b2c3d4` (Useful for stable keys regardless of content)
- **Custom**:
  ```javascript
  keyGenerationStrategy: (text) => text.toUpperCase().replace(/\s+/g, '_')
  ```

## License

MIT
