import { describe, it, expect, vi } from "vitest";
import { SystemScannerProvider } from "./scanner-provider.js";

describe("SystemScannerProvider (ADR-005)", () => {
  it("enumerates available scanner devices", async () => {
    const provider = new SystemScannerProvider();
    const devices = await provider.listDevices();

    expect(devices.length).toBeGreaterThan(0);
    expect(devices[0].protocol).toBe("virtual");
    expect(devices[0].isDefault).toBe(true);
  });

  it("produces 300 DPI scanned blob image", async () => {
    const provider = new SystemScannerProvider();
    const blob = await provider.scan("ops_virtual_scanner", { dpi: 300, colorMode: "color" });
    expect(blob).toBeDefined();
    expect(blob.type).toBe("image/png");
    expect(blob.size).toBeGreaterThan(0);
  });
});
