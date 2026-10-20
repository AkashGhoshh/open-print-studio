import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  solvePassportGrid,
  generateSlotCutMarks,
  applyPhotoAdjustments,
  compositeCutoutOverBackground,
  checkLowResolution,
  PhotoPresetType,
  PhotoMediaPaper,
  StudioBackgroundColor,
  STUDIO_BG_PRESETS,
  PAPER_4X6_WIDTH_PX_300DPI,
  PAPER_4X6_HEIGHT_PX_300DPI,
  PAPER_A4_WIDTH_PX_300DPI,
  PAPER_A4_HEIGHT_PX_300DPI,
} from "@ops/core";
import {
  Camera,
  Upload,
  Printer,
  Download,
  Sparkles,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { photoSegmenterService } from "../../services/photo/photo-segmenter.js";
import { exportSheetToPdf, downloadFile } from "../../services/print/pdf-export.js";

export const PhotoStudioWorkspace: React.FC = () => {
  const { t } = useTranslation();

  // Photo settings
  const [paper, setPaper] = useState<PhotoMediaPaper>("4x6");
  const [preset, setPreset] = useState<PhotoPresetType>("passport_in");
  const [requestedCount, setRequestedCount] = useState<number>(8);
  const [bgColor, setBgColor] = useState<StudioBackgroundColor>("studio_blue");

  // Tonal adjustments
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);

  // Status & AI state
  const [isSegmenting, setIsSegmenting] = useState<boolean>(false);
  const [lowResWarning, setLowResWarning] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Canvases
  const sheetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rawPhotoCanvas, setRawPhotoCanvas] = useState<HTMLCanvasElement | null>(null);
  const [cutoutCanvas, setCutoutCanvas] = useState<HTMLCanvasElement | null>(null);

  // Generate default synthetic specimen portrait
  useEffect(() => {
    const dummy = document.createElement("canvas");
    dummy.width = 800;
    dummy.height = 1000;
    const ctx = dummy.getContext("2d");
    if (ctx) {
      // Natural gradient background
      ctx.fillStyle = "#E2E8F0";
      ctx.fillRect(0, 0, dummy.width, dummy.height);

      // Person silhouette (head and shoulders)
      ctx.fillStyle = "#334155";
      // Shoulders
      ctx.beginPath();
      ctx.ellipse(400, 900, 360, 240, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = "#FBBF24";
      ctx.beginPath();
      ctx.ellipse(400, 420, 180, 220, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.ellipse(400, 320, 190, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specimen Watermark
      ctx.font = "bold 56px Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.textAlign = "center";
      ctx.fillText("SPECIMEN PHOTO", 400, 560);
    }
    setRawPhotoCanvas(dummy);
  }, []);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setRawPhotoCanvas(c);
          setCutoutCanvas(null); // Reset segmentation on new image

          // Low resolution check
          const res = checkLowResolution(img.width, img.height, 600);
          if (res.isLowRes) {
            setLowResWarning(res.warning || t("photo.low_res_warning"));
          } else {
            setLowResWarning(null);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Run AI Background Removal
  const handleRemoveBackground = async () => {
    if (!rawPhotoCanvas) return;
    setIsSegmenting(true);
    setStatusText(t("status.segmenting"));

    try {
      const result = await photoSegmenterService.segmentPortrait(rawPhotoCanvas);

      // Create new cutout canvas
      const cutout = document.createElement("canvas");
      cutout.width = result.width;
      cutout.height = result.height;
      const cCtx = cutout.getContext("2d");
      if (!cCtx) return;

      cCtx.drawImage(rawPhotoCanvas, 0, 0);
      const imgData = cCtx.getImageData(0, 0, cutout.width, cutout.height);

      // Apply background color replacement with feathered alpha mask
      compositeCutoutOverBackground(imgData.data, result.alphaMask, bgColor);
      cCtx.putImageData(imgData, 0, 0);

      setCutoutCanvas(cutout);
      setStatusText(`Background removed in ${(result.durationMs / 1000).toFixed(2)}s`);
    } catch {
      setStatusText("AI segmentation failed");
    } finally {
      setIsSegmenting(false);
    }
  };

  // Re-composite when background color changes on existing cutout
  useEffect(() => {
    if (cutoutCanvas && rawPhotoCanvas) {
      handleRemoveBackground();
    }
  }, [bgColor]);

  // Re-render Photo Sheet on canvas
  useEffect(() => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pxPerMm = 300 / 25.4;

    const layout = solvePassportGrid({
      paper,
      preset,
      requestedCount,
      gapMm: 3.0,
    });

    canvas.width = Math.round(layout.sheetWidthMm * pxPerMm);
    canvas.height = Math.round(layout.sheetHeightMm * pxPerMm);

    // Sheet background (Pure White)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const activePhoto = cutoutCanvas || rawPhotoCanvas;

    // Render single photo buffer with tonal adjustments
    let processedPhoto: HTMLCanvasElement | null = null;
    if (activePhoto) {
      processedPhoto = document.createElement("canvas");
      processedPhoto.width = activePhoto.width;
      processedPhoto.height = activePhoto.height;
      const pCtx = processedPhoto.getContext("2d");
      if (pCtx) {
        pCtx.drawImage(activePhoto, 0, 0);
        if (brightness !== 0 || contrast !== 0 || saturation !== 0) {
          const imgData = pCtx.getImageData(0, 0, processedPhoto.width, processedPhoto.height);
          applyPhotoAdjustments(imgData.data, { brightness, contrast, saturation });
          pCtx.putImageData(imgData, 0, 0);
        }
      }
    }

    // Render each photo slot on sheet
    for (const slot of layout.slots) {
      const slotX = Math.round(slot.xMm * pxPerMm);
      const slotY = Math.round(slot.yMm * pxPerMm);
      const slotW = Math.round(slot.widthMm * pxPerMm);
      const slotH = Math.round(slot.heightMm * pxPerMm);

      if (processedPhoto) {
        ctx.save();
        ctx.translate(slotX + slotW / 2, slotY + slotH / 2);

        // If slot is rotated (e.g. 45x35 mm Indian passport on 4x6), rotate photo by 90 degrees
        if (slot.widthMm > slot.heightMm && processedPhoto.height > processedPhoto.width) {
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(processedPhoto, -slotH / 2, -slotW / 2, slotH, slotW);
        } else {
          ctx.drawImage(processedPhoto, -slotW / 2, -slotH / 2, slotW, slotH);
        }
        ctx.restore();

        // 0.5px thin border around photo for cutting aid
        ctx.strokeStyle = "#E2E8F0";
        ctx.lineWidth = 1;
        ctx.strokeRect(slotX, slotY, slotW, slotH);
      }
    }

    // Render Cut Marks
    const marks = generateSlotCutMarks(layout.slots, 2.5);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.round(0.18 * pxPerMm);
    ctx.beginPath();
    for (const line of marks) {
      ctx.moveTo(Math.round(line.x1Mm * pxPerMm), Math.round(line.y1Mm * pxPerMm));
      ctx.lineTo(Math.round(line.x2Mm * pxPerMm), Math.round(line.y2Mm * pxPerMm));
    }
    ctx.stroke();
  }, [paper, preset, requestedCount, bgColor, brightness, contrast, saturation, rawPhotoCanvas, cutoutCanvas]);

  const handlePrint = async () => {
    const canvas = sheetCanvasRef.current;
    if (!canvas) return;

    try {
      setStatusText(t("status.printing"));
      const bridge = (window as any).opsBridge;

      if (bridge && typeof bridge.printSheet === "function") {
        const res = await bridge.printSheet({
          silent: false,
          pageSize: paper === "4x6" ? "4x6" : "A4",
          landscape: false,
          scaleFactor: 100,
        });
        if (res.ok) {
          setStatusText(t("status.spooled"));
        } else {
          setStatusText(t("error.printer_error"));
        }
      } else {
        window.print();
        setStatusText(t("status.spooled"));
      }
    } catch {
      setStatusText(t("error.printer_error"));
    }
  };

  const handleExportPdf = async () => {
    const activePhoto = cutoutCanvas || rawPhotoCanvas;
    if (!activePhoto) return;
    setIsExporting(true);
    setStatusText("Generating 1:1 Vector PDF...");

    try {
      const layout = solvePassportGrid({
        paper,
        preset,
        requestedCount,
        gapMm: 3.0,
      });

      const cardPairs = [
        {
          front: activePhoto,
          back: activePhoto,
        },
      ];

      const pdfBytes = await exportSheetToPdf(layout, cardPairs, {
        showCutMarks: true,
        showBorders: true,
      });

      const fileName = `ops_passport_sheet_${paper}_${Date.now()}.pdf`;
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
        width: 390,
        backgroundColor: "var(--bg-surface)",
        borderRadius: "var(--border-radius-lg)",
        padding: 20,
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Camera size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("nav.photo_studio")}</h2>
        </div>

        {/* Low resolution warning banner */}
        {lowResWarning && (
          <div style={{
            backgroundColor: "rgba(245, 158, 11, 0.12)",
            border: "1px solid var(--accent-warning)",
            borderRadius: "var(--border-radius-md)",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.75rem",
            color: "var(--accent-warning)"
          }}>
            <AlertTriangle size={16} />
            <span>{lowResWarning}</span>
          </div>
        )}

        {/* Upload Portrait */}
        <label className="btn btn-secondary" style={{ width: "100%", cursor: "pointer", textAlign: "center" }}>
          <Upload size={16} />
          <span>{t("action.upload_file")}</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
        </label>

        {/* AI Background Removal Button */}
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          onClick={handleRemoveBackground}
          disabled={isSegmenting}
        >
          {isSegmenting ? <RefreshCw size={18} className="spin" /> : <Sparkles size={18} />}
          <span>{isSegmenting ? "Segmenting..." : t("photo.remove_bg")}</span>
        </button>

        {/* Studio Background Colors */}
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
            {t("photo.bg_color")}
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            <button
              type="button"
              className={`btn ${bgColor === "studio_blue" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => setBgColor("studio_blue")}
            >
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#2B6CB0" }} />
              {t("photo.studio_blue")}
            </button>
            <button
              type="button"
              className={`btn ${bgColor === "white" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => setBgColor("white")}
            >
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1" }} />
              {t("photo.white")}
            </button>
            <button
              type="button"
              className={`btn ${bgColor === "grey" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => setBgColor("grey")}
            >
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#F1F5F9", border: "1px solid #CBD5E1" }} />
              {t("photo.grey")}
            </button>
            <button
              type="button"
              className={`btn ${bgColor === "transparent" ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: "0.75rem" }}
              onClick={() => setBgColor("transparent")}
            >
              {t("photo.transparent")}
            </button>
          </div>
        </div>

        {/* Paper & Layout Options */}
        <div style={{ backgroundColor: "var(--bg-app)", padding: 12, borderRadius: "var(--border-radius-md)", display: "flex", flexDirection: "column", gap: 8 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              {t("photo.media_paper")}
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className={`btn ${paper === "4x6" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, fontSize: "0.75rem", padding: "6px 8px" }}
                onClick={() => {
                  setPaper("4x6");
                  setRequestedCount(8);
                }}
              >
                4×6 Photo Paper
              </button>
              <button
                type="button"
                className={`btn ${paper === "A4" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1, fontSize: "0.75rem", padding: "6px 8px" }}
                onClick={() => {
                  setPaper("A4");
                  setRequestedCount(30);
                }}
              >
                A4 Paper
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              {t("photo.preset")}
            </label>
            <select
              className="input-select"
              value={preset}
              onChange={(e) => setPreset(e.target.value as PhotoPresetType)}
              style={{ fontSize: "0.8125rem" }}
            >
              <option value="passport_in">{t("photo.passport_in")}</option>
              <option value="stamp">{t("photo.stamp")}</option>
              <option value="visa_us">{t("photo.visa_us")}</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              {t("photo.count")}: {requestedCount} photos
            </label>
            <input
              type="range"
              min="1"
              max={paper === "4x6" ? 12 : 36}
              value={requestedCount}
              onChange={(e) => setRequestedCount(parseInt(e.target.value, 10))}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Tonal Adjustments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>{t("photo.brightness")}</span>
            <span>{brightness}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
          />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>{t("photo.contrast")}</span>
            <span>{contrast}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value, 10))}
          />

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>{t("photo.saturation")}</span>
            <span>{saturation}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={saturation}
            onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
          />
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
            ref={sheetCanvasRef}
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
