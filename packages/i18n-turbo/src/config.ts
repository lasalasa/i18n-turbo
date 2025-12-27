import path from 'path';
import fs from 'fs';

export interface I18nTurboConfig {
    translationFunction?: string;
    minStringLength?: number;
    excludePatterns?: string[];
    keyGenerationStrategy?: 'snake_case' | 'camelCase' | 'hash' | ((text: string) => string);
    targetLang?: string;
    secondaryLanguages?: string[];
    input?: string;
    output?: string;
    namespaces?: Record<string, string>; // glob pattern -> namespace name ("common", "auth")
    ignoreTags?: string[];
}

const DEFAULT_CONFIG: I18nTurboConfig = {
    translationFunction: 't',
    minStringLength: 2,
    excludePatterns: [],
    ignoreTags: [],
    keyGenerationStrategy: 'snake_case',
};

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export function loadConfig(cwd: string = process.cwd()): I18nTurboConfig {
    const configPathCjs = path.join(cwd, 'i18n-turbo.config.cjs');
    const configPathJs = path.join(cwd, 'i18n-turbo.config.js');

    const configPath = fs.existsSync(configPathCjs) ? configPathCjs : (fs.existsSync(configPathJs) ? configPathJs : null);

    if (configPath) {
        try {
            // Dynamic require is acceptable for a CLI tool reading local config
            const userConfig = require(configPath);
            return { ...DEFAULT_CONFIG, ...userConfig };
        } catch (error) {
            console.warn('Warning: Failed to load i18n-turbo.config.js:', error);
        }
    }

    // Future enhancement: support package.json or .json config
    return DEFAULT_CONFIG;
}
