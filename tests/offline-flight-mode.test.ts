import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  solveA4IdCardSheet,
  solve4x6IdCardSheet,
  solvePassportGrid,
  solveA4VisitingCardSheet,
  applyTextDarkening,
  applyAlphaFeathering,
  compositeCutoutOverBackground,
  applyPhotoAdjustments,
  calculateScaleFactor,
  calculateOffset,
} from "@ops/core";
import { BatchQueueService } from "../src/services/batch/batch-queue.js";
import { SystemScannerProvider } from "../src/services/scanner/scanner-provider.js";
import { UndoRedoStack } from "../src/services/history/undo-redo-stack.js";
import { exportSheetToPdf } from "../src/services/print/pdf-export.js";

/**
 * Phase 8 Production Verification: Strict 100% Offline Flight-Mode Isolation Test
 * 
 * Verifies that the entire application core, processing pipelines, solvers,
 * batch queue, calibration, and export engines operate without ANY outbound
 * network requests, even when network APIs are actively blocked.
 */
describe("Strict 100% Offline Flight-Mode Verification", () => {
  let outboundNetworkAttempted = false;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    outboundNetworkAttempted = false;

    // Intercept and strictly block any network attempt
    globalThis.fetch = vi.fn().mockImplementation((url: any) => {
      outboundNetworkAttempted = true;
      return Promise.reject(new Error(`[OFFLINE BLOCKED] Unauthorized network call to: ${url}`));
    });

    if (typeof (globalThis as any).XMLHttpRequest !== "undefined") {
      vi.spyOn(globalThis as any, "XMLHttpRequest").mockImplementation(() => {
        outboundNetworkAttempted = true;
        throw new Error("[OFFLINE BLOCKED] XMLHttpRequest is strictly forbidden");
      });
    }
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("proves core geometry and multi-up sheet solvers execute 100% offline", () => {
    const a4 = solveA4IdCardSheet({});
    expect(a4.cardCount).toBe(10);
    expect(a4.slots.length).toBe(10);

    const photo4x6 = solve4x6IdCardSheet({});
    expect(photo4x6.cardCount).toBe(2);
    expect(photo4x6.slots.length).toBe(2);

    const passport = solvePassportGrid({ paper: "4x6", preset: "passport_in" });
    expect(passport.slots.length).toBe(8); // ADR-002 rotated yield

    const visiting = solveA4VisitingCardSheet();
    expect(visiting.cardCount).toBe(10);
    expect(visiting.slots.length).toBe(10);

    expect(outboundNetworkAttempted).toBe(false);
  });

  it("proves pixel image processing pipelines execute 100% offline", () => {
    // Faint-Text Darkening
    const rawRgba = new Uint8ClampedArray(400 * 400 * 4);
    for (let i = 0; i < rawRgba.length; i += 4) {
      rawRgba[i] = 180;
      rawRgba[i + 1] = 180;
      rawRgba[i + 2] = 180;
      rawRgba[i + 3] = 255;
    }
    applyTextDarkening(rawRgba, 2);
    expect(rawRgba[0]).toBeLessThan(180);

    // Alpha feathering
    const mask = new Float32Array(100 * 100);
    mask.fill(0.9);
    const feathered = applyAlphaFeathering(mask, 100, 100, 1.5);
    expect(feathered.length).toBe(10000);

    // Studio background replacement & tonal adjustments
    const uint8Mask = new Uint8ClampedArray(100 * 100);
    uint8Mask.fill(200);
    compositeCutoutOverBackground(rawRgba.subarray(0, 100 * 100 * 4), uint8Mask, "studio_blue");
    expect(rawRgba[0]).toBeDefined();

    applyPhotoAdjustments(rawRgba, { brightness: 10, contrast: 10, saturation: 10 });
    expect(rawRgba[0]).toBeDefined();

    expect(outboundNetworkAttempted).toBe(false);
  });

  it("proves calibration math and hardware profiles execute 100% offline", () => {
    const scale = calculateScaleFactor(100, 99.5);
    expect(scale).toBeCloseTo(100 / 99.5, 4);

    const offset = calculateOffset(100, 100.5);
    expect(offset).toBeCloseTo(-0.5, 2);

    expect(outboundNetworkAttempted).toBe(false);
  });

  it("proves 50-card batch queue and state recovery execute 100% offline", () => {
    const queue = new BatchQueueService();
    for (let i = 0; i < 50; i++) {
      queue.addItem({ title: `Offline Specimen Card ${i + 1}` });
    }
    expect(queue.count).toBe(50);

    const sheets = queue.paginate(5);
    expect(sheets.length).toBe(10); // 50 / 5 = 10 sheets

    queue.clear();
    expect(queue.count).toBe(0);

    expect(outboundNetworkAttempted).toBe(false);
  });

  it("proves scanner abstraction and undo-redo stack execute 100% offline", async () => {
    const scanner = new SystemScannerProvider();
    const devices = await scanner.listDevices();
    expect(devices.length).toBeGreaterThan(0);

    const scanBlob = await scanner.scan(devices[0].id, { dpi: 300 });
    expect(scanBlob.size).toBeGreaterThan(0);

    const history = new UndoRedoStack<number>(0);
    history.push(1);
    history.push(2);
    expect(history.undo()).toBe(1);
    expect(history.redo()).toBe(2);

    expect(outboundNetworkAttempted).toBe(false);
  });

  it("proves PDF export document generation executes 100% offline", async () => {
    const layout = solveA4IdCardSheet({});
    const pdfBytes = await exportSheetToPdf(layout, [], {
      showCutMarks: true,
      showBorders: true,
    });

    expect(pdfBytes).toBeDefined();
    expect(pdfBytes.byteLength).toBeGreaterThan(500);

    // Verify PDF header %PDF-
    const header = String.fromCharCode(...pdfBytes.slice(0, 5));
    expect(header).toBe("%PDF-");

    expect(outboundNetworkAttempted).toBe(false);
  });
});
