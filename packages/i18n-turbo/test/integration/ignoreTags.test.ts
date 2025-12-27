import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, 'fixtures_ignore_tags');
const inputPath = path.join(fixturesDir, 'App.tsx');
const tempDir = path.join(__dirname, 'temp_ignore_tags');
const outputJson = path.join(tempDir, 'locales', 'en.json');

const resetFixture = () => {
    const content = `import React from 'react';
export const App = () => {
    return (
        <div>
            <h1>Should Extract</h1>
            <option>Should Ignore Option</option>
            <code>Should Ignore Code</code>
            <pre>Should Ignore Pre</pre>
            <div data-i18n-ignore>Should Ignore Attribute</div>
            <custom-tag>Should Extract Custom</custom-tag>
        </div>
    );
};`;
    if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
    }
    fs.writeFileSync(inputPath, content, 'utf-8');
};

describe('Integration: Ignore Tags', () => {
    beforeEach(() => {
        if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true, force: true });
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
        resetFixture();
    });

    afterEach(() => {
        if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true, force: true });
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should ignore specified tags', async () => {
        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false,
            config: {
                ignoreTags: ['option', 'custom-tag'], // 'code' and 'pre' are ignored by default
                matchMatches: [] // mock config
            } as any
        });

        expect(fs.existsSync(outputJson)).toBe(true);
        const translations = JSON.parse(fs.readFileSync(outputJson, 'utf-8'));

        // Should extract using snake_case strategy default
        expect(translations['should_extract']).toBe('Should Extract');

        // Ignored by config
        expect(translations['should_ignore_option']).toBeUndefined();
        expect(translations['should_extract_custom']).toBeUndefined(); // We excluded 'custom-tag'

        // Ignored by default logic
        expect(translations['should_ignore_code']).toBeUndefined();
        expect(translations['should_ignore_pre']).toBeUndefined();

        // Ignored by attribute
        expect(translations['should_ignore_attribute']).toBeUndefined();
    });
});
