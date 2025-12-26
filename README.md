# i18n-turbo 🚀

> **Supercharge your React internationalization workflow.**
> Automated extraction, safe type-checking, and instant translation for modern web apps.

[![npm version](https://img.shields.io/npm/v/i18n-turbo.svg)](https://www.npmjs.com/package/i18n-turbo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Packages

This monorepo contains the following packages:

| Package | Description | Version |
|---------|-------------|---------|
| [**i18n-turbo**](./packages/i18n-turbo) | The core CLI tool and React library. **[Read Documentation](./packages/i18n-turbo/README.md)** | [![npm](https://img.shields.io/npm/v/i18n-turbo)](https://www.npmjs.com/package/i18n-turbo) |
| [**playground**](./packages/playground) | Interactive demo app using React + Vite. | - |

## ✨ Features

- **Automated Extraction**: Scans your code for strings and generates JSON locale files.
- **Type Safety**: Built with TypeScript for robust development.
- **Context Aware**: Extracts developer comments to assist translators.
- **No Runtime Overhead**: Zero-dependencies solution for maximizing performance.
- **Playground**: Includes a full example app to demonstrate capabilities.

## 🛠️ Development

### Prerequisites

- Node.js >= 18
- npm >= 9

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Library**
   ```bash
   npm run build -w packages/i18n-turbo
   ```

3. **Run the Playground**
   ```bash
   npm run dev -w packages/playground
   ```

## 🌍 Workflow Example

To extract strings from the playground application:

```bash
# Extract to English
npm run i18n:extract -w packages/playground

# Add a new language (e.g., Spanish)
npx i18n-turbo packages/playground/src packages/playground/src/locales/es.json --lang es
```

## 🤝 Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## 📄 License

MIT © [i18n-turbo](https://github.com/lasalasa/i18n-turbo)
