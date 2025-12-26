import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/**
 * Translation dictionary type - maps keys to translated strings
 */
export type TranslationDictionary = Record<string, string>;

/**
 * Translations configuration - maps locale codes to translation dictionaries
 */
export type Translations = Record<string, TranslationDictionary>;

/**
 * Interpolation values for translation strings
 */
export type InterpolationValues = Record<string, string | number>;

/**
 * Configuration options for I18nProvider
 */
export interface I18nConfig {
    /** Map of locale codes to translation dictionaries */
    translations: Translations;
    /** Default/initial locale */
    defaultLocale?: string;
    /** Fallback locale when translation is missing */
    fallbackLocale?: string;
}

/**
 * Context value returned by useTranslation hook
 */
export interface I18nContextValue {
    /** Translation function */
    t: (key: string, values?: InterpolationValues) => string;
    /** Current locale */
    lang: string;
    /** Set the current locale */
    setLang: (lang: string) => void;
    /** Available locales */
    locales: string[];
}

const I18nContext = createContext<I18nContextValue>({
    t: (key) => key,
    lang: 'en',
    setLang: () => { },
    locales: [],
});

/**
 * Hook to access translation functions and locale state
 * 
 * @example
 * ```tsx
 * const { t, lang, setLang } = useTranslation();
 * 
 * return (
 *   <div>
 *     <h1>{t('hello')}</h1>
 *     <p>{t('welcome_message', { name: 'John' })}</p>
 *     <button onClick={() => setLang('es')}>Español</button>
 *   </div>
 * );
 * ```
 */
export function useTranslation(): I18nContextValue {
    return useContext(I18nContext);
}

/**
 * Interpolate values into a translation string
 * Replaces {{key}} patterns with corresponding values
 */
function interpolate(template: string, values?: InterpolationValues): string {
    if (!values) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = values[key];
        return value !== undefined ? String(value) : `{{${key}}}`;
    });
}

/**
 * Props for I18nProvider component
 */
export interface I18nProviderProps {
    /** Child components */
    children: ReactNode;
    /** Translation dictionaries keyed by locale */
    translations: Translations;
    /** Default/initial locale (defaults to 'en') */
    defaultLocale?: string;
    /** Fallback locale when translation is missing (defaults to defaultLocale) */
    fallbackLocale?: string;
}

/**
 * Provider component for internationalization context
 * 
 * @example
 * ```tsx
 * import { I18nProvider } from 'i18n-turbo';
 * import en from './locales/en.json';
 * import es from './locales/es.json';
 * 
 * const translations = { en, es };
 * 
 * function App() {
 *   return (
 *     <I18nProvider translations={translations} defaultLocale="en">
 *       <MyApp />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export function I18nProvider({
    children,
    translations,
    defaultLocale = 'en',
    fallbackLocale,
}: I18nProviderProps): React.ReactElement {
    const [lang, setLang] = useState(defaultLocale);
    const effectiveFallback = fallbackLocale ?? defaultLocale;

    const locales = useMemo(() => Object.keys(translations), [translations]);

    const t = useCallback(
        (key: string, values?: InterpolationValues): string => {
            // Try current locale first
            const currentDict = translations[lang];
            if (currentDict?.[key]) {
                return interpolate(currentDict[key], values);
            }

            // Try fallback locale
            if (lang !== effectiveFallback) {
                const fallbackDict = translations[effectiveFallback];
                if (fallbackDict?.[key]) {
                    return interpolate(fallbackDict[key], values);
                }
            }

            // Return key as last resort
            return interpolate(key, values);
        },
        [lang, translations, effectiveFallback]
    );

    const contextValue = useMemo<I18nContextValue>(
        () => ({
            t,
            lang,
            setLang,
            locales,
        }),
        [t, lang, locales]
    );

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

/**
 * Factory function to create a configured I18n instance
 * Useful for creating reusable configurations
 * 
 * @example
 * ```tsx
 * const { Provider, useTranslation } = createI18n({
 *   translations: { en, es, fr },
 *   defaultLocale: 'en',
 * });
 * ```
 */
export function createI18n(config: I18nConfig) {
    const ConfiguredProvider = ({ children }: { children: ReactNode }) => (
        <I18nProvider
            translations={config.translations}
            defaultLocale={config.defaultLocale}
            fallbackLocale={config.fallbackLocale}
        >
            {children}
        </I18nProvider>
    );

    return {
        Provider: ConfiguredProvider,
        useTranslation,
    };
}
