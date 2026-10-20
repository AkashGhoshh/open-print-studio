import React, { useState } from "react";
import { Lock, AlertCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PasswordDialogProps {
  isOpen: boolean;
  errorMessage?: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({
  isOpen,
  errorMessage,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
      // Immediately clear local state
      setPassword("");
    }
  };

  const handleCancel = () => {
    setPassword("");
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-2xl animate-fade-in"
        style={{
          backgroundColor: "var(--ops-bg-surface)",
          border: "1px solid var(--ops-border-strong)",
          color: "var(--ops-text-primary)",
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--ops-border)" }}>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" style={{ color: "var(--ops-primary)" }} />
            <h3 className="font-semibold text-lg">{t("passwordDialog.title", "Protected Document")}</h3>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded hover:bg-slate-700/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-300">
          {t("passwordDialog.description", "This document is encrypted with a password. Please enter the password to decrypt.")}
        </p>

        <div
          className="mt-3 p-3 rounded-lg text-xs leading-relaxed"
          style={{ backgroundColor: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.3)" }}
        >
          <span className="font-semibold text-blue-400">💡 Aadhaar Password Tip:</span> First 4 letters of name in CAPITAL + 4-digit Birth Year (e.g., <span className="font-mono font-bold text-white">RAME1990</span>).
        </div>

        {errorMessage && (
          <div
            className="mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 text-red-300"
            style={{ backgroundColor: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.4)" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {t("passwordDialog.passwordLabel", "Document Password")}
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-3 py-2.5 rounded-lg text-sm transition-all focus:outline-none"
              style={{
                backgroundColor: "var(--ops-bg-card)",
                border: "1px solid var(--ops-border)",
                color: "var(--ops-text-primary)",
              }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="ops-btn"
              style={{ backgroundColor: "transparent", border: "1px solid var(--ops-border)" }}
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="ops-btn ops-btn-primary"
            >
              {t("passwordDialog.submit", "Unlock & Decrypt")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
