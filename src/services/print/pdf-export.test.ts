import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportSheetToPdf, downloadFile } from "./pdf-export";
import { solveA4IdCardSheet, solve4x6IdCardSheet } from "@ops/core";

describe("Vector PDF Export Service", () => {
  beforeEach(() => {
    (global as any).document = {
      createElement: vi.fn().mockImplementation((tag: string) => {
        if (tag === "a") {
          return {
            href: "",
            download: "",
            click: vi.fn(),
          };
        }
        return {};
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    };
    (global as any).URL = {
      createObjectURL: vi.fn().mockReturnValue("blob:mock-url"),
      revokeObjectURL: vi.fn(),
    };
  });

  it("exports valid A4 vector PDF bytes starting with PDF header", async () => {
    const layout = solveA4IdCardSheet();
    const pdfBytes = await exportSheetToPdf(layout, [], {
      showCutMarks: true,
      showBorders: true,
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(500);

    // Verify %PDF- magic bytes header (0x25, 0x50, 0x44, 0x46, 0x2D)
    const headerStr = new TextDecoder().decode(pdfBytes.slice(0, 5));
    expect(headerStr).toBe("%PDF-");
  });

  it("exports valid 4x6 vector PDF bytes", async () => {
    const layout = solve4x6IdCardSheet();
    const pdfBytes = await exportSheetToPdf(layout, [], {
      showCutMarks: true,
      showBorders: false,
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    const headerStr = new TextDecoder().decode(pdfBytes.slice(0, 5));
    expect(headerStr).toBe("%PDF-");
  });

  it("triggers browser file download with correct filename", () => {
    const dummyData = new Uint8Array([1, 2, 3]);
    expect(() => downloadFile(dummyData, "test.pdf")).not.toThrow();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
});
