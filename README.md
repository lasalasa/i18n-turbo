# i18n-turbo

> Extract hardcoded strings from JSX/TSX/JS/TS files and export them to an i18n JSON format — with optional reverse transformation support.

## Install

```bash
npm install -g i18n-turbo
````

## Usage

```bash
i18n-turbo <input-dir> <output-en-json> [--dry-run] [--merge] [--lang <code>] [--fn <name>] [--reverse]
```

## Options

* `--dry-run` — Show what would be replaced, but don’t modify files.
* `--merge` — Merge new keys with existing `en.json` entries.
* `--lang <code>` — Automatically translate to the specified language (e.g., `fr`, `es`) and generate `<lang>.json`.
* `--fn <name>` — Set the i18n function name (default is `t`).
* `--reverse` — Revert translated keys (e.g., `t("hello_world")`) back to the original hardcoded strings using the translation file.

## Features

* Scans `.jsx`, `.tsx`, `.ts`, `.js` files
* Extracts static text and replaces with `t('key')`
* Outputs i18n JSON files (e.g., `en.json`, `fr.json`)
* Reverses translated keys back to raw strings
* Preserves original file structure
* Supports dry-run, merge, and auto-translate

## Examples

### Extract mode

**Dry run only (preview):**

```bash
i18n-turbo ./src ./locales/en.json --dry-run
```

**Translate to French and output `fr.json`:**

```bash
i18n-turbo ./examples ./locales/en.json --lang fr
```

**Use a custom function name (e.g. `i18n` instead of `t`):**

```bash
i18n-turbo ./src ./locales/en.json --fn i18n
```

### Reverse mode

**Revert translations (e.g. `t("hello_world")`) back to original strings:**

```bash
i18n-turbo ./examples ./locales/en.json --reverse
```

**Reverse using a custom i18n function name:**

```bash
i18n-turbo ./src ./locales/en.json --reverse --fn i18n
```

> 🔁 The reverse command reads keys from the translation file (e.g. `en.json`) and replaces `t("key")` with the original hardcoded string like `"Hello world"`.

## License

MIT
