import React, { useState, useEffect, useMemo } from "react";
import {
  Printer,
  FileCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  solveA4IdCardSheet,
  solve4x6IdCardSheet,
  solvePvcTraySheet,
  type SheetLayoutResult,
  type NudgeConfig,
} from "@ops/core";
import {
  renderSheetToCanvas,
  type CardSideImageSource,
} from "../../services/print/sheet-renderer";
import {
  exportSheetToPdf,
  downloadFile,
} from "../../services/print/pdf-export";
import { SheetControls, type SheetMediaType } from "./SheetControls";
import { SheetPreview } from "./SheetPreview";

interface SheetWorkspaceProps {
  cardPairs?: CardSideImageSource[];
  onBackToCard?: () => void;
}

export const SheetWorkspace: React.FC<SheetWorkspaceProps> = ({
  cardPairs = [],
  onBackToCard,
}) => {
  const { t } = useTranslation();

  // Media Preset & Nudge State
  const [mediaType, setMediaType] = useState<SheetMediaType>("A4");
  const [nudge, setNudge] = useState<NudgeConfig>({
    offsetX: 0,
    offsetY: 0,
    cardScale: 1.0,
    isFlipped: false,
  });

  const [showCutMarks, setShowCutMarks] = useState<boolean>(true);
  const [showBorders, setShowBorders] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Compute Layout based on selected media and nudge parameters
  const layout: SheetLayoutResult = useMemo(() => {
    switch (mediaType) {
      case "A4":
        return solveA4IdCardSheet(nudge);
      case "4x6":
        return solve4x6IdCardSheet(nudge);
      case "PVC_TRAY":
        return solvePvcTraySheet(nudge);
    }
  }, [mediaType, nudge]);

  // Render sheet canvas
  const sheetCanvas: HTMLCanvasElement | null = useMemo(() => {
    try {
      return renderSheetToCanvas(layout, cardPairs, {
        showCutMarks,
        showCardBorders: showBorders,
      });
    } catch (e: any) {
      console.error("Sheet canvas render error:", e);
      return null;
    }
  }, [layout, cardPairs, showCutMarks, showBorders]);

  // Print via Electron or Browser
  const handlePrint = async () => {
    setIsPrinting(true);
    setFeedbackMessage(null);

    const bridge = (window as any).opsBridge;
    if (bridge && typeof bridge.printSheet === "function") {
      try {
        const pageSize = mediaType === "A4" ? "A4" : mediaType === "4x6" ? "4x6" : { width: 130000, height: 220000 };
        const result = await bridge.printSheet({
          silent: false,
          pageSize,
          landscape: false,
          scaleFactor: 100,
        });

        if (result.ok) {
          setFeedbackMessage({ type: "success", text: "Print job spooled successfully at 100% scale with zero margins." });
        } else {
          setFeedbackMessage({ type: "error", text: `Spooler error: ${result.error || "Printer reported failure."}` });
        }
      } catch (err: any) {
        setFeedbackMessage({ type: "error", text: `Print IPC failed: ${err.message}` });
      } finally {
        setIsPrinting(false);
      }
    } else {
      // Fallback in web preview mode
      window.print();
      setIsPrinting(false);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    try {
      const pdfBytes = await exportSheetToPdf(layout, cardPairs, {
        showCutMarks,
        showBorders,
      });
      const fileName = `PrintSheet_${layout.sheetType}_${Date.now()}.pdf`;
      downloadFile(pdfBytes, fileName, "application/pdf");
      setFeedbackMessage({ type: "success", text: `Saved print-ready PDF: ${fileName}` });
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: `Failed to export PDF: ${err.message}` });
    }
  };

  // Export 300 DPI PNG
  const handleExportPng = () => {
    if (!sheetCanvas) return;
    try {
      sheetCanvas.toBlob((blob) => {
        if (blob) {
          const fileName = `PrintSheet_${layout.sheetType}_300DPI_${Date.now()}.png`;
          downloadFile(blob, fileName, "image/png");
          setFeedbackMessage({ type: "success", text: `Saved 300 DPI PNG: ${fileName}` });
        }
      }, "image/png");
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: `Failed to save PNG: ${err.message}` });
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 max-w-7xl mx-auto w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackToCard && (
            <button
              onClick={onBackToCard}
              className="p-2 rounded-lg hover:bg-slate-700/60 transition-colors text-slate-300"
              title="Back to ID Card Crop"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Printer className="w-6 h-6 text-blue-500" />
              Sheet Layout & Secure Printing
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero-margin 100% scale output, dynamic layout solver, vector cut marks, and print-ready PDF/PNG export.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-200"
              : "bg-red-950/60 border border-red-500/40 text-red-200"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Controls + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5">
          <SheetControls
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
            nudge={nudge}
            onNudgeChange={setNudge}
            showCutMarks={showCutMarks}
            onShowCutMarksChange={setShowCutMarks}
            showBorders={showBorders}
            onShowBordersChange={setShowBorders}
            onPrint={handlePrint}
            onExportPdf={handleExportPdf}
            onExportPng={handleExportPng}
            isPrinting={isPrinting}
          />
        </div>

        {/* Right Column: Interactive Sheet Preview (7 cols) */}
        <div className="lg:col-span-7">
          <SheetPreview sheetCanvas={sheetCanvas} layout={layout} />
        </div>
      </div>
    </div>
  );
};
