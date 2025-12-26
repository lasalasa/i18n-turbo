import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, 'fixtures_snapshot');
const inputPath = path.join(fixturesDir, 'input.tsx');
const tempDir = path.join(__dirname, 'temp_snapshot');
const outputJson = path.join(tempDir, 'locales', 'en.json');

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

describe('Snapshot: Extraction', () => {
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

    it('should match the snapshot of the transformed code', async () => {
        await extractStringsFromDirectory(fixturesDir, outputJson, {
            fnName: 't',
            dryRun: false,
            merge: false
        });

        const transformedCode = fs.readFileSync(inputPath, 'utf-8');
        expect(transformedCode).toMatchSnapshot();
    });
});
