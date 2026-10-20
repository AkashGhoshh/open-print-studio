import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Layers,
  X,
  Trash2,
  Printer,
  ChevronUp,
  ChevronDown,
  FileCheck,
} from "lucide-react";
import { batchQueueService, BatchCardItem } from "../../services/batch/batch-queue.js";

interface BatchQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintBatch?: () => void;
}

export const BatchQueueDrawer: React.FC<BatchQueueDrawerProps> = ({
  isOpen,
  onClose,
  onPrintBatch,
}) => {
  const { t } = useTranslation();
  const [, setRefresh] = useState<number>(0);

  if (!isOpen) return null;

  const items = batchQueueService.items;
  const sheets = batchQueueService.paginate(5); // 5 pairs per A4 sheet

  const handleRemove = (id: string) => {
    batchQueueService.removeItem(id);
    setRefresh((n) => n + 1);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      batchQueueService.reorder(index, index - 1);
      setRefresh((n) => n + 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < items.length - 1) {
      batchQueueService.reorder(index, index + 1);
      setRefresh((n) => n + 1);
    }
  };

  const handleClear = () => {
    batchQueueService.clear();
    setRefresh((n) => n + 1);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: 440,
        backgroundColor: "var(--bg-surface)",
        borderLeft: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Layers size={20} color="var(--accent-primary)" />
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
            Batch Queue ({items.length} cards)
          </h2>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Sheets Summary */}
      <div style={{ padding: "12px 20px", backgroundColor: "var(--bg-app)", fontSize: "0.8125rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
          <span>Multi-Sheet Auto Pagination:</span>
          <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>
            {sheets.length} A4 Sheet{sheets.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Item List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: 40 }}>
            No cards in batch queue.
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                backgroundColor: "var(--bg-app)",
                borderRadius: "var(--border-radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "var(--accent-surface)",
                    color: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {idx + 1}
                </span>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  type="button"
                  className="icon-btn"
                  title="Move Up"
                  disabled={idx === 0}
                  onClick={() => handleMoveUp(idx)}
                  style={{ padding: 4 }}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Move Down"
                  disabled={idx === items.length - 1}
                  onClick={() => handleMoveDown(idx)}
                  style={{ padding: 4 }}
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  title="Remove from queue"
                  onClick={() => handleRemove(item.id)}
                  style={{ padding: 4 }}
                >
                  <Trash2 size={16} color="#EF4444" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: "100%", padding: "12px 16px" }}
          onClick={onPrintBatch}
          disabled={items.length === 0}
        >
          <Printer size={18} />
          <span>Print All {sheets.length} Sheet{sheets.length !== 1 ? "s" : ""}</span>
        </button>

        {items.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "100%" }}
            onClick={handleClear}
          >
            <Trash2 size={16} />
            <span>Clear Queue</span>
          </button>
        )}
      </div>
    </div>
  );
};
