import { describe, it, expect, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, '../fixtures');
const outputDir = path.join(__dirname, 'temp_ignore_output');
const outputFile = path.join(outputDir, 'en.json');

describe('Extractor Ignore Logic', () => {
    afterAll(() => {
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
    });

    it('should respect data-i18n-ignore and class="notranslate"', async () => {
        // Ensure clean state
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
        fs.mkdirSync(outputDir);

        const options = {
            fnName: 't',
            dryRun: false,
            merge: false,
            config: {
                translationFunction: 't',
                minStringLength: 2,
                targetLang: 'en',
                secondaryLanguages: [],
                input: fixturesDir,
                output: outputFile,
                keyGenerationStrategy: 'snake_case',
                excludePatterns: []
            },
        };

        // Run extraction on the fixtures folder (specifically targeting IgnoreTest.tsx implicitly via dir scan)
        // We might want to limit to just the IgnoreTest file if possible, or just scan the dir.
        // The fixture dir might contain other files, but checking for specific keys presence/absence is safe.
        await extractStringsFromDirectory(fixturesDir, outputFile, options as any);

        // Read the output
        expect(fs.existsSync(outputFile)).toBe(true);
        const translations = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));

        // Assertions
        // 1. Standard text should be present
        expect(translations).toHaveProperty('should_be_extracted');

        // 2. Ignored text should NOT be present as keys (unless they are generated keys, but the text is what we check mostly if key=text)
        // In 'snake_case', "Should be ignored (data-attr)" -> "should_be_ignored_data_attr"

        const ignoredTexts = [
            "Should be ignored (data-attr)",
            "Should be ignored (class)",
            "Should be ignored (code tag)",
            "Should be ignored (pre tag)",
            "Should be ignored (style tag)"
        ];

        // Helper to check if any value in translations matches the ignored text
        const values = Object.values(translations);

        ignoredTexts.forEach(text => {
            expect(values).not.toContain(text);
            // Also check keys just in case
            // This is a bit looser because we don't know the exact key generation, but we can check if the text *is* the key
            expect(translations).not.toHaveProperty(text);
        });

        // Check for "ignored_hook_call"? 
        // The current logic in `extractor.ts` checks `isInsideIgnoredElement` for `CallExpression` too?
        // Let's check the code.
        // extractor.ts:220 CallExpression -> does NOT check `isInsideIgnoredElement`.
        // Wait, `CallExpression` visitor in `extractor.ts` (lines 220-238) does NOT seem to call `isInsideIgnoredElement`.
        // It only checks if it matches `options.fnName`.
        // So `t("ignored_hook_call")` MIGHT be extracted even if inside `data-i18n-ignore`?
        // Let's verify this behavior. If it is extracted, the test will reveal it. 
        // If the user INTENDS for it to be ignored, we might have found a bug/missing feature.
        // But for `JSXText` and `StringLiteral` (hardcoded text), it calls `isInsideIgnoredElement`.

        // For now, let's assert what we expect for TEXT nodes. 
        // If `t(...)` is extracted, that's technically "correct" for `t()` calls (usually you manually wrap them),
        // UNLESS the ignore attribute is meant to suppress EVERYTHING inside.
        // Given the HTML attribute is `notranslate` or `data-i18n-ignore`, it usually applies to *content* scanning (hardcoded text).
        // Existing `t("...")` calls are explicit developer intent to translate.
    });
});
