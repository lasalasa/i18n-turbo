# i18n-turbo Playground 🎡

This is an interactive demo application showcasing the capabilities of [i18n-turbo](../i18n-turbo). It demonstrates real-time translation injection, automated extraction, and zero-runtime overhead internationalization in a React environment.

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to explore the playground.

## 🌍 i18n Workflow

You can see `i18n-turbo` in action by running the following commands from this directory:

### Initialize Configuration
(Already set up for this project)
```bash
npx i18n-turbo init
```

### Extract Strings
Scans usage of `t('key')` in `src/pages` and updates `src/locales/en.json`.
```bash
npx i18n-turbo extract
```

### Translate
Automatically translates extracted strings to other languages (e.g., French).
```bash
npx i18n-turbo trans --lang fr
```

### Reverse Mode
Restores original text in your code from the lockfile data.
```bash
npx i18n-turbo --reverse
```

## 📂 Project Structure

- **`src/pages`**: React components using `i18n-turbo` for translations.
- **`src/locales`**: Generated JSON locale files (`en.json`, `fr.json`, etc.) and the `i18n-turbo.lock.json`.
- **`i18n-turbo.config.cjs`**: Configuration file defining input/output paths and target languages.
