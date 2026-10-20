import React from "react";
import { Sliders, ShieldCheck, FlipHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EnhancementToolbarProps {
  boldLevel: number;
  onBoldLevelChange: (level: number) => void;
  cleanDisclaimer: boolean;
  onCleanDisclaimerChange: (clean: boolean) => void;
  hasDisclaimerRegion: boolean;
  isFlipped: boolean;
  onFlipChange: (flipped: boolean) => void;
}

const BOLD_LEVEL_LABELS = [
  "Off (0)",
  "Subtle (1)",
  "Medium (2)",
  "Standard (3)",
  "Heavy (4)",
  "Max (5)",
];

export const EnhancementToolbar: React.FC<EnhancementToolbarProps> = ({
  boldLevel,
  onBoldLevelChange,
  cleanDisclaimer,
  onCleanDisclaimerChange,
  hasDisclaimerRegion,
  isFlipped,
  onFlipChange,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className="p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4 border"
      style={{
        backgroundColor: "var(--ops-bg-card)",
        borderColor: "var(--ops-border)",
      }}
    >
      {/* Text Darkener Slider */}
      <div className="flex items-center gap-3 min-w-[260px]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Faint Text Darkening:</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={boldLevel}
          onChange={(e) => onBoldLevelChange(parseInt(e.target.value, 10))}
          className="w-28 accent-blue-500 cursor-pointer"
        />
        <span
          className="text-xs px-2 py-0.5 rounded font-mono font-medium"
          style={{
            backgroundColor: boldLevel > 0 ? "rgba(37, 99, 235, 0.2)" : "var(--ops-bg-surface)",
            color: boldLevel > 0 ? "var(--ops-primary-hover)" : "var(--ops-text-muted)",
          }}
        >
          {BOLD_LEVEL_LABELS[boldLevel]}
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* Opt-in UIDAI Disclaimer Cleaner */}
        {hasDisclaimerRegion && (
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
            <input
              type="checkbox"
              checked={cleanDisclaimer}
              onChange={(e) => onCleanDisclaimerChange(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clean UIDAI Disclaimer</span>
            </span>
          </label>
        )}

        {/* Mirror / Flip Mode */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
          <input
            type="checkbox"
            checked={isFlipped}
            onChange={(e) => onFlipChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-1">
            <FlipHorizontal className="w-3.5 h-3.5 text-purple-400" />
            <span>Mirror / Flip Mode</span>
          </span>
        </label>
      </div>
    </div>
  );
};
