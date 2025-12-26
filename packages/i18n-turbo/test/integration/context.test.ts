
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, 'fixtures_context');
const outputJson = path.join(fixturesDir, 'en.json');

describe('Integration: Context Extraction', () => {
    beforeEach(() => {
        if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true });
        fs.mkdirSync(fixturesDir, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true });
    });

    it('should extract comments starting with i18n: as context', async () => {
        const content = `
        import React from 'react';
        export const Page = () => {
            return (
                <div>
                   {/* i18n: Title of the main page */}
                   <h1>Welcome Home</h1>
                   
                   {/* i18n: Tooltip for info icon */}
                   <span title="Information">i</span>
                </div>
            );
        };
        `;
        fs.writeFileSync(path.join(fixturesDir, 'Page.tsx'), content);

        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false,
            config: {
                keyGenerationStrategy: 'snake_case',
                minStringLength: 2
            }
        });

        const translations = JSON.parse(fs.readFileSync(outputJson, 'utf-8'));

        // Expect regular keys
        expect(translations['welcome_home']).toBe('Welcome Home');
        expect(translations['information']).toBe('Information');

        // Expect context keys (suffix _comment)
        // logic to be implemented: if context found, write key_comment
        expect(translations['welcome_home_comment']).toBe('Title of the main page');
        expect(translations['information_comment']).toBe('Tooltip for info icon');
    });
});
