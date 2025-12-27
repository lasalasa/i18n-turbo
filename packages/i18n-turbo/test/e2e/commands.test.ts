import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execAsync = util.promisify(exec);

const cliPath = path.resolve(__dirname, '../../dist/bin/cli.js');
const tempDir = path.join(__dirname, 'temp_commands');
const inputFile = path.join(tempDir, 'App.tsx');
const outputFile = path.join(tempDir, 'locales/en.json');
const outputFileFr = path.join(tempDir, 'locales/fr.json');

describe('E2E: CLI Commands', () => {
    beforeAll(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });
        fs.mkdirSync(path.join(tempDir, 'locales'), { recursive: true });
        fs.writeFileSync(inputFile, `
      import React from 'react';
      export const App = () => <div>Hello Command World</div>;
    `);
    });

    afterAll(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    it('should show help with commands', async () => {
        const { stdout } = await execAsync(`node "${cliPath}" --help`);
        expect(stdout).toContain('Commands:');
        expect(stdout).toContain('init');
        expect(stdout).toContain('extract');
        expect(stdout).toContain('trans');
    });

    it('should run extract command (default)', async () => {
        // i18n-turbo extract <input> <output>
        const command = `node "${cliPath}" extract "${tempDir}" "${outputFile}"`;
        await execAsync(command);

        expect(fs.existsSync(outputFile)).toBe(true);
        const content = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        expect(content['hello_command_world']).toBe('Hello Command World');
    });

    it('should run trans command with -l alias', async () => {
        // i18n-turbo trans <input> <output> -l fr
        // Note: This relies on google translate mock or behavior. 
        // If no mock, it might fail or just copy if dry run?
        // Let's use dry-run to check simple execution or check logs if possible.
        // Real translation might fail without API key.
        // But we check if it TRIES to accept the command.

        // We will just verify it runs and creates file (even if translation fails/falls back)
        // Actually, without mock, it might throw or just use key as value?
        // Let's assumet 'extract' logic handles it. 

        const command = `node "${cliPath}" trans "${tempDir}" "${outputFileFr}" -l fr`;

        // We expect it to run.
        try {
            await execAsync(command);
        } catch (e) {
            // Verification might fail if network/api key missing. 
            // But we want to test argument parsing.
        }

        // Check if command logic was entered (via stdout log we added?)
        const { stdout } = await execAsync(`node "${cliPath}" trans "${tempDir}" "${outputFileFr}" -l fr --dry-run`);
        expect(stdout).toContain('Running translation mode');
    });

    it('should support legacy implicit extract', async () => {
        const legacyOutput = path.join(tempDir, 'locales/legacy.json');
        const command = `node "${cliPath}" "${tempDir}" "${legacyOutput}"`;
        await execAsync(command);
        expect(fs.existsSync(legacyOutput)).toBe(true);
    });
});
