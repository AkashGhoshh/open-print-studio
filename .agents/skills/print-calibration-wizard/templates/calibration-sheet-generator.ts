/**
 * Open Print Studio — Calibration Test Sheet Generator
 * Usage: Place in src/services/print/calibration-sheet.ts
 */

export interface CalibrationTargetSpec {
  paperWidthMm: number;
  paperHeightMm: number;
  lineLengthMm: number; // 100.0 mm standard
}

export function drawCalibrationSheet(
  ctx: CanvasRenderingContext2D,
  spec: CalibrationTargetSpec,
  dpi: number = 300
): void {
  const mmToPx = dpi / 25.4;
  const canvasW = spec.paperWidthMm * mmToPx;
  const canvasH = spec.paperHeightMm * mmToPx;

  // Background white
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Calibration Title
  ctx.fillStyle = "#000000";
  ctx.font = `${Math.round(14 * (dpi / 72))}px sans-serif`;
  ctx.fillText("OPEN PRINT STUDIO — PRINTER CALIBRATION SHEET", 20 * mmToPx, 20 * mmToPx);

  // Draw 100mm Horizontal Reference Line
  const linePx = spec.lineLengthMm * mmToPx;
  const startX = 30 * mmToPx;
  const startY = 40 * mmToPx;

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1 * mmToPx; // 1mm thick target line

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + linePx, startY);
  ctx.stroke();

  // Draw 100mm Vertical Reference Line
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX, startY + linePx);
  ctx.stroke();

  // Reference ticks every 10mm
  for (let mm = 0; mm <= spec.lineLengthMm; mm += 10) {
    const pxOffset = mm * mmToPx;
    // Horizontal ticks
    ctx.beginPath();
    ctx.moveTo(startX + pxOffset, startY - 3 * mmToPx);
    ctx.lineTo(startX + pxOffset, startY + 3 * mmToPx);
    ctx.stroke();

    // Vertical ticks
    ctx.beginPath();
    ctx.moveTo(startX - 3 * mmToPx, startY + pxOffset);
    ctx.lineTo(startX + 3 * mmToPx, startY + pxOffset);
    ctx.stroke();
  }
}
