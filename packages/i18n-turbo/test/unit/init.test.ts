import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initConfig } from '../../src/init';
import prompts from 'prompts';
import fs from 'fs';
import path from 'path';

vi.mock('prompts');
vi.mock('fs');

describe('initConfig', () => {
    const cwd = '/test/cwd';
    const configPath = path.join(cwd, 'i18n-turbo.config.cjs');

    beforeEach(() => {
        vi.clearAllMocks();
        (fs.existsSync as any).mockReturnValue(false);
    });

    it('should generate config file with user inputs', async () => {
        (prompts as any).mockResolvedValue({
            targetLang: 'fr',
            input: 'sources',
            output: 'locales/fr.json'
        });

        await initConfig(cwd);

        expect(prompts).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            configPath,
            expect.stringContaining("targetLang: 'fr'"),
            'utf-8'
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            configPath,
            expect.stringContaining("input: 'sources'"),
            'utf-8'
        );
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            configPath,
            expect.stringContaining("output: 'locales/fr.json'"),
            'utf-8'
        );
    });

    it('should abort if cancelled', async () => {
        (prompts as any).mockResolvedValue({}); // Empty response on cancel

        await initConfig(cwd);

        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
});
