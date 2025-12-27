import { useNavigate } from "react-router-dom";
import { useTranslation } from "i18n-turbo";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();

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
            {/* <option value="es">Español</option> */}
            <option value="fr">Français</option>
            {/* <option value="de">Deutsch</option> */}
            {/* <option value="ja">日本語</option> */}
            <option value="si">සිංහල</option>
            {/* <option value="ta">தமிழ்</option> */}
            {/* <option value="ko">한국어</option> */}
          </select>
        </div>
      </header>

      <main>
        <section className="hero">
          <div
            className="hero-badge"
            style={{
              background: "rgba(56, 189, 248, 0.1)",
              color: "#38bdf8",
              padding: "0.5rem 1rem",
              borderRadius: "2rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            {t("v1_0_0_now_available")}
          </div>
          <h1 className="hero-title">
            {t("global_reach")}

            <br />
            <span style={{ color: "#fff" }}>{t("zero_friction")}</span>
          </h1>
          <p className="hero-subtitle">
            {t("the_fastest_way_to_add_internationalization_to_you")}
          </p>
          <div className="cta-group">
            <button
              className="btn btn-primary"
              onClick={() => navigate("docs")}
            >
              {t("get_started")}

              <span style={{ opacity: 0.7 }}>→</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("playground")}
            >
              {t("try_playground")}
            </button>
          </div>
        </section>

        <section
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            background: "var(--bg-primary)",
          }}
        >
          <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem" }}>
            {t("how_it_works")}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            <div className="step-card">
              <div
                style={{
                  fontSize: "2rem",
                  background: "var(--bg-secondary)",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  border: "1px solid var(--border)",
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                {t("install")}
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                {t("add_the_package_to_your_project_with_a_single_comm")}
              </p>
            </div>
            <div className="step-card">
              <div
                style={{
                  fontSize: "2rem",
                  background: "var(--bg-secondary)",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  border: "1px solid var(--border)",
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                {t("wrap")}
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                {t("wrap_your_app_with_the_provider_and_start_using_th")}
              </p>
            </div>
            <div className="step-card">
              <div
                style={{
                  fontSize: "2rem",
                  background: "var(--bg-secondary)",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  border: "1px solid var(--border)",
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                {t("translate")}
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                {t("run_the_intuitive_cli_to_extract_and_translate_you")}
              </p>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="feature-card">
            <div className="icon">⚡</div>
            <h3>{t("zero_configuration")}</h3>
            <p>{t("get_started_instantly_with_sensible_defaults_no_co")}</p>
          </div>
          <div className="feature-card">
            <div className="icon">🛡️</div>
            <h3>{t("type_safety")}</h3>
            <p>{t("full_typescript_support_with_auto_generated_types_")}</p>
          </div>
          <div className="feature-card">
            <div className="icon">🔍</div>
            <h3>{t("smart_extraction")}</h3>
            <p>{t("automatically_finds_and_extracts_strings_from_your")}</p>
          </div>
          <div className="feature-card">
            <div className="icon">🚀</div>
            <h3>{t("instant_feedback")}</h3>
            <p>{t("see_your_translations_update_in_real_time_as_you_c")}</p>
          </div>
          <div className="feature-card">
            <div className="icon">📦</div>
            <h3>{t("tiny_bundle_size")}</h3>
            <p>{t("optimized_for_performance_with_a_minimal_footprint")}</p>
          </div>
          <div className="feature-card">
            <div className="icon">🌐</div>
            <h3>{t("browser_server")}</h3>
            <p>{t("works_seamlessly_in_both_browser_environments_and_")}</p>
          </div>
        </section>

        <section
          style={{
            padding: "6rem 2rem",
            textAlign: "center",
            background:
              "linear-gradient(to bottom, var(--bg-primary), var(--bg-secondary))",
          }}
        >
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>
            {t("ready_to_go_global")}
          </h2>
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--text-secondary)",
              marginBottom: "3rem",
            }}
          >
            {t("join_developers_building_the_next_generation_of_we")}
          </p>
          <button
            className="btn btn-primary"
            style={{ fontSize: "1.25rem", padding: "1rem 3rem" }}
            onClick={() => navigate("docs")}
          >
            {t("get_started_now")}
          </button>
        </section>
      </main>

      <footer className="footer">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            margin: "0 auto 2rem",
            textAlign: "left",
          }}
        >
          <div>
            <h4 style={{ color: "#fff", marginBottom: "1rem" }}>
              {t("i18n_turbo")}
            </h4>
            <p>{t("the_modern_internationalization_solution_for_react")}</p>
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: "1rem" }}>
              {t("resources")}
            </h4>
            <p
              className="cursor-pointer hover:text-white"
              onClick={() => navigate("docs")}
            >
              {t("documentation")}
            </p>
            <p
              className="cursor-pointer hover:text-white"
              onClick={() => navigate("playground")}
            >
              {t("playground")}
            </p>
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: "1rem" }}>
              {t("community")}
            </h4>
            <p>{t("github")}</p>
            <p>{t("discord")}</p>
          </div>
        </div>
        <p>{t("2025_i18n_turbo_open_source_mit_license")}</p>
      </footer>
    </div>
  );
};
