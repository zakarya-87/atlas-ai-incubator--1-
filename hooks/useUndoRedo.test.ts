
import { renderHook, act } from '@testing-library/react';
import useUndoRedo from './useUndoRedo';
import { describe, it, expect } from 'vitest';

describe('useUndoRedo Hook', () => {
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
});
