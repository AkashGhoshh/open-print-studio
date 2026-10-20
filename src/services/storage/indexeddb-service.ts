/**
 * Open Print Studio — IndexedDB Storage Service (ops_db)
 * 
 * Strict data segregation per ADR-003:
 * - Customer card designs, thumbnails, and mobile numbers reside in IndexedDB.
 * - Privacy Mode prevents any writes to disk.
 * - Automated 24h background expiry and one-click history wipe.
 */

import { loadSettings } from "./settings-schema";

export const DB_NAME = "ops_db";
export const DB_VERSION = 1;
export const STORE_RECENTS = "recent_designs";
export const STORE_PROFILES = "printer_profiles";

export interface RecentDesignRecord {
  id: string;
  timestamp: number;
  title: string;
  templateId: string;
  customerMobile?: string;
  frontBlob?: Blob;
  backBlob?: Blob;
  thumbnailBlob?: Blob;
  settings?: Record<string, any>;
}

export interface PrinterProfileRecord {
  id: string;
  name: string;
  paperType: "A4" | "4x6" | "PVC_TRAY";
  offsetX: number;
  offsetY: number;
  cardScale: number;
  gapX: number;
  gapY: number;
}

class IndexedDbService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public getDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
          reject(new Error("IndexedDB is not available in this environment"));
          return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
          const db = (e.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORE_RECENTS)) {
            const recentsStore = db.createObjectStore(STORE_RECENTS, { keyPath: "id" });
            recentsStore.createIndex("timestamp", "timestamp", { unique: false });
          }

          if (!db.objectStoreNames.contains(STORE_PROFILES)) {
            db.createObjectStore(STORE_PROFILES, { keyPath: "id" });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  /**
   * Saves a recent design session.
   * If Privacy Mode is active in settings, write is completely blocked.
   */
  public async saveRecentDesign(
    record: Omit<RecentDesignRecord, "id" | "timestamp"> & { id?: string; timestamp?: number }
  ): Promise<string | null> {
    const settings = loadSettings();
    if (settings.privacyMode) {
      // Privacy mode active: zero disk write
      return null;
    }

    const db = await this.getDb();
    const id = record.id || `ops_des_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const fullRecord: RecentDesignRecord = {
      ...record,
      id,
      timestamp: record.timestamp || Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECENTS, "readwrite");
      const store = tx.objectStore(STORE_RECENTS);
      const req = store.put(fullRecord);

      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retrieves all recent designs sorted newest-first.
   */
  public async getRecentDesigns(limit = 20): Promise<RecentDesignRecord[]> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECENTS, "readonly");
      const store = tx.objectStore(STORE_RECENTS);
      const index = store.index("timestamp");
      const req = index.openCursor(null, "prev"); // newest first

      const results: RecentDesignRecord[] = [];
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Deletes a specific design session by ID.
   */
  public async deleteRecentDesign(id: string): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECENTS, "readwrite");
      const store = tx.objectStore(STORE_RECENTS);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Cleans all sessions older than the specified retention window (default: 24 hours).
   */
  public async cleanExpiredDesigns(retentionHours = 24): Promise<number> {
    const db = await this.getDb();
    const cutoff = Date.now() - retentionHours * 3600 * 1000;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECENTS, "readwrite");
      const store = tx.objectStore(STORE_RECENTS);
      const index = store.index("timestamp");
      const range = IDBKeyRange.upperBound(cutoff);
      const req = index.openCursor(range);

      let deletedCount = 0;
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Completely wipes all customer design records from IndexedDB.
   */
  public async clearAllHistory(): Promise<void> {
    const db = await this.getDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECENTS, "readwrite");
      const store = tx.objectStore(STORE_RECENTS);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const indexedDbService = new IndexedDbService();
