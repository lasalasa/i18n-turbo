import { useNavigate } from "react-router-dom";
import { useTranslation } from "i18n-turbo";
import { useState, useEffect } from "react";

export const DocumentationPage = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const [activeSection, setActiveSection] = useState(t("intro"));

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  // Simple scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        t("intro"),
        t("install"),
        t("config"),
        t("usage"),
        t("ignoring_content"),
        t("cli"),
      ];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-container">
      <header className="navbar">
        <div className="logo cursor-pointer" onClick={() => navigate("/")}>
          <span className="logo-icon">🚀</span>
          <span className="logo-text">{t("i18n_turbo")}</span>
        </div>
        <div className="nav-links">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="lang-select"
            data-i18n-ignore
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="si">සිංහල</option>
          </select>
          <button
            className="btn btn-secondary"
            style={{ marginLeft: "1rem" }}
            onClick={() => navigate("/")}
          >
            {t("back_to_home")}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="docs-container">
          <aside className="docs-sidebar">
            <div className="docs-sidebar-inner">
              <h3
                className="mb-4"
                style={{
                  paddingLeft: "1rem",
                  borderLeft: "4px solid var(--accent)",
                }}
              >
                {t("contents")}
              </h3>
              <nav>
                <a
                  onClick={() => scrollToSection(t("intro"))}
                  className={`docs-nav-link cursor-pointer ${activeSection === "intro" ? "active" : ""}`}
                >
                  {t("introduction")}
                </a>
                <a
                  onClick={() => scrollToSection(t("install"))}
                  className={`docs-nav-link cursor-pointer ${activeSection === "install" ? "active" : ""}`}
                >
                  {t("installation")}
                </a>
                <a
                  onClick={() => scrollToSection(t("config"))}
                  className={`docs-nav-link cursor-pointer ${activeSection === "config" ? "active" : ""}`}
                >
                  {t("configuration")}
                </a>
                <a
                  onClick={() => scrollToSection(t("usage"))}
                  className={`docs-nav-link cursor-pointer ${activeSection === "usage" ? "active" : ""}`}
                >
                  {t("usage")}
                </a>
                <a
                  onClick={() => scrollToSection(t("ignoring_content"))}
                  className={`docs-nav-link cursor-pointer ${activeSection === "ignoring-content" ? "active" : ""}`}
                >
                  {t("ignoring_content")}
                </a>
                <a
                  onClick={() => scrollToSection(t("cli"))}
                  className={`docs-nav-link cursor-pointer ${activeSection === "cli" ? "active" : ""}`}
                >
                  {t("cli_commands")}
                </a>
              </nav>
            </div>
          </aside>

          <div className="docs-content">
            <section id="intro" className="docs-step animate-fade-in">
              <h1
                className="hero-title"
                style={{ fontSize: "3rem", marginBottom: "1rem" }}
              >
                {t("documentation")}
              </h1>
              <p
                className="hero-subtitle"
                style={{ textAlign: "left", margin: "0 0 2rem" }}
              >
                {t("everything_you_need_to_know_to_integrate_i18n_turb")}
              </p>
            </section>

            <div
              style={{
                height: "1px",
                background: "var(--border)",
                marginBottom: "3rem",
              }}
            ></div>

            <section id="install" className="docs-step">
              <h2>{t("1_installation")}</h2>
              <p className="text-secondary mb-4">
                {t("install_the_package_via_npm_or_yarn_it_acts_as_bot")}
              </p>
              <div className="code-block">
                <code>npm install i18n-turbo</code>
              </div>
            </section>

            <section id="config" className="docs-step">
              <h2>{t("2_configuration")}</h2>
              <p className="text-secondary mb-4">
                {t("create_a_configuration_file_to_define_your_support")}
              </p>
              <div className="code-block">
                <code>
                  {`// i18n-turbo.config.js
module.exports = {
  targetLang: 'en',
  secondaryLanguages: ['fr', 'es'],
  input: 'src',
  output: 'src/locales/en.json'
}`}
                </code>
              </div>
            </section>

            <section id="usage" className="docs-step">
              <h2>{t("3_usage")}</h2>
              <p className="text-secondary mb-4">
                {t("wrap_your_application_with_the_provider_and_use_th")}
              </p>
              <div className="code-block">
                <code>
                  {`// App.tsx
import { I18nProvider, useTranslation } from 'i18n-turbo';

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('hello_world')}</h1>; // "Hello World"
}`}
                </code>
              </div>
            </section>

            <section id="ignoring-content" className="docs-step">
              <h2>{t("ignoring_content")}</h2>
              <p className="text-secondary mb-4">
                {t("you_can_exclude_specific_content_from_being_extrac")}
              </p>

              <div className="card">
                <h3 className="text-accent mb-4">
                  {t("using_data_attribute")}
                </h3>
                <p className="text-secondary mb-4">
                  {t("add")}
                  <code>data-i18n-ignore</code>
                  {t("attribute_to_any_html_element")}
                </p>
                <div className="code-block" style={{ margin: "0 0 1.5rem" }}>
                  <code>
                    &lt;div data-i18n-ignore&gt;This text will not be
                    extracted&lt;/div&gt;
                  </code>
                </div>

                <h3 className="text-accent mb-4">{t("using_class_name")}</h3>
                <p className="text-secondary mb-4">
                  {t("add_the")}
                  <code>notranslate</code>
                  {t("class_to_any_element")}
                </p>
                <div className="code-block" style={{ margin: "0 0 1.5rem" }}>
                  <code>
                    &lt;span className="notranslate"&gt;Ignored
                    text&lt;/span&gt;
                  </code>
                </div>

                <h3 className="text-accent mb-4">{t("using_comments_new")}</h3>
                <p className="text-secondary mb-4">
                  {t("use")}
                  <code>// i18n-ignore</code>
                  {t("or")}
                  <code>/* i18n-ignore */</code>
                  {t("to_skip_specific_lines")}
                </p>
                <div className="code-block" style={{ margin: "0 0 1.5rem" }}>
                  <code>
                    {`// i18n-ignore
<p>This line is ignored</p>

const type = "preview" /* i18n-ignore */;`}
                  </code>
                </div>

                <h3 className="text-accent mb-4">{t("automatic_exclusion")}</h3>
                <p className="text-secondary mb-4">
                  {t("common_properties_like")} <code>className</code>,{" "}
                  <code>style</code>, <code>id</code>, <code>href</code>,{" "}
                  <code>src</code>
                  {t("and")} <code>behavior</code>{" "}
                  {t("map_keys_are_automatically_ignored")}
                </p>

                <h3 className="text-accent mb-4">{t("global_config")}</h3>
                <div className="code-block" style={{ margin: 0 }}>
                  <code>
                    {`// i18n-turbo.config.js
module.exports = {
  ignoreTags: ['code', 'style', 'script'],
};`}
                  </code>
                </div>
              </div>
            </section>

            <section id="cli" className="docs-step">
              <h2>{t("cli_commands")}</h2>
              <p className="text-secondary mb-4">
                {t("use_the_cli_to_automate_your_translation_workflow")}
              </p>

              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div className="card">
                  <h3 className="text-accent">{t("init")}</h3>
                  <p className="text-secondary mb-4">
                    {t("initialize_a_configuration_file_for_your_project")}
                  </p>
                  <div className="code-block" style={{ margin: 0 }}>
                    <code>npx i18n-turbo init</code>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-accent">{t("extract")}</h3>
                  <p className="text-secondary mb-4">
                    {t("scans_your_source_code_for_strings_and_updates_loc")}
                  </p>
                  <div className="code-block" style={{ margin: 0 }}>
                    <code>npx i18n-turbo extract</code>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-accent">{t("translate")}</h3>
                  <p className="text-secondary mb-4">
                    {t("extracts_strings_and_automatically_translates_them")}
                  </p>
                  <div className="code-block" style={{ margin: 0 }}>
                    <code>npx i18n-turbo trans --lang fr</code>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-accent">{t("reverse_refactor")}</h3>
                  <p className="text-secondary mb-4">
                    {t("restores_extracted_keys_back_to_their_original_tex")}
                  </p>
                  <div className="code-block" style={{ margin: 0 }}>
                    <code>npx i18n-turbo --reverse</code>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-accent">{t("options")}</h3>
                  <ul
                    className="text-secondary"
                    style={{ paddingLeft: "1.2rem", lineHeight: "1.8" }}
                  >
                    <li>
                      <code>--lang, -l</code>
                      {t("target_language_for_translation")}
                    </li>
                    <li>
                      <code>--dry-run, -d</code>
                      {t("simulate_without_writing_files")}
                    </li>
                    <li>
                      <code>--force, -f</code>
                      {t("overwrite_existing_keys")}
                    </li>
                    <li>
                      <code>--reverse</code>
                      {t("restore_original_text")}
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>{t("2025_i18n_turbo_open_source_mit_license")}</p>
      </footer>
    </div>
  );
};
