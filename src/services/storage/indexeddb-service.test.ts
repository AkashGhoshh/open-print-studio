import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  indexedDbService,
  RecentDesignRecord,
  STORE_RECENTS,
} from "./indexeddb-service";
import { saveSettings, DEFAULT_SETTINGS } from "./settings-schema";

describe("IndexedDB Storage Service & Privacy Architecture", () => {
  let mockStoreData: Map<string, any>;

  beforeEach(() => {
    mockStoreData = new Map<string, any>();

    // Mock localStorage for settings
    const lsMap = new Map<string, string>();
    (global as any).localStorage = {
      getItem: (k: string) => lsMap.get(k) ?? null,
      setItem: (k: string, v: string) => lsMap.set(k, v),
      removeItem: (k: string) => lsMap.delete(k),
      clear: () => lsMap.clear(),
    };

    saveSettings({ ...DEFAULT_SETTINGS, privacyMode: false });

    // Mock IndexedDB
    const mockStore = {
      put: vi.fn().mockImplementation((val: any) => {
        mockStoreData.set(val.id, val);
        const req: any = {};
        setTimeout(() => req.onsuccess && req.onsuccess({}), 0);
        return req;
      }),
      delete: vi.fn().mockImplementation((id: string) => {
        mockStoreData.delete(id);
        const req: any = {};
        setTimeout(() => req.onsuccess && req.onsuccess({}), 0);
        return req;
      }),
      clear: vi.fn().mockImplementation(() => {
        mockStoreData.clear();
        const req: any = {};
        setTimeout(() => req.onsuccess && req.onsuccess({}), 0);
        return req;
      }),
      index: vi.fn().mockReturnValue({
        openCursor: vi.fn().mockImplementation((range?: any, direction?: string) => {
          const req: any = {};
          const items = Array.from(mockStoreData.values());
          if (direction === "prev") {
            items.sort((a, b) => b.timestamp - a.timestamp);
          } else {
            items.sort((a, b) => a.timestamp - b.timestamp);
          }

          let idx = 0;
          setTimeout(() => {
            const step = () => {
              if (idx < items.length) {
                const current = items[idx];
                const cursor = {
                  value: current,
                  continue: () => {
                    idx++;
                    step();
                  },
                  delete: () => {
                    mockStoreData.delete(current.id);
                  },
                };
                req.onsuccess({ target: { result: cursor } });
              } else {
                req.onsuccess({ target: { result: null } });
              }
            };
            step();
          }, 0);

          return req;
        }),
      }),
    };

    const mockDb = {
      objectStoreNames: { contains: () => true },
      createObjectStore: vi.fn().mockReturnValue({ createIndex: vi.fn() }),
      transaction: vi.fn().mockReturnValue({
        objectStore: () => mockStore,
      }),
    };

    (global as any).IDBKeyRange = {
      upperBound: (val: number) => ({ upper: val }),
    };

    (global as any).indexedDB = {
      open: vi.fn().mockImplementation(() => {
        const req: any = {};
        setTimeout(() => {
          req.result = mockDb;
          req.onsuccess && req.onsuccess({ target: req });
        }, 0);
        return req;
      }),
    };
  });

  it("saves recent design session when Privacy Mode is disabled", async () => {
    const id = await indexedDbService.saveRecentDesign({
      title: "e-Aadhaar Session",
      templateId: "eaadhaar-standard",
      customerMobile: "9876543210",
    });

    expect(id).toBeDefined();
    expect(mockStoreData.size).toBe(1);
    const saved = mockStoreData.get(id!);
    expect(saved.title).toBe("e-Aadhaar Session");
    expect(saved.customerMobile).toBe("9876543210");
  });

  it("enforces Privacy Mode: returns null and blocks disk write when privacyMode is true", async () => {
    saveSettings({ ...DEFAULT_SETTINGS, privacyMode: true });

    const id = await indexedDbService.saveRecentDesign({
      title: "Confidential Citizen ID",
      templateId: "eaadhaar-standard",
      customerMobile: "9999999999",
    });

    expect(id).toBeNull();
    // Zero disk write assertion
    expect(mockStoreData.size).toBe(0);
  });

  it("retrieves recent designs sorted by timestamp", async () => {
    mockStoreData.set("id_1", { id: "id_1", timestamp: 1000, title: "Older Card" });
    mockStoreData.set("id_2", { id: "id_2", timestamp: 2000, title: "Newer Card" });

    const results = await indexedDbService.getRecentDesigns(10);
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("Newer Card"); // newest first
    expect(results[1].title).toBe("Older Card");
  });

  it("deletes a single design record by ID", async () => {
    mockStoreData.set("id_del", { id: "id_del", timestamp: 1000, title: "To Delete" });
    expect(mockStoreData.has("id_del")).toBe(true);

    await indexedDbService.deleteRecentDesign("id_del");
    expect(mockStoreData.has("id_del")).toBe(false);
  });

  it("completely purges all records on clearAllHistory", async () => {
    mockStoreData.set("id_1", { id: "id_1", timestamp: 1000 });
    mockStoreData.set("id_2", { id: "id_2", timestamp: 2000 });
    expect(mockStoreData.size).toBe(2);

    await indexedDbService.clearAllHistory();
    expect(mockStoreData.size).toBe(0);
  });
});
