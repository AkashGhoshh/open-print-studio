import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "./components/layout/Header.js";
import { StatusBar } from "./components/layout/StatusBar.js";
import { ActiveTab } from "./components/layout/NavTabs.js";
import { loadSettings, saveSettings, AppSettings } from "./services/storage/settings-schema.js";
import { Upload, CreditCard, Sparkles, Printer, FileText } from "lucide-react";
import { IdCardWorkspace } from "./components/idcard/IdCardWorkspace.js";
import { VisitingCardWorkspace } from "./components/visiting/VisitingCardWorkspace.js";
import { MembershipCardWorkspace } from "./components/membership/MembershipCardWorkspace.js";
import { PhotoStudioWorkspace } from "./components/photo/PhotoStudioWorkspace.js";
import { CalibrationWizard } from "./components/calibration/CalibrationWizard.js";
import { RecentDesignsDrawer } from "./components/recents/RecentDesignsDrawer.js";
import { BatchQueueDrawer } from "./components/batch/BatchQueueDrawer.js";
import { batchQueueService } from "./services/batch/batch-queue.js";

export const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>("id_card");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isRecentsOpen, setIsRecentsOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);

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
      } else if (e.ctrlKey && e.key === "1") {
        e.preventDefault();
        setActiveTab("id_card");
      } else if (e.ctrlKey && e.key === "2") {
        e.preventDefault();
        setActiveTab("visiting_card");
      } else if (e.ctrlKey && e.key === "3") {
        e.preventDefault();
        setActiveTab("membership_card");
      } else if (e.ctrlKey && e.key === "4") {
        e.preventDefault();
        setActiveTab("photo_studio");
      } else if (e.ctrlKey && e.key === "5") {
        e.preventDefault();
        setActiveTab("calibration");
      } else if (e.key === "Escape") {
        setIsRecentsOpen(false);
        setIsBatchOpen(false);
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
        onOpenRecents={() => setIsRecentsOpen(true)}
        onOpenBatchQueue={() => setIsBatchOpen(true)}
        batchCount={batchQueueService.count}
      />

      <main className="workspace-container">
        {activeTab === "id_card" && <IdCardWorkspace />}
        {activeTab === "visiting_card" && <VisitingCardWorkspace />}
        {activeTab === "membership_card" && <MembershipCardWorkspace />}
        {activeTab === "photo_studio" && <PhotoStudioWorkspace />}
        {activeTab === "calibration" && <CalibrationWizard />}
      </main>

      <StatusBar statusMessage={statusMessage} />

      <RecentDesignsDrawer
        isOpen={isRecentsOpen}
        onClose={() => setIsRecentsOpen(false)}
        onSelectDesign={(design) => {
          setStatusMessage(`Loaded session: ${design.title}`);
        }}
      />

      <BatchQueueDrawer
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onPrintBatch={() => {
          setStatusMessage("Printing all queued batch sheets...");
        }}
      />
    </div>
  );
};
