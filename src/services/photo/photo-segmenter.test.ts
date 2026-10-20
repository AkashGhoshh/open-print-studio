import { describe, it, expect } from "vitest";
import { photoSegmenterService } from "./photo-segmenter.js";

describe("PhotoSegmenterService (Offline AI Segmentation)", () => {
  it("generates synthetic mask with head and shoulders contour", () => {
    const width = 200;
    const height = 300;
    const mask = photoSegmenterService.generateSyntheticMask(width, height);

    expect(mask.length).toBe(width * height);

    // Center of head (x=100, y=114) must be inside person (255)
    const headIdx = Math.round(height * 0.38) * width + Math.round(width / 2);
    expect(mask[headIdx]).toBe(255);

    // Top-left corner (x=5, y=5) must be background (0)
    expect(mask[5 * width + 5]).toBe(0);
  });

  it("completes portrait segmentation within sub-1.5s latency budget", async () => {
    const canvas = {
      width: 800,
      height: 1000,
      getContext: () => null,
    } as unknown as HTMLCanvasElement;

    const result = await photoSegmenterService.segmentPortrait(canvas);

    expect(result.width).toBe(800);
    expect(result.height).toBe(1000);
    expect(result.alphaMask.length).toBe(800 * 1000);
    expect(result.durationMs).toBeLessThan(1500); // Strict sub-1.5s budget
    expect(result.lowResCheck.isLowRes).toBe(false);
  });

  it("raises low-resolution warning when input is below 600 px", async () => {
    const canvas = {
      width: 450,
      height: 550,
      getContext: () => null,
    } as unknown as HTMLCanvasElement;

    const result = await photoSegmenterService.segmentPortrait(canvas);

    expect(result.lowResCheck.isLowRes).toBe(true);
    expect(result.lowResCheck.warning).toContain("Low resolution image detected");
  });
});
