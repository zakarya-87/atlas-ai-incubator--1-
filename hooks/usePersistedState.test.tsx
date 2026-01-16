import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import usePersistedState from './usePersistedState';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('usePersistedState Hook (TC016)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with initial state when no stored value exists', () => {
    const { result } = renderHook(() => usePersistedState('test-key', 'initial-value'));

    expect(result.current[0]).toBe('initial-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should initialize with stored value when available', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => usePersistedState('test-key', 'initial-value'));

    expect(result.current[0]).toBe('stored-value');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should save state to localStorage when state changes', () => {
    const { result } = renderHook(() => usePersistedState('test-key', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should handle function-based state updates', () => {
    const { result } = renderHook(() => usePersistedState('counter', 0));

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('counter', JSON.stringify(1));
  });

  it('should persist state across hook re-renders', () => {
    const { result, rerender } = renderHook(() => usePersistedState('persist-key', 'value'));

    act(() => {
      result.current[1]('updated-value');
    });

    rerender();

    expect(result.current[0]).toBe('updated-value');
  });

  it('should handle complex objects and arrays', () => {
    const complexObject = { user: { name: 'John', age: 30 }, settings: [1, 2, 3] };
    const { result } = renderHook(() => usePersistedState('complex', complexObject));

    act(() => {
      result.current[1]({ ...complexObject, user: { ...complexObject.user, age: 31 } });
    });

    expect(result.current[0].user.age).toBe(31);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('complex', JSON.stringify({ ...complexObject, user: { ...complexObject.user, age: 31 } }));
  });

  it('should handle null and undefined values', () => {
    const { result } = renderHook(() => usePersistedState('nullable', 'default'));

    act(() => {
      result.current[1](null as any);
    });

    expect(result.current[0]).toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nullable', JSON.stringify(null));
  });

  it('should handle boolean values', () => {
    const { result } = renderHook(() => usePersistedState('boolean', false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('boolean', JSON.stringify(true));
  });

  it('should handle number values', () => {
    const { result } = renderHook(() => usePersistedState('number', 0));

    act(() => {
      result.current[1](42.5);
    });

    expect(result.current[0]).toBe(42.5);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('number', JSON.stringify(42.5));
  });

  it('should restore state correctly on component remount', () => {
    // First hook usage
    const { result: result1, unmount: unmount1 } = renderHook(() => usePersistedState('remount-test', 'initial'));

    act(() => {
      result1.current[1]('modified');
    });

    unmount1();

    // Second hook usage (simulating component remount)
    const { result: result2 } = renderHook(() => usePersistedState('remount-test', 'initial'));

    expect(result2.current[0]).toBe('modified');
  });

  it('should handle localStorage JSON parse errors gracefully', () => {
    // Simulate corrupted localStorage data
    localStorageMock.setItem('corrupted', 'invalid-json{');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => usePersistedState('corrupted', 'fallback'));

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalledWith('Error reading localStorage key "corrupted":', expect.any(SyntaxError));

    consoleSpy.mockRestore();
  });

  it('should handle localStorage setItem errors gracefully', () => {
    // Mock localStorage to throw an error
    const originalSetItem = localStorageMock.setItem;
    localStorageMock.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => usePersistedState('error-test', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    // State should still update even if localStorage fails
    expect(result.current[0]).toBe('new-value');
    expect(consoleSpy).toHaveBeenCalledWith('Error setting localStorage key "error-test":', expect.any(Error));

    // Restore original function
    localStorageMock.setItem = originalSetItem;
    consoleSpy.mockRestore();
  });

  it('should work with multiple different keys independently', () => {
    const { result: result1 } = renderHook(() => usePersistedState('key1', 'value1'));
    const { result: result2 } = renderHook(() => usePersistedState('key2', 'value2'));

    act(() => {
      result1.current[1]('updated1');
      result2.current[1]('updated2');
    });

    expect(result1.current[0]).toBe('updated1');
    expect(result2.current[0]).toBe('updated2');

    expect(localStorageMock.setItem).toHaveBeenCalledWith('key1', JSON.stringify('updated1'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('key2', JSON.stringify('updated2'));
  });

  it('should handle empty string keys', () => {
    const { result } = renderHook(() => usePersistedState('', 'default'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('', JSON.stringify('updated'));
  });

  it('should handle special characters in keys', () => {
    const specialKey = 'test-key_with.special:chars';
    const { result } = renderHook(() => usePersistedState(specialKey, 'default'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(specialKey, JSON.stringify('updated'));
  });

  it('should handle Date objects', () => {
    const date = new Date('2023-01-01T00:00:00Z');
    const { result } = renderHook(() => usePersistedState('date', date));

    act(() => {
      result.current[1](new Date('2023-12-31T00:00:00Z'));
    });

    expect(result.current[0]).toEqual(new Date('2023-12-31T00:00:00Z'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('date', JSON.stringify(new Date('2023-12-31T00:00:00Z')));
  });

  it('should handle empty objects and arrays', () => {
    const { result: objResult } = renderHook(() => usePersistedState('empty-obj', {}));
    const { result: arrResult } = renderHook(() => usePersistedState('empty-arr', []));

    act(() => {
      objResult.current[1]({ key: 'value' });
      arrResult.current[1]([1, 2, 3]);
    });

    expect(objResult.current[0]).toEqual({ key: 'value' });
    expect(arrResult.current[0]).toEqual([1, 2, 3]);

    expect(localStorageMock.setItem).toHaveBeenCalledWith('empty-obj', JSON.stringify({ key: 'value' }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('empty-arr', JSON.stringify([1, 2, 3]));
  });

  it('should handle large objects without performance issues', () => {
    const largeObject = {
      data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` })),
      metadata: { version: '1.0', timestamp: Date.now() }
    };

    const { result } = renderHook(() => usePersistedState('large', largeObject));

    act(() => {
      result.current[1]({ ...largeObject, metadata: { ...largeObject.metadata, version: '2.0' } });
    });

    expect(result.current[0].metadata.version).toBe('2.0');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('large', expect.any(String));
  });

  it('should maintain state consistency across rapid updates', () => {
    const { result } = renderHook(() => usePersistedState('rapid', 0));

    act(() => {
      result.current[1](1);
      result.current[1](2);
      result.current[1](3);
    });

    expect(result.current[0]).toBe(3);
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('rapid', JSON.stringify(3));
  });

  it('should handle concurrent hook usage with same key', () => {
    const { result: result1 } = renderHook(() => usePersistedState('shared', 'initial'));
    const { result: result2 } = renderHook(() => usePersistedState('shared', 'initial'));

    // Both should start with the same initial value
    expect(result1.current[0]).toBe('initial');
    expect(result2.current[0]).toBe('initial');

    // Update first hook
    act(() => {
      result1.current[1]('updated-by-first');
    });

    // Second hook should still see old value (they don't share state directly)
    expect(result1.current[0]).toBe('updated-by-first');
    expect(result2.current[0]).toBe('initial');
  });
});