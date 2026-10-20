import React, { useState, useEffect } from "react";
import {
  History,
  X,
  Trash2,
  FolderOpen,
  Shield,
  ShieldAlert,
  Clock,
  Phone,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  indexedDbService,
  type RecentDesignRecord,
} from "../../services/storage/indexeddb-service";
import { loadSettings, saveSettings } from "../../services/storage/settings-schema";

interface RecentDesignsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDesign: (design: RecentDesignRecord) => void;
}

export const RecentDesignsDrawer: React.FC<RecentDesignsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDesign,
}) => {
  const { t } = useTranslation();
  const [designs, setDesigns] = useState<RecentDesignRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [privacyMode, setPrivacyMode] = useState<boolean>(() => loadSettings().privacyMode);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const fetchDesigns = async () => {
    setIsLoading(true);
    try {
      const records = await indexedDbService.getRecentDesigns(25);
      setDesigns(records);
    } catch (e) {
      console.error("Failed to load recent designs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDesigns();
    }
  }, [isOpen]);

  const handleTogglePrivacyMode = () => {
    const next = !privacyMode;
    setPrivacyMode(next);
    const settings = loadSettings();
    saveSettings({ ...settings, privacyMode: next });
  };

  const handleDeleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await indexedDbService.deleteRecentDesign(id);
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete design:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await indexedDbService.clearAllHistory();
      setDesigns([]);
      setConfirmClear(false);
    } catch (err) {
      console.error("Failed to clear all history:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full max-w-md h-full flex flex-col p-6 shadow-2xl animate-fade-in border-l"
        style={{
          backgroundColor: "var(--ops-bg-surface)",
          borderColor: "var(--ops-border)",
          color: "var(--ops-text-primary)",
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Recent Card Sessions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Privacy Mode Banner & Toggle */}
        <div
          className="my-4 p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: privacyMode ? "rgba(16, 185, 129, 0.1)" : "rgba(234, 179, 8, 0.1)",
            borderColor: privacyMode ? "rgba(16, 185, 129, 0.3)" : "rgba(234, 179, 8, 0.3)",
          }}
        >
          <div className="flex items-start gap-2">
            {privacyMode ? (
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold block text-slate-100">
                {privacyMode ? "Privacy Mode Active" : "Standard History Mode"}
              </span>
              <span className="text-[11px] text-slate-300">
                {privacyMode
                  ? "Zero customer data or crops are saved to disk."
                  : "Saved to local IndexedDB (auto-expires in 24h)."}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTogglePrivacyMode}
            className="px-2.5 py-1 rounded text-[11px] font-medium border transition-colors shrink-0"
            style={{
              backgroundColor: privacyMode ? "var(--ops-primary)" : "transparent",
              borderColor: "var(--ops-border)",
              color: privacyMode ? "#FFFFFF" : "var(--ops-text-primary)",
            }}
          >
            {privacyMode ? "Turn Off" : "Enable"}
          </button>
        </div>

        {/* List of Recent Designs */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading sessions...</div>
          ) : designs.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-700">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-300">No recent design sessions</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {privacyMode
                  ? "Privacy Mode is currently enabled, preventing history writes."
                  : "Processed documents will automatically appear here."}
              </p>
            </div>
          ) : (
            designs.map((des) => (
              <div
                key={des.id}
                onClick={() => {
                  onSelectDesign(des);
                  onClose();
                }}
                className="p-3 rounded-lg border hover:border-blue-500 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                style={{
                  backgroundColor: "var(--ops-bg-card)",
                  borderColor: "var(--ops-border)",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded bg-blue-500/10 text-blue-400 shrink-0">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-slate-100 group-hover:text-blue-400 transition-colors">
                      {des.title || "ID Card Session"}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(des.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {des.customerMobile && (
                        <span className="flex items-center gap-1 font-mono text-blue-300">
                          <Phone className="w-3 h-3" />
                          {des.customerMobile}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteOne(des.id, e)}
                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                  title="Delete Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
          {confirmClear ? (
            <div className="flex items-center gap-2 w-full justify-between animate-fade-in">
              <span className="text-[11px] text-red-300 font-semibold">Confirm wipe all history?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold text-[11px]"
                >
                  Yes, Wipe All
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-[10px] text-slate-500">Auto-expires after 24 hours</span>
              {designs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
