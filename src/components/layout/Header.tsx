import React from "react";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Languages, ShieldCheck, Printer, History } from "lucide-react";
import { NavTabs, ActiveTab } from "./NavTabs.js";

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  locale: "en" | "hi";
  onToggleLocale: () => void;
  privacyMode: boolean;
  onOpenRecents?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  locale,
  onToggleLocale,
  privacyMode,
  onOpenRecents,
}) => {
  const { t } = useTranslation();

  return (
    <header className="app-header">
      <div className="brand-section">
        <Printer size={26} className="brand-icon" color="#3B82F6" />
        <div>
          <h1 className="brand-title">{t("app.title")}</h1>
        </div>
        <span className="offline-pill" title="No network calls permitted">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
          {t("app.offline_badge")}
        </span>
        {privacyMode && (
          <span className="privacy-pill" title="No customer data saved to disk">
            <ShieldCheck size={14} style={{ display: "inline", marginRight: 4 }} />
            {t("app.privacy_mode")}
          </span>
        )}
      </div>

      <NavTabs activeTab={activeTab} onSelectTab={onSelectTab} />

      <div className="header-actions">
        {/* Language Toggle Button */}
        <button
          className="icon-btn"
          onClick={onToggleLocale}
          title={locale === "en" ? "हिन्दी में बदलें" : "Switch to English"}
          type="button"
          aria-label="Toggle language"
        >
          <Languages size={18} />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, marginLeft: 4 }}>
            {locale === "en" ? "HI" : "EN"}
          </span>
        </button>

        {/* Recent Designs Drawer Button */}
        {onOpenRecents && (
          <button
            className="icon-btn"
            onClick={onOpenRecents}
            title="Recent Card Sessions"
            type="button"
            aria-label="Recent Designs"
          >
            <History size={18} />
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          type="button"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
