/**
 * Open Print Studio — Sheet Canvas Composite Renderer
 * 
 * Renders full sheets (A4, 4x6, PVC Tray) to 300 DPI canvas
 * with composite cards, cut marks, borders, and nudge offsets.
 */

import {
  mmToPx,
  type SheetLayoutResult,
  type SheetSlot,
  generateSlotCutMarks,
  type CutMarkSegment,
} from "@ops/core";

export interface SheetRenderOptions {
  showCutMarks?: boolean;
  showCardBorders?: boolean;
  borderColor?: string;
}

export interface CardSideImageSource {
  front: CanvasImageSource | null;
  back: CanvasImageSource | null;
}

/**
 * Composites card sides and vector cut marks onto a 300 DPI sheet canvas.
 */
export function renderSheetToCanvas(
  layout: SheetLayoutResult,
  cardPairs: CardSideImageSource[], // Array of card pairs (index matches pairIndex)
  options: SheetRenderOptions = {}
): HTMLCanvasElement {
  const {
    showCutMarks = true,
    showCardBorders = true,
    borderColor = "#D1D5DB",
  } = options;

  const canvasWidth = mmToPx(layout.sheetWidthMm, 300);
  const canvasHeight = mmToPx(layout.sheetHeightMm, 300);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D canvas context for sheet");

  // Pure white paper background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw cut marks if enabled
  if (showCutMarks) {
    const marks = generateSlotCutMarks(layout.slots, 3.5, 0.2);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(1, mmToPx(0.2, 300));
    ctx.beginPath();

    for (const m of marks) {
      const x1 = mmToPx(m.x1Mm, 300);
      const y1 = mmToPx(m.y1Mm, 300);
      const x2 = mmToPx(m.x2Mm, 300);
      const y2 = mmToPx(m.y2Mm, 300);

      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
  }

  // 2. Draw card slots
  for (const slot of layout.slots) {
    const slotX = mmToPx(slot.xMm, 300);
    const slotY = mmToPx(slot.yMm, 300);
    const slotW = mmToPx(slot.widthMm, 300);
    const slotH = mmToPx(slot.heightMm, 300);

    const pair = cardPairs[slot.pairIndex] ?? cardPairs[0];
    const imageSource = slot.side === "front" ? pair?.front : pair?.back;

    if (imageSource) {
      ctx.save();
      if (slot.isFlipped) {
        // Mirrored image drawing
        ctx.translate(slotX + slotW, slotY);
        ctx.scale(-1, 1);
        ctx.drawImage(imageSource, 0, 0, slotW, slotH);
      } else {
        ctx.drawImage(imageSource, slotX, slotY, slotW, slotH);
      }
      ctx.restore();
    } else {
      // Empty slot placeholder
      ctx.fillStyle = "#F8FAFC";
      ctx.fillRect(slotX, slotY, slotW, slotH);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Slot ${slot.slotNumber} (${slot.side})`, slotX + slotW / 2, slotY + slotH / 2);
    }

    // 3. Draw thin outline border if enabled
    if (showCardBorders) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(slotX, slotY, slotW, slotH);
    }
  }

  return canvas;
}
