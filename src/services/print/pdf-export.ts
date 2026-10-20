/**
 * Open Print Studio — Print-Ready PDF & PNG Exporter
 * 
 * Generates exact 1:1 scale vector PDF documents using pdf-lib
 * with embedded 300 DPI card images and vector trim marks.
 */

import { PDFDocument, rgb } from "pdf-lib";
import {
  type SheetLayoutResult,
  generateSlotCutMarks,
  type SheetSlot,
} from "@ops/core";
import type { CardSideImageSource } from "./sheet-renderer";

const MM_TO_POINTS = 72 / 25.4; // ~2.83464567 points per mm

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas toBlob failed"));
        return;
      }
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject);
    }, "image/png");
  });
}

/**
 * Generates a print-ready vector PDF document at exact sheet dimensions.
 */
export async function exportSheetToPdf(
  layout: SheetLayoutResult,
  cardPairs: CardSideImageSource[],
  options: {
    showCutMarks?: boolean;
    showBorders?: boolean;
  } = {}
): Promise<Uint8Array> {
  const { showCutMarks = true, showBorders = true } = options;

  const pdfDoc = await PDFDocument.create();

  // Page dimensions in points
  const pageWidthPt = layout.sheetWidthMm * MM_TO_POINTS;
  const pageHeightPt = layout.sheetHeightMm * MM_TO_POINTS;

  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

  // Cache embedded card images
  const embeddedImages = new Map<CanvasImageSource, any>();

  // Embed card images in each slot
  for (const slot of layout.slots) {
    const pair = cardPairs[slot.pairIndex] ?? cardPairs[0];
    const source = slot.side === "front" ? pair?.front : pair?.back;

    if (source && source instanceof HTMLCanvasElement) {
      let embedded = embeddedImages.get(source);
      if (!embedded) {
        const pngBytes = await canvasToPngBytes(source);
        embedded = await pdfDoc.embedPng(pngBytes);
        embeddedImages.set(source, embedded);
      }

      const slotWidthPt = slot.widthMm * MM_TO_POINTS;
      const slotHeightPt = slot.heightMm * MM_TO_POINTS;
      const slotXPt = slot.xMm * MM_TO_POINTS;
      // Convert top-left Y to bottom-left PDF coordinates
      const slotYPt = pageHeightPt - (slot.yMm * MM_TO_POINTS) - slotHeightPt;

      page.drawImage(embedded, {
        x: slotXPt,
        y: slotYPt,
        width: slotWidthPt,
        height: slotHeightPt,
      });

      if (showBorders) {
        page.drawRectangle({
          x: slotXPt,
          y: slotYPt,
          width: slotWidthPt,
          height: slotHeightPt,
          borderWidth: 0.5,
          borderColor: rgb(0.8, 0.8, 0.8),
        });
      }
    }
  }

  // Draw vector cut marks
  if (showCutMarks) {
    const marks = generateSlotCutMarks(layout.slots, 3.5, 0.2);
    for (const m of marks) {
      const x1Pt = m.x1Mm * MM_TO_POINTS;
      const y1Pt = pageHeightPt - (m.y1Mm * MM_TO_POINTS);
      const x2Pt = m.x2Mm * MM_TO_POINTS;
      const y2Pt = pageHeightPt - (m.y2Mm * MM_TO_POINTS);

      page.drawLine({
        start: { x: x1Pt, y: y1Pt },
        end: { x: x2Pt, y: y2Pt },
        thickness: m.strokeWidthMm * MM_TO_POINTS,
        color: rgb(0, 0, 0),
      });
    }
  }

  return await pdfDoc.save();
}

/**
 * Triggers browser download of generated PDF bytes.
 */
export function downloadFile(
  data: Uint8Array | Blob,
  fileName: string,
  mimeType = "application/pdf"
): void {
  const blob = data instanceof Blob ? data : new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
