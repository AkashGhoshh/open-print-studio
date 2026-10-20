import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  solveA4VisitingCardSheet,
  generateSlotCutMarks,
  applyPaperFinishTransform,
  PaperFinish,
  VISITING_CARD_WIDTH_PX_300DPI,
  VISITING_CARD_HEIGHT_PX_300DPI,
  PAPER_A4_WIDTH_PX_300DPI,
  PAPER_A4_HEIGHT_PX_300DPI,
} from "@ops/core";
import { Upload, Printer, Download, Sparkles, SlidersHorizontal, RefreshCw } from "lucide-react";
import { exportSheetToPdf, downloadFile } from "../../services/print/pdf-export.js";

export const VisitingCardWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const [finish, setFinish] = useState<PaperFinish>("glossy");
  const [layoutMode, setLayoutMode] = useState<"pairs" | "repeated">("repeated");
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showCutMarks, setShowCutMarks] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frontCardCanvas, setFrontCardCanvas] = useState<HTMLCanvasElement | null>(null);
  const [backCardCanvas, setBackCardCanvas] = useState<HTMLCanvasElement | null>(null);

  // Generate default synthetic dummy card
  useEffect(() => {
    const dummy = document.createElement("canvas");
    dummy.width = VISITING_CARD_WIDTH_PX_300DPI;
    dummy.height = VISITING_CARD_HEIGHT_PX_300DPI;
    const ctx = dummy.getContext("2d");
    if (ctx) {
      // Elegant visiting card background
      const grad = ctx.createLinearGradient(0, 0, dummy.width, dummy.height);
      grad.addColorStop(0, "#1E293B");
      grad.addColorStop(1, "#0F172A");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, dummy.width, dummy.height);

      // Gold accent border
      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, dummy.width - 60, dummy.height - 60);

      // Specimen Watermark
      ctx.font = "bold 60px Inter, sans-serif";
      ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
      ctx.textAlign = "center";
      ctx.fillText("SPECIMEN VISITING CARD", dummy.width / 2, dummy.height / 2 + 20);

      // Card Content
      ctx.fillStyle = "#F8FAFC";
      ctx.font = "bold 44px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("ALPHA GRAPHICS & PRINTS", 70, 150);

      ctx.fillStyle = "#F59E0B";
      ctx.font = "600 28px Inter, sans-serif";
      ctx.fillText("CYBER CAFE & STUDIO SOLUTIONS", 70, 200);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "500 24px Inter, sans-serif";
      ctx.fillText("📞 +91 98765 43210  |  ✉️ contact@example.com", 70, 480);
      ctx.fillText("📍 Main Market, City Centre", 70, 520);
    }
    setFrontCardCanvas(dummy);
  }, []);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = VISITING_CARD_WIDTH_PX_300DPI;
        c.height = VISITING_CARD_HEIGHT_PX_300DPI;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, c.width, c.height);
          if (side === "front") {
            setFrontCardCanvas(c);
          } else {
            setBackCardCanvas(c);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Re-draw sheet canvas on changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = PAPER_A4_WIDTH_PX_300DPI;
    canvas.height = PAPER_A4_HEIGHT_PX_300DPI;

    // Sheet background (Pure White)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const layout = solveA4VisitingCardSheet({
      offsetX,
      offsetY,
      isFlipped,
      mode: layoutMode,
    });

    const pxPerMm = 300 / 25.4;

    for (const slot of layout.slots) {
      const slotX = Math.round(slot.xMm * pxPerMm);
      const slotY = Math.round(slot.yMm * pxPerMm);
      const slotW = Math.round(slot.widthMm * pxPerMm);
      const slotH = Math.round(slot.heightMm * pxPerMm);

      const srcCanvas = slot.side === "back" && backCardCanvas ? backCardCanvas : frontCardCanvas;

      if (srcCanvas) {
        ctx.drawImage(srcCanvas, slotX, slotY, slotW, slotH);

        // Apply paper finish adjustment if not plain
        if (finish !== "plain") {
          const imgData = ctx.getImageData(slotX, slotY, slotW, slotH);
          applyPaperFinishTransform(imgData.data, finish);
          ctx.putImageData(imgData, slotX, slotY);
        }
      } else {
        // Empty slot placeholder
        ctx.strokeStyle = "#CBD5E1";
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(slotX, slotY, slotW, slotH);
        ctx.setLineDash([]);
      }
    }

    // Render Cut Marks
    if (showCutMarks) {
      const marks = generateSlotCutMarks(layout.slots, 3.0);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = Math.round(0.20 * pxPerMm);
      ctx.beginPath();
      for (const line of marks) {
        ctx.moveTo(Math.round(line.x1Mm * pxPerMm), Math.round(line.y1Mm * pxPerMm));
        ctx.lineTo(Math.round(line.x2Mm * pxPerMm), Math.round(line.y2Mm * pxPerMm));
      }
      ctx.stroke();
    }
  }, [frontCardCanvas, backCardCanvas, finish, layoutMode, offsetX, offsetY, isFlipped, showCutMarks]);

  const handlePrint = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setStatusText(t("status.printing"));
      const bridge = (window as any).opsBridge;

      if (bridge && typeof bridge.printSheet === "function") {
        const res = await bridge.printSheet({
          silent: false,
          pageSize: "A4",
          landscape: false,
          scaleFactor: 100,
        });
        if (res.ok) {
          setStatusText(t("status.spooled"));
        } else {
          setStatusText(t("error.printer_error"));
        }
      } else {
        // In browser testing, trigger browser print
        window.print();
        setStatusText(t("status.spooled"));
      }
    } catch {
      setStatusText(t("error.printer_error"));
    }
  };

  const handleExportPdf = async () => {
    if (!frontCardCanvas) return;
    setIsExporting(true);
    setStatusText("Generating 1:1 Vector PDF...");

    try {
      const layout = solveA4VisitingCardSheet({
        offsetX,
        offsetY,
        isFlipped,
        mode: layoutMode,
      });

      const cardPairs = [
        {
          front: frontCardCanvas,
          back: backCardCanvas ?? frontCardCanvas,
        },
      ];

      const pdfBytes = await exportSheetToPdf(layout, cardPairs, {
        showCutMarks,
        showBorders: true,
      });

      const fileName = `ops_visiting_cards_a4_${Date.now()}.pdf`;
      downloadFile(pdfBytes, fileName, "application/pdf");
      setStatusText("Vector PDF exported successfully");
    } catch {
      setStatusText("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 120px)", padding: "16px 24px" }}>
      {/* Left Control Panel */}
      <div style={{
        width: 380,
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--border-radius-lg)",
        padding: 20,
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("nav.visiting_card")} (A4 10-Up)</h2>
        </div>

        {/* Upload Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <label className="btn btn-secondary" style={{ flex: 1, cursor: "pointer", textAlign: "center" }}>
            <Upload size={16} />
            <span>{t("visiting.front_card")}</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, "front")} />
          </label>
          {layoutMode === "pairs" && (
            <label className="btn btn-secondary" style={{ flex: 1, cursor: "pointer", textAlign: "center" }}>
              <Upload size={16} />
              <span>{t("visiting.back_card")}</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileUpload(e, "back")} />
            </label>
          )}
        </div>

        {/* Paper Finish Preset */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
            {t("visiting.finish")}
          </label>
          <select
            className="input-select"
            value={finish}
            onChange={(e) => setFinish(e.target.value as PaperFinish)}
          >
            <option value="glossy">{t("visiting.glossy")}</option>
            <option value="matte">{t("visiting.matte")}</option>
            <option value="plain">{t("visiting.plain")}</option>
          </select>
        </div>

        {/* Layout Mode */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
            {t("visiting.layout_mode")}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`btn ${layoutMode === "repeated" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.8125rem" }}
              onClick={() => setLayoutMode("repeated")}
            >
              {t("visiting.repeated")}
            </button>
            <button
              type="button"
              className={`btn ${layoutMode === "pairs" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.8125rem" }}
              onClick={() => setLayoutMode("pairs")}
            >
              {t("visiting.pairs")}
            </button>
          </div>
        </div>

        {/* Nudge Adjustments */}
        <div style={{ backgroundColor: "var(--bg-app)", padding: 12, borderRadius: "var(--border-radius-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <SlidersHorizontal size={16} />
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{t("label.nudge_offset")}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Offset X (mm)</label>
              <input
                type="number"
                step="0.5"
                value={offsetX}
                onChange={(e) => setOffsetX(parseFloat(e.target.value) || 0)}
                className="input-text"
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Offset Y (mm)</label>
              <input
                type="number"
                step="0.5"
                value={offsetY}
                onChange={(e) => setOffsetY(parseFloat(e.target.value) || 0)}
                className="input-text"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={showCutMarks}
              onChange={(e) => setShowCutMarks(e.target.checked)}
            />
            {t("label.cut_marks")} (3.0 mm)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={isFlipped}
              onChange={(e) => setIsFlipped(e.target.checked)}
            />
            {t("label.mirror_flip")}
          </label>
        </div>

        {/* Actions */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {statusText && (
            <div style={{ fontSize: "0.8125rem", color: "var(--accent-primary)", textAlign: "center" }}>
              {statusText}
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px 16px" }}
            onClick={handlePrint}
          >
            <Printer size={18} />
            <span>{t("action.print_now")}</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "100%" }}
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            <Download size={18} />
            <span>{isExporting ? "Exporting..." : t("action.save_pdf")}</span>
          </button>
        </div>
      </div>

      {/* Right Canvas Preview */}
      <div style={{
        flex: 1,
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--border-radius-lg)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto",
        padding: 24
      }}>
        <div style={{
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border-strong)",
          maxHeight: "100%",
          display: "flex"
        }}>
          <canvas
            ref={canvasRef}
            style={{
              maxHeight: "calc(100vh - 180px)",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block"
            }}
          />
        </div>
      </div>
    </div>
  );
};
