import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderSheetToCanvas } from "./sheet-renderer";
import { solveA4IdCardSheet, solve4x6IdCardSheet } from "@ops/core";

describe("Sheet Canvas Composite Renderer", () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = {
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
    };

    (global as any).document = {
      createElement: vi.fn().mockImplementation((tag: string) => {
        if (tag === "canvas") {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn().mockReturnValue(mockCtx),
          };
        }
        return {};
      }),
    };
  });

  it("renders A4 5-Pair sheet canvas with correct 300 DPI dimensions", () => {
    const layout = solveA4IdCardSheet();
    const canvas = renderSheetToCanvas(layout, []);

    // A4 at 300 DPI: 2480 x 3508 px
    expect(canvas.width).toBe(2480);
    expect(canvas.height).toBe(3508);
    expect(mockCtx.fillRect).toHaveBeenCalled();
  });

  it("renders 4x6 1-Pair sheet canvas with correct 300 DPI dimensions", () => {
    const layout = solve4x6IdCardSheet();
    const canvas = renderSheetToCanvas(layout, []);

    // 4x6 at 300 DPI: 1200 x 1800 px
    expect(canvas.width).toBe(1200);
    expect(canvas.height).toBe(1800);
  });

  it("draws cut marks when showCutMarks is true", () => {
    const layout = solve4x6IdCardSheet();
    renderSheetToCanvas(layout, [], { showCutMarks: true });

    expect(mockCtx.beginPath).toHaveBeenCalled();
    expect(mockCtx.moveTo).toHaveBeenCalled();
    expect(mockCtx.lineTo).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  it("draws card outline borders when showCardBorders is true", () => {
    const layout = solve4x6IdCardSheet();
    renderSheetToCanvas(layout, [], { showCardBorders: true, borderColor: "#000000" });

    // 2 card slots should have strokeRect called at least twice
    expect(mockCtx.strokeRect).toHaveBeenCalledTimes(2);
  });

  it("applies horizontal reflection when slot isFlipped is true", () => {
    const layout = solve4x6IdCardSheet({ isFlipped: true });
    const dummyImage = {} as CanvasImageSource;
    renderSheetToCanvas(layout, [{ front: dummyImage, back: dummyImage }]);

    // Mirrored slots call ctx.scale(-1, 1)
    expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1);
  });
});
