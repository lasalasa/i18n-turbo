import path from 'path';
import fs from 'fs';

export interface I18nTurboConfig {
    translationFunction?: string;
    minStringLength?: number;
    excludePatterns?: string[];
    keyGenerationStrategy?: 'snake_case' | 'camelCase' | 'hash' | ((text: string) => string);
    targetLang?: string;
    namespaces?: Record<string, string>; // glob pattern -> namespace name ("common", "auth")
}

const DEFAULT_CONFIG: I18nTurboConfig = {
    translationFunction: 't',
    minStringLength: 2,
    excludePatterns: [],
    keyGenerationStrategy: 'snake_case',
};

export function loadConfig(cwd: string = process.cwd()): I18nTurboConfig {
    const configPath = path.join(cwd, 'i18n-turbo.config.js');

    if (fs.existsSync(configPath)) {
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
