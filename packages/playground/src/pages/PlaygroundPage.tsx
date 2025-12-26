import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'i18n-turbo';
import { useState } from 'react';

export const PlaygroundPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [name, setName] = useState('Developer');

    return (
        <div className="landing-container">
            <header className="navbar">
                <div className="logo cursor-pointer" onClick={() => navigate('/')}>
                    <span className="logo-icon">🚀</span>
                    <span className="logo-text">{t("app_title")}</span>
                </div>
                <div className="nav-links">
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                        ← {t("back_to_home")}
                    </button>
                </div>
            </header>
            <main className="main-content">
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <h1>{t("playground_title")}</h1>
                    <p className="hero-subtitle" style={{
                        textAlign: 'left',
                        margin: '1rem 0 3rem'
                    }}>
                        {t("playground_intro")}
                    </p>

                    <section className="docs-step">
                        <h2>{t("pg_interp_title")}</h2>
                        <p>{t("pg_interp_desc")}</p>
                        <div className="card" style={{
                            padding: '1.5rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)'
                        }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ marginRight: '1rem' }}>{t("enter_name")}</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRadius: '4px',
                                        border: '1px solid #444',
                                        background: '#222',
                                        color: '#fff'
                                    }}
                                />
                            </div>
                            <p style={{
                                fontSize: '1.2rem',
                                color: '#646cff'
                            }}>
                                👋 {t("example_welcome", { name })}
                            </p>
                            <div className="code-block" style={{ marginTop: '1rem' }}>
                                <code>t("example_welcome", {'{'} name: "{name}" {'}'})</code>
                            </div>
                        </div>
                    </section>

                    <section className="docs-step" style={{ marginTop: '3rem' }}>
                        <h2>{t("pg_add_lang_title")}</h2>
                        <p>{t("pg_add_lang_desc")}</p>
                        <div className="card" style={{
                            padding: '1.5rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            textAlign: 'left'
                        }}>
                            <div className="code-block" style={{ marginBottom: '1rem' }}>
                                <code>npx i18n-turbo packages/playground/src packages/playground/src/locales/it.json --lang it</code>
                            </div>
                            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                <li>Run the above command to generate <code>it.json</code></li>
                                <li>Import it in <code>App.tsx</code>: <code>import it from './locales/it.json';</code></li>
                                <li>Add it to the <code>translations</code> object.</li>
                                <li>Add an <code>&lt;option value="it"&gt;Italiano&lt;/option&gt;</code> to the selector in <code>LandingPage.tsx</code>.</li>
                            </ol>
                        </div>
                    </section>

                    <section className="docs-step" style={{ marginTop: '3rem' }}>
                        <h2>{t("pg_run_extract_title")}</h2>
                        <p>{t("pg_run_extract_desc")}</p>
                        <div className="code-block">
                            <code>npx i18n-turbo packages/playground/src packages/playground/src/locales/en.json</code>
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