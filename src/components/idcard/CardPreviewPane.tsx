import React, { useRef, useEffect } from "react";
import { RotateCw, RotateCcw, CheckCircle, Maximize2 } from "lucide-react";
import type { RotationAngle } from "@ops/core";
import { CR80_DIMENSIONS, CR80_PIXELS_300DPI } from "@ops/core";

interface CardPreviewPaneProps {
  sideTitle: string;
  canvas: HTMLCanvasElement | null;
  rotation: RotationAngle;
  onRotate: (newRotation: RotationAngle) => void;
  isFlipped?: boolean;
}

export const CardPreviewPane: React.FC<CardPreviewPaneProps> = ({
  sideTitle,
  canvas,
  rotation,
  onRotate,
  isFlipped = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvas) return;
    containerRef.current.innerHTML = "";

    // Clone or append canvas
    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = canvas.width;
    displayCanvas.height = canvas.height;
    const ctx = displayCanvas.getContext("2d");
    if (ctx) {
      if (isFlipped) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(canvas, 0, 0);
    }

    displayCanvas.style.maxWidth = "100%";
    displayCanvas.style.height = "auto";
    displayCanvas.style.borderRadius = "8px";
    displayCanvas.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.4)";
    displayCanvas.style.border = "1px solid rgba(255, 255, 255, 0.1)";

    containerRef.current.appendChild(displayCanvas);
  }, [canvas, isFlipped]);

  const rotateLeft = () => {
    const next = ((rotation - 90 + 360) % 360) as RotationAngle;
    onRotate(next);
  };

  const rotateRight = () => {
    const next = ((rotation + 90) % 360) as RotationAngle;
    onRotate(next);
  };

  return (
    <div
      className="flex-1 rounded-xl p-4 flex flex-col border"
      style={{
        backgroundColor: "var(--ops-bg-card)",
        borderColor: "var(--ops-border)",
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/50">
        <div>
          <h4 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {sideTitle}
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {CR80_DIMENSIONS.widthMm} × {CR80_DIMENSIONS.heightMm} mm (CR-80 standard @ 300 DPI)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={rotateLeft}
            title="Rotate Left 90°"
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 w-10 text-center">
            {rotation}°
          </span>
          <button
            onClick={rotateRight}
            title="Rotate Right 90°"
            className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 min-h-[220px] rounded-lg flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.25)",
          backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {canvas ? (
          <div ref={containerRef} className="max-w-full flex justify-center" />
        ) : (
          <div className="text-center text-xs text-slate-500">
            No document loaded
          </div>
        )}
      </div>
    </div>
  );
};
