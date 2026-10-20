import { describe, it, expect, vi, beforeEach } from "vitest";
import { processIdCardDocument } from "./id-card-processor";
import { templateRegistry } from "../crop/template-registry";

describe("ID Card Pipeline Processor", () => {
  beforeEach(() => {
    // Setup document mock for Node test environment
    const mockCtx = {
      fillStyle: "",
      fillRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      restore: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(1011 * 638 * 4),
      }),
      putImageData: vi.fn(),
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

  it("processes dual-sided e-Aadhaar card returning front and back normalized CR-80 sides", () => {
    const template = templateRegistry.getById("eaadhaar-standard")!;
    const mockSource = {} as CanvasImageSource;

    const result = processIdCardDocument(mockSource, 2480, 3508, {
      template,
      frontRotation: 0,
      backRotation: 0,
      textBoldLevel: 2,
      cleanDisclaimer: true,
    });

    expect(result.frontCanvas).toBeDefined();
    expect(result.frontNormal.targetWidthPx).toBe(1011);
    expect(result.frontNormal.targetHeightPx).toBe(638);
    expect(result.backCanvas).toBeDefined();
    expect(result.backNormal?.targetWidthPx).toBe(1011);
    expect(result.backNormal?.targetHeightPx).toBe(638);
  });

  it("processes single-sided PAN card returning null for back side", () => {
    const template = templateRegistry.getById("pan-card")!;
    const mockSource = {} as CanvasImageSource;

    const result = processIdCardDocument(mockSource, 2480, 3508, {
      template,
      frontRotation: 0,
      textBoldLevel: 0,
    });

    expect(result.frontCanvas).toBeDefined();
    expect(result.backCanvas).toBeNull();
    expect(result.backNormal).toBeNull();
  });

  it("applies 90-degree rotation inversion on Ayushman Bharat cards", () => {
    const template = templateRegistry.getById("ayushman-bharat")!;
    const mockSource = {} as CanvasImageSource;

    const result = processIdCardDocument(mockSource, 2480, 3508, {
      template,
      frontRotation: 90,
      backRotation: 90,
      textBoldLevel: 0,
    });

    // 90 degree rotated CR-80 card in portrait display
    expect(result.frontNormal.targetWidthPx).toBe(638);
    expect(result.frontNormal.targetHeightPx).toBe(1011);
    expect(result.frontNormal.rotation).toBe(90);
  });
});
