import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, 'fixtures_extraction');
const inputPath = path.join(fixturesDir, 'input.tsx');
const tempDir = path.join(__dirname, 'temp');
const outputJson = path.join(tempDir, 'locales', 'en.json');

// Helper to reset the fixture file
const resetFixture = () => {
    const originalContent = `import React from 'react';

export const DemoComponent = () => {
    return (
        <div title="Container Title">
            <h1>Hello World</h1>
            <p>Welcome to the i18n-turbo demo.</p>
            <button aria-label="Submit Button">Click Me</button>
            <span>Short</span>
            <div>{\`Template literal with variable\`}</div>
            <div>Static string inside expression container</div>
        </div>
    );
};

export const helper = () => {
  const message = "This is a plain string literal";
  return message;
};
`;
    if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
    }
    fs.writeFileSync(inputPath, originalContent, 'utf-8');
};

describe('Integration: Extraction', () => {
    beforeEach(() => {
        if (fs.existsSync(fixturesDir)) {
            fs.rmSync(fixturesDir, { recursive: true, force: true });
        }
        resetFixture();
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        if (fs.existsSync(fixturesDir)) {
            fs.rmSync(fixturesDir, { recursive: true, force: true });
        }
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('should extract strings and replace them with t() calls', async () => {
        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false
        });

        // 1. Verify JSON output
        expect(fs.existsSync(outputJson)).toBe(true);
        const translations = JSON.parse(fs.readFileSync(outputJson, 'utf-8'));

        expect(translations['hello_world']).toBe('Hello World');
        expect(translations['container_title']).toBe('Container Title');
        expect(translations['welcome_to_the_i18n_turbo_demo']).toBe('Welcome to the i18n-turbo demo.');
        expect(translations['submit_button']).toBe('Submit Button');
        expect(translations['this_is_a_plain_string_literal']).toBe('This is a plain string literal');

        // Verify "Short" was skipped (assuming default length > 2 logic holds, wait, "Short" is 5 chars, so it should be extracted)
        // Let's check the code rules again. src/extractor.ts line 81: value.length < 2. So "Short" should be extracted.
        expect(translations['short']).toBe('Short');

        // 2. Verify File Transformation
        const transformedCode = fs.readFileSync(inputPath, 'utf-8');

        expect(transformedCode).toContain('t("hello_world")');
        expect(transformedCode).toContain('title={t("container_title")}');
        expect(transformedCode).toContain('aria-label={t("submit_button")}');
        expect(transformedCode).toContain('const message = t("this_is_a_plain_string_literal")');
    });

    it('should support dry run (no changes)', async () => {
        const originalCode = fs.readFileSync(inputPath, 'utf-8');

        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: true,
            merge: false
        });

        const newCode = fs.readFileSync(inputPath, 'utf-8');
        expect(newCode).toBe(originalCode);
        expect(fs.existsSync(outputJson)).toBe(false);
    });
});
