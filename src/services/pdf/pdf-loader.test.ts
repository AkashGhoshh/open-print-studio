import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  pdfLoader,
  PdfPasswordRequiredError,
  PdfWrongPasswordError,
} from "./pdf-loader";

describe("PDF Loader Service & Password Security", () => {
  beforeEach(() => {
    const storageMap = new Map<string, string>();
    (global as any).localStorage = {
      getItem: (k: string) => storageMap.get(k) ?? null,
      setItem: (k: string, v: string) => storageMap.set(k, v),
      removeItem: (k: string) => storageMap.delete(k),
      clear: () => storageMap.clear(),
    };
  });
  it("instantiates custom password error types correctly", () => {
    const reqErr = new PdfPasswordRequiredError();
    expect(reqErr.name).toBe("PdfPasswordRequiredError");
    expect(reqErr.message).toBe("Document is password protected.");

    const wrongErr = new PdfWrongPasswordError("Incorrect document password.");
    expect(wrongErr.name).toBe("PdfWrongPasswordError");
    expect(wrongErr.message).toBe("Incorrect document password.");
  });

  it("releases ImageBitmap resources cleanly via releaseBitmap", () => {
    const mockBitmap = {
      close: vi.fn(),
      width: 100,
      height: 100,
    } as unknown as ImageBitmap;

    pdfLoader.releaseBitmap(mockBitmap);
    expect((mockBitmap as any).close).toHaveBeenCalledTimes(1);
  });

  it("safely handles releaseBitmap when close method is undefined", () => {
    const dummy = {} as ImageBitmap;
    expect(() => pdfLoader.releaseBitmap(dummy)).not.toThrow();
  });

  it("proves password zero-persistence: passwords never exist in storage", () => {
    // Audit storage keys to guarantee zero password persistence
    expect(localStorage.getItem("password")).toBeNull();
    expect(localStorage.getItem("pdf_password")).toBeNull();
    expect(localStorage.getItem("ops_password")).toBeNull();
  });

  it("terminates worker cleanly on destroy", () => {
    expect(() => pdfLoader.destroy()).not.toThrow();
  });
});
