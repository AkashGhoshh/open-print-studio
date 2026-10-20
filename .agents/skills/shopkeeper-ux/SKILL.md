---
name: shopkeeper-ux
description: Use this skill when designing busy-operator interfaces, keyboard shortcuts, batch queues, drag-and-drop workflows, undo-redo stacks, live millimeter rulers, high-contrast dark/light themes, or touch-friendly UI components.
---

# Shopkeeper Retail UX

## Goal
Deliver a fast, ergonomic, touch-friendly desktop interface tailored for busy cyber cafe and photo studio operators processing high customer volumes with minimal friction.

## Use this skill when
- Building or styling the main application navigation and workspace shell.
- Implementing drag-and-drop file ingestion and multi-document batch queues.
- Wiring application keyboard shortcuts (`Ctrl+P`, `Ctrl+O`, `Ctrl+Z`, `Ctrl+Y`, arrow nudging).
- Implementing undo/redo state stacks with history preservation.
- Designing live millimeter rulers, alignment guides, and vector cut-marks.
- Crafting plain-language error alerts with actionable recovery guidance.

## Do NOT use when
- Calculating mathematical layout capacities or grid solver logic (use `print-geometry-layout`).
- Managing raw Electron IPC print dialogs (use `electron-secure-printing`).
- Managing Hindi language dictionary translations (use `i18n-hindi`).

## Workflow
1. **Apply High-Contrast Design System**: Use curated CSS tokens for dark and light modes. Ensure primary action targets are at least $48$ px high.
2. **Implement Drag-and-Drop**: Support dropping multiple PDFs and images anywhere on the window. Route to the batch queue.
3. **Register Global Shortcuts**: Listen for keyboard commands (`Ctrl+P` to print, `Ctrl+O` to open, `F` to flip, arrows to nudge).
4. **Render Precision Rulers**: Draw live millimeter marks and crosshair guides around the interactive canvas.
5. **Wire Undo / Redo**: Wrap layout and crop manipulations in an undoable history store (`z-undo` / reducer).
6. **Provide One-Click Reprint**: Display the Recents drawer allowing instant re-spooling of previous customer jobs.

## Rules and constraints
- All interactive touch targets must be at least $44 \times 44$ px ($48$ px recommended for primary actions).
- Error messages must explain the failure in non-technical terms and give an explicit next action.
- Every crop or layout adjustment must support instant undo via `Ctrl+Z`.
- High-contrast visual feedback must indicate active selection, dragging, and hover states clearly.

## Verification checklist
- [ ] Keyboard navigation and shortcuts work across all tabs without focus trapping.
- [ ] Dragging files onto workspace immediately opens the document or queue.
- [ ] `Ctrl+Z` reverses the last crop or nudge operation reliably.
- [ ] Error toasts provide clear human-readable recovery steps.

## References
- [Shopkeeper Interaction Matrix & Shortcuts](./references/shopkeeper-interaction-matrix.md)
