import './index.css';
import { I18nProvider } from 'i18n-turbo';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import pages
import { LandingPage } from './pages/LandingPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { PlaygroundPage } from './pages/PlaygroundPage';

// Import all locale files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import si from './locales/si.json';
import ta from './locales/ta.json';
const translations = {
  en,
  es,
  fr,
  de,
  ja,
  si,
  ta
};
function App() {
  return (
    <I18nProvider translations={translations} defaultLocale="en">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="docs" element={<DocumentationPage />} />
          <Route path="playground" element={<PlaygroundPage />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
export default App;