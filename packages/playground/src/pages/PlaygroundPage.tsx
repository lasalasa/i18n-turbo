import { useNavigate } from "react-router-dom";
import { useTranslation } from "i18n-turbo";
import { useState } from "react";

export const PlaygroundPage = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();

  // Demo States
  const [name, setName] = useState(t("developer"));
  const [count, setCount] = useState(1);
  const [activeTab, setActiveTab] = useState<"preview" | "code">(
    "preview" /* i18n-ignore */,
  );

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
        <div
          style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}
        >
          <h1
            className="hero-title"
            style={{ fontSize: "3rem", marginBottom: "1rem" }}
          >
            {t("interactive_playground")}
          </h1>
          <p className="hero-subtitle" style={{ margin: "0 auto 3rem" }}>
            {t("experiment_with_i18n_turbo_features_in_real_time_c")}
          </p>

          <div style={{ display: "grid", gap: "3rem", textAlign: "left" }}>
            {/* Interpolation Demo */}
            <section className="docs-step animate-fade-in">
              <h2 className="mb-4">{t("1_dynamic_interpolation")}</h2>
              <p className="text-secondary mb-4">
                {t("inject_dynamic_values_into_your_translations_easil")}
              </p>

              <div className="card">
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <button
                    className={`cursor-pointer ${activeTab === "preview" ? "text-accent" : "text-secondary"}`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.5rem 1rem",
                      fontWeight: 600,
                      borderBottom:
                        activeTab === "preview"
                          ? "2px solid var(--accent)"
                          : "none",
                    }}
                    onClick={() => setActiveTab("preview" /* i18n-ignore */)}
                  >
                    {t("preview")}
                  </button>
                  <button
                    className={`cursor-pointer ${activeTab === "code" ? "text-accent" : "text-secondary"}`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.5rem 1rem",
                      fontWeight: 600,
                      borderBottom:
                        activeTab === "code"
                          ? "2px solid var(--accent)"
                          : "none",
                    }}
                    onClick={() => setActiveTab("code" /* i18n-ignore */)}
                  >
                    {t("code")}
                  </button>
                </div>

                {activeTab === "preview" /* i18n-ignore */ ? (
                  <div>
                    <div className="mb-4">
                      <label
                        className="text-secondary"
                        style={{ display: "block", marginBottom: "0.5rem" }}
                      >
                        {t("enter_your_name")}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="demo-input"
                        placeholder={t("type_a_name")}
                      />
                    </div>
                    <div
                      style={{
                        padding: "1.5rem",
                        background: "rgba(56, 189, 248, 0.1)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(56, 189, 248, 0.2)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 500,
                          margin: 0,
                        }}
                      >
                        👋 {`Welcome back, ${name}!`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="code-block" style={{ margin: 0 }}>
                    <code>{`// Component logic
const [name, setName] = useState("${name}");

// JSX
<p>{t("example_welcome", { name })}</p>`}</code>
                  </div>
                )}
              </div>
            </section>

            {/* Pluralization Demo */}
            <section className="docs-step">
              <h2 className="mb-4">{t("2_smart_pluralization")}</h2>
              <p className="text-secondary mb-4">
                {t("handle_singular_and_plural_forms_automatically_bas")}
              </p>

              <div className="card">
                <div className="demo-controls">
                  <span className="text-secondary">{t("messages_count")}</span>
                  <button
                    className="demo-btn"
                    onClick={() => setCount(Math.max(0, count - 1))}
                  >
                    -
                  </button>
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      minWidth: "2rem",
                      textAlign: "center",
                    }}
                  >
                    {count}
                  </span>
                  <button
                    className="demo-btn"
                    onClick={() => setCount(count + 1)}
                  >
                    +
                  </button>
                </div>

                <div
                  style={{
                    padding: "1.5rem",
                    background: "rgba(56, 189, 248, 0.1)",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                  }}
                >
                  <p
                    style={{ fontSize: "1.25rem", fontWeight: 500, margin: 0 }}
                  >
                    {t("messages_count")}
                  </p>
                </div>

                <div className="code-block">
                  <code>{`// JSX
<p>{t("messages_count", { count: ${count} })}</p>`}</code>
                </div>
              </div>
            </section>

            {/* CLI Info */}
            <section className="docs-step" style={{ marginTop: "2rem" }}>
              <div
                style={{
                  background: "linear-gradient(to right, #0f172a, #1e293b)",
                  padding: "2rem",
                  borderRadius: "1rem",
                  border: "1px solid var(--border)",
                }}
              >
                <h2 className="mb-4" style={{ fontSize: "1.5rem" }}>
                  {t("want_to_add_a_new_language")}
                </h2>
                <p className="text-secondary mb-4">
                  {t("run_this_simple_cli_command_in_your_terminal")}
                </p>
                <div className="code-block" style={{ background: "#000" }}>
                  <code>
                    npx i18n-turbo packages/playground/src
                    packages/playground/src/locales/it.json --lang it
                  </code>
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
