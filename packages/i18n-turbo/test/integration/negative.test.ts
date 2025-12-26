import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, 'fixtures_negative');
const inputPath = path.join(fixturesDir, 'negative.tsx');
const tempDir = path.join(__dirname, 'temp_negative');
const outputJson = path.join(tempDir, 'locales', 'en.json');

// Helper to reset the fixture file
const resetFixture = () => {
    const originalContent = `import React from 'react';
import { someHelper } from './utils';

export const NegativeComponent = () => {
    // 1. Should ignore imports (checked by code structure above)
    
    // 2. Should ignore string literals in imports
    const x = require('some-lib');

    // 3. Should ignore short strings
    const a = "a"; 

    // 4. Should ignore strings without letters
    const symbols = "!!!";
    const numbers = "12345";

    // 5. Should ignore already translated strings
    const translated = t("already_translated");

    return (
        <div className="should-be-ignored-if-code-checked-it-but-it-doesnt">
           {/* It extracts JSX attributes unless filtered. Currently it extracts all attributes with letters > 1 char */}
            <span data-testid="ignore-me-maybe">Test</span>
        </div>
    );
};
`;
    if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
    }
    fs.writeFileSync(inputPath, originalContent, 'utf-8');
};

describe('Integration: Negative Cases', () => {
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

    it('should ignore specific patterns', async () => {
        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false
        });

        const transformedCode = fs.readFileSync(inputPath, 'utf-8');

        // 1 & 2. Imports should remain untouched
        expect(transformedCode).toContain("require('some-lib')");

        // 3. Short strings
        expect(transformedCode).toContain('const a = "a"');

        // 4. No letters
        expect(transformedCode).toContain('const symbols = "!!!"');
        expect(transformedCode).toContain('const numbers = "12345"');

        // 5. Already translated
        expect(transformedCode).toContain('t("already_translated")');
        // valid check: should NOT become t(t("original_key"))
        expect(transformedCode).not.toContain('t(t("already_translated"))');
    });
});
