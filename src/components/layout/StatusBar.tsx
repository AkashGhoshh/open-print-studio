import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Keyboard } from "lucide-react";

interface StatusBarProps {
  statusMessage?: string;
  paperInfo?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  statusMessage,
  paperInfo = "A4 (210×297mm) • 300 DPI • 100% Scale",
}) => {
  const { t } = useTranslation();

  return (
    <footer className="app-status-bar">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CheckCircle2 size={14} color="#10B981" />
        <span>{statusMessage || t("status.ready")}</span>
      </div>

      <div>
        <span>{paperInfo}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", opacity: 0.8 }}>
        <Keyboard size={13} />
        <span>Ctrl+P: Print • Ctrl+O: Open • Ctrl+Z: Undo • F: Flip</span>
      </div>
    </footer>
  );
};
