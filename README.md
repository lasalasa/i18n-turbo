# i18n-turbo Monorepo

This repository contains:
- `packages/i18n-turbo`: The core CLI tool and library.
- `packages/playground`: A React application demonstrating the usage of `i18n-turbo`.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the library:
   ```bash
   npm run build -w packages/i18n-turbo
   ```

3. Run the playground:
   ```bash
   npm run dev -w packages/playground
   ```

## Workflow

To extract strings in the playground:
```bash
npm run i18n:extract -w packages/playground
```
