// test/extractor.test.ts
import { describe, it, expect } from 'vitest';
import { generateTranslationKey } from '../src/utils';

describe('generateTranslationKey', () => {
  it('should convert text to snake_case key', () => {
    expect(generateTranslationKey('Hello, World!')).toBe('hello_world');
  });

  it('should remove punctuation and special characters', () => {
    expect(generateTranslationKey('Save & Continue!')).toBe('save_continue');
    expect(generateTranslationKey('What\'s this?')).toBe('what_s_this');
  });

  it('should handle numbers properly', () => {
    expect(generateTranslationKey('Top 10 Results')).toBe('top_10_results');
  });

  it('should handle mixed casing correctly', () => {
    expect(generateTranslationKey('LoginForm HEADER Title')).toBe('loginform_header_title');
  });

  it('should handle repeated spaces or separators', () => {
    expect(generateTranslationKey('  Hello   World  Again ')).toBe('hello_world_again');
  });

  it('should return an empty string if input is empty', () => {
    expect(generateTranslationKey('')).toBe('');
  });

  it('should not modify already snake_case strings', () => {
    expect(generateTranslationKey('already_snake_case')).toBe('already_snake_case');
  });

  it('should normalize Unicode characters (basic)', () => {
    expect(generateTranslationKey('Café au lait')).toBe('caf_au_lait');
  });

  it('should convert hyphenated words to snake_case', () => {
    expect(generateTranslationKey('well-done')).toBe('well_done');
  });
});
