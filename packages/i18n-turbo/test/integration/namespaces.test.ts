import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractStringsFromDirectory } from '../../src/extractor';

const fixturesDir = path.join(__dirname, 'fixtures_namespaces');
const outputDir = path.join(__dirname, 'output_namespaces');

describe('Integration: Namespaces', () => {
    beforeEach(() => {
        if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true });
        if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true });
        fs.mkdirSync(fixturesDir, { recursive: true });

        // Setup folder structure
        fs.mkdirSync(path.join(fixturesDir, 'features/auth'), { recursive: true });
        fs.mkdirSync(path.join(fixturesDir, 'components'), { recursive: true });

        // Feature Auth file
        fs.writeFileSync(path.join(fixturesDir, 'features/auth/Login.tsx'), `
            export const Login = () => <div>Login Page</div>;
        `);

        // Component file
        fs.writeFileSync(path.join(fixturesDir, 'components/Button.tsx'), `
            export const Button = () => <button>Click Me</button>;
        `);
    });

    afterEach(() => {
        if (fs.existsSync(fixturesDir)) fs.rmSync(fixturesDir, { recursive: true });
        if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true });
    });

    it('should split translations into namespaces based on config', async () => {
        const configFile = path.join(fixturesDir, 'i18n-turbo.config.js');
        // We simulate config pass-in directly, but if we wanted to test loading too...
        // Here we pass config object directly to extractor.

        const config = {
            namespaces: {
                '**/features/auth/**': 'auth',
                '**/components/**': 'common'
            },
            minStringLength: 2
        };

        await extractStringsFromDirectory(fixturesDir, path.join(outputDir, 'en.json'), {
            fnName: 't',
            dryRun: false,
            merge: false,
            config: config
        });

        // specific filenames check
        // We expect `auth.json` and `common.json` in outputDir

        // Wait, logic says: 
        // path.join(outputDir, `${ns}.json`) where outputDir is dirname(outputFile)
        // outputFile passed is `.../output_namespaces/en.json` => dir is `.../output_namespaces`

        const authPath = path.join(outputDir, 'auth.json');
        const commonPath = path.join(outputDir, 'common.json');

        expect(fs.existsSync(authPath)).toBe(true);
        expect(fs.existsSync(commonPath)).toBe(true);

        const authContent = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
        const commonContent = JSON.parse(fs.readFileSync(commonPath, 'utf-8'));

        expect(authContent['login_page']).toBe('Login Page');
        expect(commonContent['click_me']).toBe('Click Me');

        // Ensure separation
        expect(authContent['click_me']).toBeUndefined();
        expect(commonContent['login_page']).toBeUndefined();
    });
});
