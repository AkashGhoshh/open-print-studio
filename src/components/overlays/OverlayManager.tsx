import React from "react";
import { Phone, Award, Sliders } from "lucide-react";
import type {
  MobileOverlayConfig,
  StampOverlayConfig,
  OverlayCornerPosition,
} from "@ops/core";

interface OverlayManagerProps {
  // Mobile overlay state
  enableMobileOverlay: boolean;
  onEnableMobileOverlayChange: (enabled: boolean) => void;
  mobileConfig: MobileOverlayConfig;
  onMobileConfigChange: (cfg: MobileOverlayConfig) => void;

  // Stamp overlay state
  enableStampOverlay: boolean;
  onEnableStampOverlayChange: (enabled: boolean) => void;
  stampConfig: StampOverlayConfig;
  onStampConfigChange: (cfg: StampOverlayConfig) => void;
}

export const OverlayManager: React.FC<OverlayManagerProps> = ({
  enableMobileOverlay,
  onEnableMobileOverlayChange,
  mobileConfig,
  onMobileConfigChange,
  enableStampOverlay,
  onEnableStampOverlayChange,
  stampConfig,
  onStampConfigChange,
}) => {
  return (
    <div
      className="p-4 rounded-xl border flex flex-col gap-4 text-xs"
      style={{
        backgroundColor: "var(--ops-bg-card)",
        borderColor: "var(--ops-border)",
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
        <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Card Overlays & Badges</span>
        </h4>
        <span className="text-[10px] text-slate-400">Volatile in-memory compositing</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Mobile Overlay */}
        <div
          className="p-3 rounded-lg border flex flex-col gap-2.5"
          style={{
            backgroundColor: enableMobileOverlay ? "rgba(37, 99, 235, 0.08)" : "var(--ops-bg-surface)",
            borderColor: enableMobileOverlay ? "rgba(37, 99, 235, 0.4)" : "var(--ops-border)",
          }}
        >
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={enableMobileOverlay}
              onChange={(e) => onEnableMobileOverlayChange(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>Customer Mobile Number on Card</span>
          </label>

          {enableMobileOverlay && (
            <div className="space-y-2 pt-1 animate-fade-in">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Prefix (e.g., Mob: )"
                  value={mobileConfig.prefix ?? "Mob: "}
                  onChange={(e) => onMobileConfigChange({ ...mobileConfig, prefix: e.target.value })}
                  className="w-24 px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono"
                />
                <input
                  type="text"
                  placeholder="10-digit number"
                  maxLength={12}
                  value={mobileConfig.mobileNumber}
                  onChange={(e) => onMobileConfigChange({ ...mobileConfig, mobileNumber: e.target.value })}
                  className="flex-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400 text-[11px]">Position:</span>
                <select
                  value={mobileConfig.position ?? "bottom-right"}
                  onChange={(e) =>
                    onMobileConfigChange({
                      ...mobileConfig,
                      position: e.target.value as OverlayCornerPosition,
                    })
                  }
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs"
                >
                  <option value="bottom-right">Bottom-Right</option>
                  <option value="bottom-left">Bottom-Left</option>
                  <option value="top-right">Top-Right</option>
                  <option value="top-left">Top-Left</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Official Stamp / Signature Overlay */}
        <div
          className="p-3 rounded-lg border flex flex-col gap-2.5"
          style={{
            backgroundColor: enableStampOverlay ? "rgba(168, 85, 247, 0.08)" : "var(--ops-bg-surface)",
            borderColor: enableStampOverlay ? "rgba(168, 85, 247, 0.4)" : "var(--ops-border)",
          }}
        >
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-200">
            <input
              type="checkbox"
              checked={enableStampOverlay}
              onChange={(e) => onEnableStampOverlayChange(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span>Official Stamp / Seal Overlay</span>
          </label>

          {enableStampOverlay && (
            <div className="space-y-2 pt-1 animate-fade-in">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Width (mm):</span>
                <span className="font-mono text-purple-300 font-bold">{stampConfig.widthMm} mm</span>
              </div>
              <input
                type="range"
                min="15"
                max="45"
                step="1"
                value={stampConfig.widthMm}
                onChange={(e) =>
                  onStampConfigChange({ ...stampConfig, widthMm: parseInt(e.target.value, 10) })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300">Opacity:</span>
                <span className="font-mono text-purple-300 font-bold">
                  {Math.round((stampConfig.opacity ?? 0.85) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={stampConfig.opacity ?? 0.85}
                onChange={(e) =>
                  onStampConfigChange({ ...stampConfig, opacity: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
