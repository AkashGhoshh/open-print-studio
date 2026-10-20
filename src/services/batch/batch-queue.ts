/**
 * Open Print Studio — Multi-Card Batch Queue Service
 * 
 * Supports queuing up to 50 cards and automatic multi-sheet pagination
 * for high-volume retail printing workflows.
 */

export interface BatchCardItem {
  id: string;
  title: string;
  frontBlob?: Blob;
  backBlob?: Blob;
  frontCanvas?: HTMLCanvasElement;
  backCanvas?: HTMLCanvasElement;
  timestamp: number;
}

export interface PaginatedBatchSheet {
  sheetIndex: number;
  totalSheets: number;
  items: BatchCardItem[];
}

export class BatchQueueService {
  private queue: BatchCardItem[] = [];
  private readonly maxCapacity = 50;

  public get items(): BatchCardItem[] {
    return [...this.queue];
  }

  public get count(): number {
    return this.queue.length;
  }

  public addItem(item: Omit<BatchCardItem, "id" | "timestamp">): BatchCardItem {
    if (this.queue.length >= this.maxCapacity) {
      throw new Error(`Batch queue capacity limit reached (max ${this.maxCapacity} cards).`);
    }

    const newItem: BatchCardItem = {
      ...item,
      id: `ops_batch_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    this.queue.push(newItem);
    return newItem;
  }

  public removeItem(id: string): boolean {
    const idx = this.queue.findIndex((item) => item.id === id);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      return true;
    }
    return false;
  }

  public reorder(fromIndex: number, toIndex: number): void {
    if (
      fromIndex < 0 ||
      fromIndex >= this.queue.length ||
      toIndex < 0 ||
      toIndex >= this.queue.length
    ) {
      return;
    }
    const [moved] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, moved);
  }

  public clear(): void {
    this.queue = [];
  }

  /**
   * Paginates queue items across sheets based on pairsPerSheet capacity.
   * e.g. A4 fits 5 pairs (5 items if each item has front & back).
   */
  public paginate(pairsPerSheet = 5): PaginatedBatchSheet[] {
    if (this.queue.length === 0) return [];

    const sheets: PaginatedBatchSheet[] = [];
    const totalSheets = Math.ceil(this.queue.length / pairsPerSheet);

    for (let s = 0; s < totalSheets; s++) {
      const start = s * pairsPerSheet;
      const end = start + pairsPerSheet;
      sheets.push({
        sheetIndex: s + 1,
        totalSheets,
        items: this.queue.slice(start, end),
      });
    }

    return sheets;
  }
}

export const batchQueueService = new BatchQueueService();
