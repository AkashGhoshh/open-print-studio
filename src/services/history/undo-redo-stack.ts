/**
 * Open Print Studio — Generic Undo / Redo History Stack
 * 
 * Manages reversible state transitions with bounded capacity (default 50 steps).
 */

export class UndoRedoStack<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];
  private readonly maxDepth: number;

  constructor(initialState: T, maxDepth = 50) {
    this.present = initialState;
    this.maxDepth = maxDepth;
  }

  public get state(): T {
    return this.present;
  }

  public get canUndo(): boolean {
    return this.past.length > 0;
  }

  public get canRedo(): boolean {
    return this.future.length > 0;
  }

  public push(nextState: T): void {
    this.past.push(this.present);
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.present = nextState;
    this.future = []; // Clear future on new action
  }

  public undo(): T | null {
    if (!this.canUndo) return null;
    const previous = this.past.pop()!;
    this.future.unshift(this.present);
    this.present = previous;
    return this.present;
  }

  public redo(): T | null {
    if (!this.canRedo) return null;
    const next = this.future.shift()!;
    this.past.push(this.present);
    this.present = next;
    return this.present;
  }

  public clear(resetState?: T): void {
    this.past = [];
    this.future = [];
    if (resetState !== undefined) {
      this.present = resetState;
    }
  }
}
