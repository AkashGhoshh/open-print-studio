import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  solveMembershipOverlay,
  solveA4IdCardSheet,
  solvePvcTraySheet,
  CR80_WIDTH_PX_300DPI,
  CR80_HEIGHT_PX_300DPI,
  PAPER_A4_WIDTH_PX_300DPI,
  PAPER_A4_HEIGHT_PX_300DPI,
} from "@ops/core";
import { Award, Printer, Download, Upload, Plus, Palette } from "lucide-react";
import { exportSheetToPdf, downloadFile } from "../../services/print/pdf-export.js";
import { indexedDbService } from "../../services/storage/indexeddb-service.js";

const PRESET_COLORS = [
  { name: "Navy", hex: "#1E3A8A" },
  { name: "Emerald", hex: "#065F46" },
  { name: "Ruby", hex: "#991B1B" },
  { name: "Gold", hex: "#B45309" },
  { name: "Purple", hex: "#5B21B6" },
];

export const MembershipCardWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const [orgName, setOrgName] = useState<string>("ROYAL FITNESS CLUB");
  const [memberName, setMemberName] = useState<string>("PRIYA SHARMA");
  const [memberId, setMemberId] = useState<string>("MEM-2026-0042");
  const [validThru, setValidThru] = useState<string>("12/2028");
  const [themeColor, setThemeColor] = useState<string>("#1E3A8A");
  const [targetMedia, setTargetMedia] = useState<"a4" | "pvc">("a4");
  const [statusText, setStatusText] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Re-draw single CR-80 card canvas whenever fields or background change
  useEffect(() => {
    const canvas = cardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CR80_WIDTH_PX_300DPI;
    canvas.height = CR80_HEIGHT_PX_300DPI;

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
      // Default premium gradient background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#F8FAFC");
      grad.addColorStop(1, "#E2E8F0");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top Header accent bar
      ctx.fillStyle = themeColor;
      ctx.fillRect(0, 0, canvas.width, 100);

      // Bottom footer accent bar
      ctx.fillStyle = themeColor;
      ctx.fillRect(0, canvas.height - 35, canvas.width, 35);

      // Gold divider line
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(0, 100, canvas.width, 6);

      // Watermark
      ctx.font = "bold 64px Inter, sans-serif";
      ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
      ctx.textAlign = "center";
      ctx.fillText("SPECIMEN MEMBERSHIP", canvas.width / 2, canvas.height / 2 + 30);
    }

    // Solve overlays with pure core math
    const overlay = solveMembershipOverlay({
      orgName,
      memberName,
      memberId,
      validThru,
      themeColor,
    });

    for (const field of overlay.fields) {
      ctx.fillStyle = field.id === "orgName" && !bgImage ? "#FFFFFF" : field.colorHex;
      ctx.font = `${field.isBold ? "bold" : "normal"} ${field.fontSizePx}px Inter, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(field.text, field.xPx, field.yPx);
    }
  }, [orgName, memberName, memberId, validThru, themeColor, bgImage]);

  // Handle custom card background image
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => setBgImage(img);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Quick increment ID
  const handleIncrementId = () => {
    const match = memberId.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10) + 1;
      const padded = num.toString().padStart(match[1].length, "0");
      setMemberId(memberId.replace(/\d+$/, padded));
    } else {
      setMemberId(`${memberId}-1`);
    }
  };

  const handlePrint = async () => {
    const cardCanvas = cardCanvasRef.current;
    if (!cardCanvas) return;

    try {
      setStatusText(t("status.printing"));

      // Render full sheet composite
      const sheet = document.createElement("canvas");
      const sCtx = sheet.getContext("2d");
      if (!sCtx) return;

      const isA4 = targetMedia === "a4";
      const layout = isA4 ? solveA4IdCardSheet() : solvePvcTraySheet();
      const pxPerMm = 300 / 25.4;

      sheet.width = Math.round(layout.sheetWidthMm * pxPerMm);
      sheet.height = Math.round(layout.sheetHeightMm * pxPerMm);

      sCtx.fillStyle = "#FFFFFF";
      sCtx.fillRect(0, 0, sheet.width, sheet.height);

      for (const slot of layout.slots) {
        const slotX = Math.round(slot.xMm * pxPerMm);
        const slotY = Math.round(slot.yMm * pxPerMm);
        const slotW = Math.round(slot.widthMm * pxPerMm);
        const slotH = Math.round(slot.heightMm * pxPerMm);
        sCtx.drawImage(cardCanvas, slotX, slotY, slotW, slotH);
      }

      const bridge = (window as any).opsBridge;

      if (bridge && typeof bridge.printSheet === "function") {
        const res = await bridge.printSheet({
          silent: false,
          pageSize: isA4 ? "A4" : { width: 130000, height: 220000 },
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

      // Auto-save session to IndexedDB
      cardCanvas.toBlob(async (blob) => {
        if (blob) {
          await indexedDbService.saveRecentDesign({
            id: `ops_mem_${Date.now()}`,
            timestamp: Date.now(),
            templateId: "membership-cr80",
            title: `${orgName} - ${memberName}`,
            frontBlob: blob,
            backBlob: blob,
            customerMobile: "",
          });
        }
      });
    } catch {
      setStatusText(t("error.printer_error"));
    }
  };

  const handleExportPdf = async () => {
    const cardCanvas = cardCanvasRef.current;
    if (!cardCanvas) return;
    setIsExporting(true);
    setStatusText("Generating 1:1 Vector PDF...");

    try {
      const isA4 = targetMedia === "a4";
      const layout = isA4 ? solveA4IdCardSheet() : solvePvcTraySheet();

      const cardPairs = [
        {
          front: cardCanvas,
          back: cardCanvas,
        },
      ];

      const pdfBytes = await exportSheetToPdf(layout, cardPairs, {
        showCutMarks: true,
        showBorders: true,
      });

      const fileName = `ops_membership_${Date.now()}.pdf`;
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
      {/* Control Panel */}
      <div style={{
        width: 400,
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
          <Award size={22} color="var(--accent-primary)" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{t("nav.membership_card")}</h2>
        </div>

        {/* Print Destination Media */}
        <div>
          <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>
            {t("membership.target_media")}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`btn ${targetMedia === "a4" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.8125rem" }}
              onClick={() => setTargetMedia("a4")}
            >
              {t("membership.a4_sheet")}
            </button>
            <button
              type="button"
              className={`btn ${targetMedia === "pvc" ? "btn-primary" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.8125rem" }}
              onClick={() => setTargetMedia("pvc")}
            >
              {t("membership.pvc_tray")}
            </button>
          </div>
        </div>

        {/* Org Name */}
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("membership.org_name")}
          </label>
          <input
            type="text"
            className="input-text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </div>

        {/* Member Name */}
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("membership.member_name")}
          </label>
          <input
            type="text"
            className="input-text"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
          />
        </div>

        {/* Member ID with +1 button */}
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("membership.member_id")}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              className="input-text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              title="Next ID number"
              onClick={handleIncrementId}
              style={{ padding: "0 12px" }}
            >
              <Plus size={16} />
              <span>+1</span>
            </button>
          </div>
        </div>

        {/* Valid Thru */}
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            {t("membership.valid_thru")}
          </label>
          <input
            type="text"
            className="input-text"
            value={validThru}
            onChange={(e) => setValidThru(e.target.value)}
          />
        </div>

        {/* Theme Color Picker */}
        <div>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Palette size={14} />
            <span>{t("membership.theme_color")}</span>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {PRESET_COLORS.map((col) => (
              <button
                key={col.hex}
                type="button"
                onClick={() => setThemeColor(col.hex)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: col.hex,
                  border: themeColor === col.hex ? "3px solid var(--accent-primary)" : "2px solid #FFFFFF",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)"
                }}
                title={col.name}
              />
            ))}
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              style={{ width: 34, height: 34, padding: 0, border: "none", borderRadius: 4, cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Background Image Upload */}
        <div>
          <label className="btn btn-secondary" style={{ width: "100%", cursor: "pointer", textAlign: "center" }}>
            <Upload size={16} />
            <span>Upload Background (Optional)</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleBgUpload} />
          </label>
          {bgImage && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: 6, fontSize: "0.75rem" }}
              onClick={() => setBgImage(null)}
            >
              Reset to Default Background
            </button>
          )}
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32
      }}>
        <div style={{
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.15)",
          borderRadius: 16,
          overflow: "hidden",
          border: "2px solid var(--border-strong)"
        }}>
          <canvas
            ref={cardCanvasRef}
            style={{
              width: 505, // Render preview at ~50% scale for screen
              height: 319,
              display: "block"
            }}
          />
        </div>
        <div style={{ marginTop: 20, color: "var(--text-muted)", fontSize: "0.875rem" }}>
          ISO/IEC 7810 CR-80 Standard (85.60 × 53.98 mm) at 300 DPI
        </div>
      </div>
    </div>
  );
};
