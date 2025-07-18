// test/extractor.test.ts
import { describe, it, expect } from 'vitest';
import { generateTranslationKey } from '../src/utils';

describe('generateTranslationKey', () => {
  it('should convert text to snake_case key', () => {
    const key = generateTranslationKey('Hello, World!');
    expect(key).toBe('hello_world');
  });
});