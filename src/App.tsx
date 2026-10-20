import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./components/layout/Header.js";
import { StatusBar } from "./components/layout/StatusBar.js";
import { ActiveTab } from "./components/layout/NavTabs.js";
import { loadSettings, saveSettings, AppSettings } from "./services/storage/settings-schema.js";
import { Upload, CreditCard, Sparkles, Printer, FileText } from "lucide-react";
import { IdCardWorkspace } from "./components/idcard/IdCardWorkspace.js";

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>("id_card");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Sync theme to DOM data-theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  // Sync locale to i18n
  useEffect(() => {
    if (i18n.language !== settings.locale) {
      i18n.changeLanguage(settings.locale);
    }
  }, [settings.locale, i18n]);

  const handleToggleTheme = () => {
    const newTheme: "dark" | "light" = settings.theme === "dark" ? "light" : "dark";
    const updated: AppSettings = { ...settings, theme: newTheme };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleLocale = () => {
    const newLocale: "en" | "hi" = settings.locale === "en" ? "hi" : "en";
    const updated: AppSettings = { ...settings, locale: newLocale };
    setSettings(updated);
    saveSettings(updated);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setStatusMessage(t("status.printing"));
      } else if (e.ctrlKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setStatusMessage(t("action.upload_file"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [t]);

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        locale={settings.locale}
        onToggleLocale={handleToggleLocale}
        privacyMode={settings.privacyMode}
      />

      <main className="workspace-container">
        {activeTab === "id_card" ? (
          <IdCardWorkspace />
        ) : (
          /* Placeholder View for queued modules */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
            <div style={{
              maxWidth: 640,
              width: "100%",
              textAlign: "center",
              padding: 40,
              borderRadius: "var(--border-radius-lg)",
              backgroundColor: "var(--bg-surface)",
              border: "2px dashed var(--border-strong)",
              boxShadow: "var(--shadow-md)"
            }}>
              <div style={{
                width: 72,
                height: 72,
                margin: "0 auto 20px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)"
              }}>
                {activeTab === "visiting_card" && <FileText size={36} />}
                {activeTab === "membership_card" && <Sparkles size={36} />}
                {activeTab === "photo_studio" && <Sparkles size={36} />}
                {activeTab === "calibration" && <Printer size={36} />}
              </div>

              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                {t(`nav.${activeTab}`)}
              </h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 28, fontSize: "0.9375rem" }}>
                {t("app.tagline")} — 100% Offline & Pure Core Math
              </p>

              <button
                className="btn btn-primary"
                style={{ margin: "0 auto" }}
                type="button"
                onClick={() => setStatusMessage(t("action.upload_file"))}
              >
                <Upload size={20} />
                <span>{t("action.upload_file")}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <StatusBar statusMessage={statusMessage} />
    </div>
  );
};
