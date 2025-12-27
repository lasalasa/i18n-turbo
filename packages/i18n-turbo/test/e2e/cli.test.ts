import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execAsync = util.promisify(exec);

const cliPath = path.resolve(__dirname, '../../dist/bin/cli.js');
const tempDir = path.join(__dirname, 'temp_e2e');
const inputFile = path.join(tempDir, 'App.tsx');
const outputFile = path.join(tempDir, 'locales/en.json');

describe('E2E: CLI', () => {
    beforeAll(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(inputFile, `
      import React from 'react';
      export const App = () => <div>Hello CLI World</div>;
    `);
    });

    afterAll(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('should show help command', async () => {
        // We use "node <cliPath>"
        const { stdout } = await execAsync(`node "${cliPath}" --help`);
        expect(stdout).toContain('Usage: i18n-turbo');
        expect(stdout).toContain('Options:');
    });

    it('should extract strings via CLI', async () => {
        // node cli.js <input> <output>
        const command = `node "${cliPath}" "${tempDir}" "${outputFile}"`;
        const { stdout, stderr } = await execAsync(command);

        console.log('CLI Output:', stdout);
        if (stderr) console.error('CLI Stderr:', stderr);

        expect(fs.existsSync(outputFile)).toBe(true);
        const content = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        expect(content['hello_cli_world']).toBe('Hello CLI World');
    });
});
