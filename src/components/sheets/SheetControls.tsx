import React from "react";
import {
  FileText,
  Printer,
  Download,
  Image as ImageIcon,
  Sliders,
  Check,
  Scissors,
  Square,
  FlipHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NudgeConfig } from "@ops/core";

export type SheetMediaType = "A4" | "4x6" | "PVC_TRAY";

interface SheetControlsProps {
  mediaType: SheetMediaType;
  onMediaTypeChange: (type: SheetMediaType) => void;
  nudge: NudgeConfig;
  onNudgeChange: (nudge: NudgeConfig) => void;
  showCutMarks: boolean;
  onShowCutMarksChange: (val: boolean) => void;
  showBorders: boolean;
  onShowBordersChange: (val: boolean) => void;
  onPrint: () => void;
  onExportPdf: () => void;
  onExportPng: () => void;
  isPrinting?: boolean;
}

export const SheetControls: React.FC<SheetControlsProps> = ({
  mediaType,
  onMediaTypeChange,
  nudge,
  onNudgeChange,
  showCutMarks,
  onShowCutMarksChange,
  showBorders,
  onShowBordersChange,
  onPrint,
  onExportPdf,
  onExportPng,
  isPrinting = false,
}) => {
  const { t } = useTranslation();

  const handleOffsetX = (val: number) => {
    onNudgeChange({ ...nudge, offsetX: val });
  };

  const handleOffsetY = (val: number) => {
    onNudgeChange({ ...nudge, offsetY: val });
  };

  const handleCardScale = (val: number) => {
    onNudgeChange({ ...nudge, cardScale: val });
  };

  const handleFlip = (val: boolean) => {
    onNudgeChange({ ...nudge, isFlipped: val });
  };

  return (
    <div
      className="p-5 rounded-xl border flex flex-col gap-5"
      style={{
        backgroundColor: "var(--ops-bg-card)",
        borderColor: "var(--ops-border)",
      }}
    >
      {/* 1. Paper Media Presets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Print Media Target
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onMediaTypeChange("A4")}
            className="p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all"
            style={{
              backgroundColor: mediaType === "A4" ? "var(--ops-primary)" : "var(--ops-bg-surface)",
              borderColor: mediaType === "A4" ? "var(--ops-primary)" : "var(--ops-border)",
              color: mediaType === "A4" ? "#FFFFFF" : "var(--ops-text-primary)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">A4 Paper</span>
              {mediaType === "A4" && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-[10px] opacity-80">5 Card Pairs (10-Up)</span>
            <span className="text-[9px] font-mono opacity-60">210 × 297 mm</span>
          </button>

          <button
            type="button"
            onClick={() => onMediaTypeChange("4x6")}
            className="p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all"
            style={{
              backgroundColor: mediaType === "4x6" ? "var(--ops-primary)" : "var(--ops-bg-surface)",
              borderColor: mediaType === "4x6" ? "var(--ops-primary)" : "var(--ops-border)",
              color: mediaType === "4x6" ? "#FFFFFF" : "var(--ops-text-primary)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">4×6 Photo</span>
              {mediaType === "4x6" && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-[10px] opacity-80">1 Card Pair (2-Up)</span>
            <span className="text-[9px] font-mono opacity-60">101.6 × 152.4 mm</span>
          </button>

          <button
            type="button"
            onClick={() => onMediaTypeChange("PVC_TRAY")}
            className="p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all"
            style={{
              backgroundColor: mediaType === "PVC_TRAY" ? "var(--ops-primary)" : "var(--ops-bg-surface)",
              borderColor: mediaType === "PVC_TRAY" ? "var(--ops-primary)" : "var(--ops-border)",
              color: mediaType === "PVC_TRAY" ? "#FFFFFF" : "var(--ops-text-primary)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs">PVC Tray</span>
              {mediaType === "PVC_TRAY" && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-[10px] opacity-80">Direct Carrier (2 Cards)</span>
            <span className="text-[9px] font-mono opacity-60">Epson / Canon J-Tray</span>
          </button>
        </div>
      </div>

      {/* 2. Nudge & Scale Calibration Sliders */}
      <div className="border-t border-slate-700/50 pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Nudge & Margin Calibration (mm)</span>
          </label>
          <button
            type="button"
            onClick={() => onNudgeChange({ offsetX: 0, offsetY: 0, cardScale: 1.0, isFlipped: false })}
            className="text-[11px] text-blue-400 hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Offset X:</span>
              <span className="font-mono text-blue-400 font-bold">{(nudge.offsetX ?? 0).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="0.5"
              value={nudge.offsetX ?? 0}
              onChange={(e) => handleOffsetX(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Offset Y:</span>
              <span className="font-mono text-blue-400 font-bold">{(nudge.offsetY ?? 0).toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="0.5"
              value={nudge.offsetY ?? 0}
              onChange={(e) => handleOffsetY(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Scale:</span>
              <span className="font-mono text-blue-400 font-bold">{Math.round((nudge.cardScale ?? 1.0) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.95"
              max="1.05"
              step="0.005"
              value={nudge.cardScale ?? 1.0}
              onChange={(e) => handleCardScale(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Toggles */}
      <div className="border-t border-slate-700/50 pt-4 flex flex-wrap gap-5 text-xs text-slate-300">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCutMarks}
            onChange={(e) => onShowCutMarksChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Vector Cut Marks</span>
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showBorders}
            onChange={(e) => onShowBordersChange(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-1.5">
            <Square className="w-3.5 h-3.5 text-slate-400" />
            <span>Card Outline Border</span>
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={Boolean(nudge.isFlipped)}
            onChange={(e) => handleFlip(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="flex items-center gap-1.5">
            <FlipHorizontal className="w-3.5 h-3.5 text-purple-400" />
            <span>Mirror / Flip Mode</span>
          </span>
        </label>
      </div>

      {/* 4. Action Buttons */}
      <div className="border-t border-slate-700/50 pt-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onExportPdf}
            className="ops-btn text-xs flex items-center gap-1.5"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#FCA5A5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Vector PDF</span>
          </button>

          <button
            type="button"
            onClick={onExportPng}
            className="ops-btn text-xs flex items-center gap-1.5"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#6EE7B7",
              border: "1px solid rgba(16, 185, 129, 0.3)",
            }}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Save 300 DPI PNG</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onPrint}
          disabled={isPrinting}
          className="ops-btn ops-btn-primary flex items-center gap-2 text-sm font-semibold px-5 py-2.5"
        >
          <Printer className="w-4 h-4" />
          <span>{isPrinting ? "Spooling Print..." : "Print Sheet (100% Scale)"}</span>
        </button>
      </div>
    </div>
  );
};
