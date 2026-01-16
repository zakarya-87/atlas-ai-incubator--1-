
import { renderHook, act } from '@testing-library/react';
import useUndoRedo from './useUndoRedo';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useUndoRedo Hook', () => {
  let mockEvent: KeyboardEvent;

  beforeEach(() => {
    mockEvent = new KeyboardEvent('keydown', { bubbles: true });
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('keydown', () => {});
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));
    expect(result.current.state).toBe('initial');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('should update state and add to history', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('new state');
    });

    expect(result.current.state).toBe('new state');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toBe('initial');
  });

  it('should handle function-based state updates', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }));

    act(() => {
      result.current.set((prev: { count: number }) => ({ count: prev.count + 1 }));
    });

    expect(result.current.state).toEqual({ count: 1 });
    expect(result.current.canUndo).toBe(true);
  });

  it('should not add to history when state is unchanged', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('initial'); // Same value
    });

    expect(result.current.canUndo).toBe(false);
    expect(result.current.history).toHaveLength(0);
  });

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });
    act(() => {
      result.current.set('state 2');
    });

    expect(result.current.state).toBe('state 2');

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe('state 1');
    expect(result.current.canRedo).toBe(true);
  });

  it('should redo to next state', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe('initial');

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toBe('state 1');
    expect(result.current.canUndo).toBe(true);
  });

  it('should handle multiple undo operations', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });
    act(() => {
      result.current.set('state 2');
    });
    act(() => {
      result.current.set('state 3');
    });

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toBe('state 2');

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toBe('state 1');

    act(() => {
      result.current.undo();
    });
    expect(result.current.state).toBe('initial');
    expect(result.current.canUndo).toBe(false);
  });

  it('should handle multiple redo operations', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });
    act(() => {
      result.current.set('state 2');
    });

    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toBe('initial');

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toBe('state 1');

    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toBe('state 2');
    expect(result.current.canRedo).toBe(false);
  });

  it('should clear future history when new action is taken after undo', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });
    act(() => {
      result.current.set('state 2');
    });

    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.set('state 3');
    });
    expect(result.current.canRedo).toBe(false);
  });

  it('should reset history', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });

    act(() => {
      result.current.reset('reset state');
    });

    expect(result.current.state).toBe('reset state');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.history).toHaveLength(0);
  });

  it('should handle keyboard shortcuts - Ctrl+Z for undo', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });

    // Simulate Ctrl+Z
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    });

    expect(result.current.state).toBe('initial');
  });

  it('should handle keyboard shortcuts - Ctrl+Y for redo', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });
    act(() => {
      result.current.undo();
    });

    // Simulate Ctrl+Y
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }));
    });

    expect(result.current.state).toBe('state 1');
  });

  it('should handle keyboard shortcuts - Ctrl+Shift+Z for redo', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });
    act(() => {
      result.current.undo();
    });

    // Simulate Ctrl+Shift+Z
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
    });

    expect(result.current.state).toBe('state 1');
  });

  it('should not trigger shortcuts without modifier keys', () => {
    const { result } = renderHook(() => useUndoRedo('initial'));

    act(() => {
      result.current.set('state 1');
    });

    // Simulate Z without Ctrl
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }));
    });

    expect(result.current.state).toBe('state 1'); // Should not have undone
  });
});