import { describe, it, expect } from 'vitest';
import { generateTranslationKey } from '../../src/utils';

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

  it('should support camelCase strategy', () => {
    expect(generateTranslationKey('Hello World', 'camelCase')).toBe('helloWorld');
    expect(generateTranslationKey('Save & Continue', 'camelCase')).toBe('saveContinue');
    expect(generateTranslationKey('Top 10 Results', 'camelCase')).toBe('top10Results');
  });

  it('should support hash strategy', () => {
    const text = 'Hello World';
    const hash = generateTranslationKey(text, 'hash');
    expect(hash).toHaveLength(8);
    expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    // MD5 of "Hello World" is b10a8db164e0754105b7a99be72e3fe5
    // First 8 chars: b10a8db1
    expect(hash).toBe('b10a8db1');
  });

  it('should support custom strategy function', () => {
    const customStrat = (text: string) => `custom_${text.length}`;
    expect(generateTranslationKey('hello', customStrat)).toBe('custom_5');
  });
});
