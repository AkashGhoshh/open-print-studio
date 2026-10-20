import React from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Briefcase, Award, Camera, Sliders } from "lucide-react";

export type ActiveTab = "id_card" | "visiting_card" | "membership_card" | "photo_studio" | "calibration";

interface NavTabsProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useTranslation();

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: "id_card", label: t("nav.id_card"), icon: <CreditCard size={18} /> },
    { id: "visiting_card", label: t("nav.visiting_card"), icon: <Briefcase size={18} /> },
    { id: "membership_card", label: t("nav.membership_card"), icon: <Award size={18} /> },
    { id: "photo_studio", label: t("nav.photo_studio"), icon: <Camera size={18} /> },
    { id: "calibration", label: t("nav.calibration"), icon: <Sliders size={18} /> },
  ];

  return (
    <nav className="nav-tabs" aria-label="Main Navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onSelectTab(tab.id)}
          type="button"
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
