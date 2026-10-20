import { describe, it, expect } from "vitest";
import { BatchQueueService } from "./batch-queue.js";

describe("BatchQueueService", () => {
  it("enqueues and dequeues batch card items", () => {
    const queue = new BatchQueueService();
    expect(queue.count).toBe(0);

    const item1 = queue.addItem({ title: "Card 1" });
    const item2 = queue.addItem({ title: "Card 2" });

    expect(queue.count).toBe(2);
    expect(queue.items[0].title).toBe("Card 1");

    const removed = queue.removeItem(item1.id);
    expect(removed).toBe(true);
    expect(queue.count).toBe(1);
    expect(queue.items[0].title).toBe("Card 2");
  });

  it("reorders items correctly", () => {
    const queue = new BatchQueueService();
    queue.addItem({ title: "First" });
    queue.addItem({ title: "Second" });
    queue.addItem({ title: "Third" });

    queue.reorder(0, 2); // Move "First" to end
    expect(queue.items[0].title).toBe("Second");
    expect(queue.items[1].title).toBe("Third");
    expect(queue.items[2].title).toBe("First");
  });

  it("paginates items across multi-up sheets", () => {
    const queue = new BatchQueueService();
    // Add 12 items
    for (let i = 1; i <= 12; i++) {
      queue.addItem({ title: `Card ${i}` });
    }

    // A4 sheet: 5 pairs per sheet
    const sheets = queue.paginate(5);
    expect(sheets.length).toBe(3); // 5 + 5 + 2 = 12
    expect(sheets[0].items.length).toBe(5);
    expect(sheets[1].items.length).toBe(5);
    expect(sheets[2].items.length).toBe(2);
  });

  it("enforces maximum queue capacity (50 cards)", () => {
    const queue = new BatchQueueService();
    for (let i = 0; i < 50; i++) {
      queue.addItem({ title: `Item ${i}` });
    }

    expect(() => queue.addItem({ title: "Overflow" })).toThrow("Batch queue capacity limit reached");
  });

  it("restores queue state upon crash recovery", () => {
    const mockStorage: Record<string, string> = {};
    const storageSpy = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
    };
    (globalThis as any).localStorage = storageSpy;

    const queue1 = new BatchQueueService();
    queue1.addItem({ title: "Recoverable Card 1" });
    queue1.addItem({ title: "Recoverable Card 2" });

    // Simulate reload / crash recovery
    const queue2 = new BatchQueueService();
    expect(queue2.count).toBe(2);
    expect(queue2.items[0].title).toBe("Recoverable Card 1");
    expect(queue2.items[1].title).toBe("Recoverable Card 2");

    queue2.clear();
    const queue3 = new BatchQueueService();
    expect(queue3.count).toBe(0);
  });
});
