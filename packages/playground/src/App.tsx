import './index.css';
import { I18nProvider, useTranslation } from './i18n/context';
import { useState } from 'react';

const DocumentationPage = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="landing-container">
      <header className="navbar">
        <div className="logo cursor-pointer" onClick={onBack}>
          <span className="logo-icon">🚀</span>
          <span className="logo-text">{t("app_title")}</span>
        </div>
        <div className="nav-links">
          <button className="btn btn-secondary" onClick={onBack}>
            ← {t("back_to_home")}
          </button>
        </div>
      </header>
      <main className="main-content">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>{t("docs_title")}</h1>
          <p className="hero-subtitle" style={{ textAlign: 'left', margin: '1rem 0 3rem' }}>
            {t("docs_intro")}
          </p>

          <section className="docs-step">
            <h2>1. {t("docs_step1_title")}</h2>
            <p>{t("docs_step1_desc")}</p>
            <div className="code-block">
              <code>npm install i18n-turbo</code>
            </div>
          </section>

          <section className="docs-step">
            <h2>2. {t("docs_step2_title")}</h2>
            <p>{t("docs_step2_desc")}</p>
            <div className="code-block">
              <code>// i18n-turbo.config.js</code>
            </div>
          </section>

          <section className="docs-step">
            <h2>3. {t("docs_step3_title")}</h2>
            <p>{t("docs_step3_desc")}</p>
            <div className="code-block">
              <code>npm run i18n:extract</code>
            </div>
          </section>
        </div>
      </main>
      <footer className="footer">
        <p>{t("footer_text")}</p>
      </footer>
    </div>
  );
};

const LandingPage = ({ onNavigate }: { onNavigate: (page: 'docs') => void }) => {
  const { t, lang, setLang } = useTranslation();

  return (
    <div className="landing-container">
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">{t("app_title")}</span>
        </div>
        <div className="nav-links">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="lang-select"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>
      </header>

      <main>
        <section className="hero">
          <h1 className="hero-title">
            {t("app_title")}
          </h1>
          <p className="hero-subtitle">
            {t("app_subtitle")}
          </p>
          <div className="cta-group">
            <button className="btn btn-primary">{t("cta_get_started")}</button>
            <button className="btn btn-secondary" onClick={() => onNavigate('docs')}>
              {t("cta_view_docs")}
            </button>
          </div>
        </section>

        <section className="features">
          <div className="feature-card">
            <div className="icon">⚡</div>
            <h3>{t("feature_automated_extraction_title")}</h3>
            <p>{t("feature_automated_extraction_desc")}</p>
          </div>
          <div className="feature-card">
            <div className="icon">🤖</div>
            <h3>{t("feature_instant_translation_title")}</h3>
            <p>{t("feature_instant_translation_desc")}</p>
          </div>
          <div className="feature-card">
            <div className="icon">🛡️</div>
            <h3>{t("feature_type_safe_title")}</h3>
            <p>{t("feature_type_safe_desc")}</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>{t("footer_text")}</p>
      </footer>
    </div>
  );
};

function App() {
  const [page, setPage] = useState<'home' | 'docs'>('home');

  return (
    <I18nProvider>
      {page === 'home' ? (
        <LandingPage onNavigate={setPage} />
      ) : (
        <DocumentationPage onBack={() => setPage('home')} />
      )}
    </I18nProvider>
  );
}

export default App;