import crypto from 'crypto';

export type KeyStrategy = 'snake_case' | 'camelCase' | 'hash';

export function generateTranslationKey(text: string, strategy: KeyStrategy | ((text: string) => string) = 'snake_case'): string {
  if (typeof strategy === 'function') {
    return strategy(text);
  }

  switch (strategy) {
    case 'camelCase':
      return toCamelCase(text);
    case 'hash':
      return crypto.createHash('md5').update(text).digest('hex').substring(0, 8);
    case 'snake_case':
    default:
      return toSnakeCase(text);
  }
}

function toSnakeCase(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 50);
}

function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}