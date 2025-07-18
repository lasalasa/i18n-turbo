# i18n-turbo

> Extract hardcoded strings from JSX/TSX/JS/TS files and export them to an i18n JSON format.

## Install

```bash
npm install -g i18n-turbo
```

## Usage

```bash
i18n-turbo <input-dir> <output-en-json> [--dry-run] [--merge] [--lang <code>] [--fn <name>]
```

## Options

- `--dry-run`: Show what would be replaced, but don’t modify files.
- `--merge`: Merge new keys with existing `en.json` entries.
- `--lang <code>`: Automatically translate to the specified language (e.g., `fr`, `es`) and generate `<lang>.json`.
- `--fn <name>`: Set the i18n function name (default is `t`).

## Features

- Scans `.jsx`, `.tsx`, `.ts`, `.js` files
- Extracts static text and replaces with `t('key')`
- Outputs i18n JSON files (e.g., `en.json`, `fr.json`)
- Preserves original file structure
- Supports dry-run, merge, and auto-translate

## Examples

Dry run only:
```bash
i18n-turbo ./src ./locales/en.json --dry-run
```

Translate to French and output `fr.json`:
```bash
i18n-turbo ./examples ./locales/en.json --lang fr
```

Custom function name:
```bash
i18n-turbo ./src ./locales/en.json --fn i18n
```

## License

MIT
