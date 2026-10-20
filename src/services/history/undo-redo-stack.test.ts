import { describe, it, expect } from "vitest";
import { UndoRedoStack } from "./undo-redo-stack.js";

describe("UndoRedoStack", () => {
  it("initializes with starting state and cannot undo/redo initially", () => {
    const stack = new UndoRedoStack({ count: 0 });
    expect(stack.state).toEqual({ count: 0 });
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);
    expect(stack.undo()).toBeNull();
    expect(stack.redo()).toBeNull();
  });

  it("pushes new states and undos back to previous states correctly", () => {
    const stack = new UndoRedoStack<number>(1);
    stack.push(2);
    stack.push(3);

    expect(stack.state).toBe(3);
    expect(stack.canUndo).toBe(true);

    expect(stack.undo()).toBe(2);
    expect(stack.state).toBe(2);
    expect(stack.canRedo).toBe(true);

    expect(stack.undo()).toBe(1);
    expect(stack.state).toBe(1);
    expect(stack.canUndo).toBe(false);
  });

  it("redos previous undos up to latest state", () => {
    const stack = new UndoRedoStack<string>("A");
    stack.push("B");
    stack.push("C");

    stack.undo(); // B
    stack.undo(); // A

    expect(stack.redo()).toBe("B");
    expect(stack.state).toBe("B");

    expect(stack.redo()).toBe("C");
    expect(stack.state).toBe("C");
    expect(stack.canRedo).toBe(false);
  });

  it("clears future history when pushing a new state after an undo", () => {
    const stack = new UndoRedoStack<number>(1);
    stack.push(2);
    stack.push(3);

    stack.undo(); // back to 2
    expect(stack.canRedo).toBe(true);

    stack.push(4); // replaces future branch
    expect(stack.canRedo).toBe(false);
    expect(stack.state).toBe(4);

    expect(stack.undo()).toBe(2);
  });

  it("respects maxDepth bound", () => {
    const stack = new UndoRedoStack<number>(0, 3);
    stack.push(1);
    stack.push(2);
    stack.push(3);
    stack.push(4);

    // Oldest state (0) should have been pruned
    stack.undo(); // 3
    stack.undo(); // 2
    stack.undo(); // 1
    expect(stack.canUndo).toBe(false);
  });
});
