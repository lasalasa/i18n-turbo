import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'i18n-turbo';

export const DocumentationPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

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
                    maxWidth: '900px',
                    margin: '0 auto',
                    display: 'flex',
                    gap: '2rem',
                    textAlign: 'left'
                }}>
                    <aside className="docs-sidebar">
                        <div style={{
                            position: 'sticky',
                            top: '2rem'
                        }}>
                            <h3>{t("contents")}</h3>
                            <ul style={{
                                listStyle: 'none',
                                padding: 0
                            }}>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <a href="#intro" style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {t("docs_title")}
                                    </a>
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <a href="#install" style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {t("docs_step1_title")}
                                    </a>
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <a href="#config" style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {t("docs_step2_title")}
                                    </a>
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <a href="#usage" style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {t("docs_step3_title")}
                                    </a>
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <a href="#cli" style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {t("cli_commands_title")}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    <div style={{ flex: 1 }}>
                        <h1 id="intro">{t("docs_title")}</h1>
                        <p className="hero-subtitle" style={{
                            textAlign: 'left',
                            margin: '1rem 0 3rem'
                        }}>
                            {t("docs_intro")}
                        </p>

                        <section className="docs-step" id="install">
                            <h2>1. {t("docs_step1_title")}</h2>
                            <p>{t("docs_step1_desc")}</p>
                            <div className="code-block">
                                <code>npm install i18n-turbo</code>
                            </div>
                        </section>

                        <section className="docs-step" id="config">
                            <h2>2. {t("docs_step2_title")}</h2>
                            <p>{t("docs_step2_desc")}</p>
                            <div className="code-block">
                                <code>// i18n-turbo.config.js</code>
                            </div>
                        </section>

                        <section className="docs-step" id="usage">
                            <h2>3. {t("docs_step3_title")}</h2>
                            <p>{t("docs_step3_desc")}</p>
                            <div className="code-block">
                                <code>npm run i18n:extract</code>
                            </div>
                        </section>

                        <section className="docs-step" id="cli" style={{
                            marginTop: '3rem',
                            borderTop: '1px solid #333',
                            paddingTop: '2rem'
                        }}>
                            <h1>{t("cli_commands_title")}</h1>

                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <div>
                                    <h3>{t("cmd_extract_title")}</h3>
                                    <p>{t("cmd_extract_desc")}</p>
                                    <div className="code-block">
                                        <code>npx i18n-turbo src dest/en.json</code>
                                    </div>
                                </div>

                                <div>
                                    <h3>{t("cmd_extract_lang_title")}</h3>
                                    <p>{t("cmd_extract_lang_desc")}</p>
                                    <div className="code-block">
                                        <code>npx i18n-turbo src dest/en.json --lang ko</code>
                                    </div>
                                </div>

                                <div>
                                    <h3>{t("cmd_merge_title")}</h3>
                                    <p>{t("cmd_merge_desc")}</p>
                                    <div className="code-block">
                                        <code>npx i18n-turbo src dest/en.json --merge</code>
                                    </div>
                                </div>

                                <div>
                                    <h3>{t("cmd_force_title")}</h3>
                                    <p>{t("cmd_force_desc")}</p>
                                    <div className="code-block">
                                        <code>npx i18n-turbo src dest/en.json --force</code>
                                    </div>
                                </div>

                                <div>
                                    <h3>{t("cmd_reverse_title")}</h3>
                                    <p>{t("cmd_reverse_desc")}</p>
                                    <div className="code-block">
                                        <code>npx i18n-turbo src dest/en.json --reverse</code>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <footer className="footer">
                <p>{t("footer_text")}</p>
            </footer>
        </div>
    );
};