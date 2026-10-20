import React, { useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { SheetLayoutResult } from "@ops/core";

interface SheetPreviewProps {
  sheetCanvas: HTMLCanvasElement | null;
  layout: SheetLayoutResult;
}

export const SheetPreview: React.FC<SheetPreviewProps> = ({
  sheetCanvas,
  layout,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(0.35); // Default scaled fit

  useEffect(() => {
    if (!containerRef.current || !sheetCanvas) return;
    containerRef.current.innerHTML = "";

    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = sheetCanvas.width;
    displayCanvas.height = sheetCanvas.height;

    const ctx = displayCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(sheetCanvas, 0, 0);
    }

    displayCanvas.style.width = `${Math.round(sheetCanvas.width * zoomLevel)}px`;
    displayCanvas.style.height = `${Math.round(sheetCanvas.height * zoomLevel)}px`;
    displayCanvas.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.5)";
    displayCanvas.style.backgroundColor = "#FFFFFF";

    containerRef.current.appendChild(displayCanvas);
  }, [sheetCanvas, zoomLevel]);

  return (
    <div
      className="flex-1 rounded-xl p-4 flex flex-col border overflow-hidden"
      style={{
        backgroundColor: "var(--ops-bg-card)",
        borderColor: "var(--ops-border)",
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-700/50">
        <div>
          <h4 className="font-semibold text-sm text-slate-100">Live Print Sheet Preview</h4>
          <span className="text-[11px] font-mono text-slate-400">
            {layout.sheetWidthMm} × {layout.sheetHeightMm} mm ({layout.sheetType} • {layout.cardCount} Cards / {layout.pairCount} Pairs)
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.15, z - 0.05))}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(1.0, z + 0.05))}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(0.35)}
            className="px-2 py-1 rounded hover:bg-slate-700 text-[10px] text-blue-400 font-medium"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1.0)}
            className="px-2 py-1 rounded hover:bg-slate-700 text-[10px] text-blue-400 font-medium"
          >
            100%
          </button>
        </div>
      </div>

      {/* Sheet Preview Scroll Container with Millimeter Grid Background */}
      <div
        className="flex-1 min-h-[460px] rounded-lg p-6 flex items-center justify-center overflow-auto relative"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backgroundImage: "radial-gradient(#475569 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div ref={containerRef} className="flex justify-center items-center" />
      </div>
    </div>
  );
};
