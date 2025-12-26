import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, 'fixtures_config');
const inputPath = path.join(fixturesDir, 'config_test.tsx');
const tempDir = path.join(__dirname, 'temp_config');
const outputJson = path.join(tempDir, 'locales', 'en.json');

const resetFixture = () => {
    const originalContent = `import React from 'react';

export const ConfigComponent = () => {
    return (
        <div>
            <h1>Header Text</h1>
            <p>Another nice string</p>
        </div>
    );
};
`;
    if (fs.existsSync(fixturesDir)) {
        fs.rmSync(fixturesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(fixturesDir, { recursive: true });
    fs.writeFileSync(inputPath, originalContent, 'utf-8');
};

describe('Integration: Configuration', () => {
    beforeEach(() => {
        resetFixture();
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    afterEach(() => {
        resetFixture();
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('should use "camelCase" strategy when configured', async () => {
        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false,
            config: {
                keyGenerationStrategy: 'camelCase',
                minStringLength: 2,
                excludePatterns: []
            }
        });

        const translations = JSON.parse(fs.readFileSync(outputJson, 'utf-8'));
        expect(translations['headerText']).toBe('Header Text'); // camelCase
        expect(translations['anotherNiceString']).toBe('Another nice string'); // camelCase
    });

    it('should use "hash" strategy when configured', async () => {
        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false,
            config: {
                keyGenerationStrategy: 'hash',
                minStringLength: 2,
                excludePatterns: []
            }
        });

        const translations = JSON.parse(fs.readFileSync(outputJson, 'utf-8'));
        // "Header Text" md5 hash first 8 chars
        // "Header Text" => c994e942...
        expect(translations['c994e942']).toBe('Header Text');
    });

    it('should respect custom minStringLength', async () => {
        // "Header Text" is 11 chars. "Another nice string" is 19.
        // Let's create a file with short strings
        fs.writeFileSync(inputPath, `
            export const Test = () => {
                const s1 = "TooShort"; // 8 chars
                const s2 = "KeepMe";   // 6 chars
                return <div>{s1}</div>;
            };
        `);

        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false,
            config: {
                keyGenerationStrategy: 'snake_case',
                minStringLength: 7,
                excludePatterns: []
            },

        });

        const translations = JSON.parse(fs.readFileSync(outputJson, 'utf-8'));


        expect(translations['tooshort']).toBeDefined();
        expect(translations['keep_me']).toBeUndefined();
    });
});
