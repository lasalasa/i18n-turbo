import React, { createContext, useContext, useState, type ReactNode } from 'react';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import ja from '../locales/ja.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

const translations: Record<string, Record<string, string>> = {
    en, es, fr, de, ja, si, ta
};
interface I18nContextProps {
    t: (key: string) => string;
    lang: string;
    setLang: (lang: string) => void;
}
const I18nContext = createContext<I18nContextProps>({
    t: key => key,
    lang: 'en',
    setLang: () => { }
});
export const useTranslation = () => useContext(I18nContext);
export const I18nProvider = ({
    children
}: {
    children: ReactNode;
}) => {
    const [lang, setLang] = useState('en');
    const t = (key: string) => {
        const dict = translations[lang] || translations['en'];
        // Return translation or fallback to key (converted to title case or human friendly if possible, but key is usually code-friendly)
        // Actually, i18n-turbo keys might be "hello_world".
        // If not found, returning the key is standard behavior.
        return dict[key] || key;
    };
    return <I18nContext.Provider value={{
        t,
        lang,
        setLang
    }}>
        {children}
    </I18nContext.Provider>;
};