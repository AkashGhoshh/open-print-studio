/**
 * Open Print Studio — Precision Calibration Test Sheet Generator
 * 
 * Draws high-precision 100.0 mm reference test rulers and CR-80 card outlines
 * at 300 DPI for physical digital caliper measurement.
 */

import {
  PAPER_A4_WIDTH_MM,
  PAPER_A4_HEIGHT_MM,
  CR80_WIDTH_MM,
  CR80_HEIGHT_MM,
} from "@ops/core";

export function drawCalibrationSheet(
  canvas: HTMLCanvasElement,
  dpi = 300
): void {
  const pxPerMm = dpi / 25.4;
  canvas.width = Math.round(PAPER_A4_WIDTH_MM * pxPerMm);
  canvas.height = Math.round(PAPER_A4_HEIGHT_MM * pxPerMm);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Pure White Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header Title
  ctx.fillStyle = "#0F172A";
  ctx.font = `bold ${Math.round(20 * (dpi / 72))}px Inter, sans-serif`;
  ctx.fillText("OPEN PRINT STUDIO — HARDWARE CALIBRATION SHEET", 20 * pxPerMm, 25 * pxPerMm);

  ctx.fillStyle = "#64748B";
  ctx.font = `${Math.round(11 * (dpi / 72))}px Inter, sans-serif`;
  ctx.fillText("Instructions: Measure reference lines with digital calipers. Enter measured mm in the Calibration Wizard.", 20 * pxPerMm, 33 * pxPerMm);

  // 1. Exact 100.0 mm Horizontal Target Line
  const startX = 30 * pxPerMm;
  const startY = 55 * pxPerMm;
  const target100Px = 100.0 * pxPerMm;

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = Math.round(0.8 * pxPerMm); // 0.8 mm thick target line

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + target100Px, startY);
  ctx.stroke();

  // 2. Exact 100.0 mm Vertical Target Line
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX, startY + target100Px);
  ctx.stroke();

  // 10 mm Tick Marks on Horizontal Line
  ctx.lineWidth = Math.round(0.4 * pxPerMm);
  for (let mm = 0; mm <= 100; mm += 10) {
    const tickX = startX + mm * pxPerMm;
    ctx.beginPath();
    ctx.moveTo(tickX, startY - 4 * pxPerMm);
    ctx.lineTo(tickX, startY + 4 * pxPerMm);
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = `bold ${Math.round(8 * (dpi / 72))}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${mm}mm`, tickX, startY - 6 * pxPerMm);
  }

  // 10 mm Tick Marks on Vertical Line
  for (let mm = 0; mm <= 100; mm += 10) {
    const tickY = startY + mm * pxPerMm;
    ctx.beginPath();
    ctx.moveTo(startX - 4 * pxPerMm, tickY);
    ctx.lineTo(startX + 4 * pxPerMm, tickY);
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.font = `bold ${Math.round(8 * (dpi / 72))}px Inter, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(`${mm}mm`, startX - 6 * pxPerMm, tickY + 3 * pxPerMm);
  }

  // 3. Exact CR-80 Card Verification Box (85.60 x 53.98 mm)
  const cardX = 30 * pxPerMm;
  const cardY = 180 * pxPerMm;
  const cardW = CR80_WIDTH_MM * pxPerMm;
  const cardH = CR80_HEIGHT_MM * pxPerMm;

  ctx.strokeStyle = "#2563EB";
  ctx.lineWidth = Math.round(0.5 * pxPerMm);
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.fillStyle = "#1E40AF";
  ctx.textAlign = "left";
  ctx.font = `bold ${Math.round(11 * (dpi / 72))}px Inter, sans-serif`;
  ctx.fillText("CR-80 VERIFICATION TARGET (85.60 mm × 53.98 mm)", cardX, cardY - 6 * pxPerMm);

  ctx.fillStyle = "#94A3B8";
  ctx.font = `bold ${Math.round(18 * (dpi / 72))}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("SPECIMEN CR-80 OUTLINE", cardX + cardW / 2, cardY + cardH / 2 + 6 * pxPerMm);
}
