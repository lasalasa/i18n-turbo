import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'i18n-turbo';

export const LandingPage = () => {
    const navigate = useNavigate();
    const { t, lang, setLang } = useTranslation();

    return (
        <div className="landing-container">
            <header className="navbar">
                <div className="logo cursor-pointer" onClick={() => navigate('/')}>
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text">{t("app_title")}</span>
                </div>
                <div className="nav-links">
                    <select value={lang} onChange={e => setLang(e.target.value)} className="lang-select">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                        <option value="si">සිංහල</option>
                        <option value="ta">தமிழ்</option>
                        <option value="ko">한국어</option>
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
                        <button className="btn btn-primary" onClick={() => navigate('docs')}>
                            {t("cta_get_started")}
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('docs')}>
                            {t("cta_view_docs")}
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate('playground')} style={{
                            marginLeft: '1rem'
                        }}>
                            {t("nav_examples")}
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