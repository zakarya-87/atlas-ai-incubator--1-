import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useWebSocket } from './useWebSocket';

// ───────────────────────────────────────────────────
// Mock socket.io-client
// ───────────────────────────────────────────────────
const mockSocket = {
  on: vi.fn(),
  once: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

import { io } from 'socket.io-client';

/**
 * Helper: grab the handler registered for a given event name and call it.
 */
function triggerEvent(eventName: string, ...args: unknown[]): void {
  const calls = (mockSocket.on as ReturnType<typeof vi.fn>).mock.calls;
  const match = calls.find(([evt]) => evt === eventName);
  if (match) {
    (match[1] as (...a: unknown[]) => void)(...args);
  }
}

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset connected state
    mockSocket.connected = false;
    // Make socket.once forward to socket.on for simplicity
    (mockSocket.once as ReturnType<typeof vi.fn>).mockImplementation(
      (evt: string, cb: () => void) => mockSocket.on(evt, cb)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(useWebSocket).toBeDefined();
  });

  it('should establish a WebSocket connection on mount', () => {
    renderHook(() => useWebSocket());
    expect(io).toHaveBeenCalledOnce();
    // socket.on should have been called for the standard events
    const registeredEvents = (mockSocket.on as ReturnType<typeof vi.fn>).mock.calls.map(
      ([evt]) => evt
    );
    expect(registeredEvents).toContain('connect');
    expect(registeredEvents).toContain('disconnect');
    expect(registeredEvents).toContain('agentLog');
    expect(registeredEvents).toContain('analysisResult');
  });

  it('should reflect isConnected=true after connect event fires', () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current.isConnected).toBe(false);

    act(() => {
      mockSocket.connected = true;
      triggerEvent('connect');
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('should clean up the socket connection on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket());
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalledOnce();
  });

  it('should join a room once connected', () => {
    mockSocket.connected = false;
    renderHook(() => useWebSocket('my-room'));

    // Simulate the connect event so the once('connect') handler fires
    act(() => {
      mockSocket.connected = true;
      triggerEvent('connect');
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'my-room');
  });

  it('should accumulate agentLog events in logs state', () => {
    const { result } = renderHook(() => useWebSocket());

    const log1 = { id: '1', agent: 'Bot', messageKey: 'msg1', timestamp: 1 };
    const log2 = { id: '2', agent: 'Bot', messageKey: 'msg2', timestamp: 2 };

    act(() => {
      triggerEvent('agentLog', log1);
      triggerEvent('agentLog', log2);
    });

    expect(result.current.logs).toHaveLength(2);
    expect(result.current.logs[0]).toEqual(log1);
    expect(result.current.logs[1]).toEqual(log2);
  });

  it('should invoke onAnalysisResult callback when analysisResult event fires', () => {
    const callback = vi.fn();
    renderHook(() => useWebSocket(undefined, callback));

    const payload = { jobId: 'j1', result: { score: 99 } };
    act(() => {
      triggerEvent('analysisResult', payload);
    });

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith(payload);
  });

  it('should NOT emit when disconnected (emitLog no-op guard)', () => {
    mockSocket.connected = false;
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.emitLog('room', {
        id: 'x',
        agent: 'Bot',
        messageKey: 'key',
        timestamp: 0,
      });
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  it('should NOT recreate the socket when onAnalysisResult callback reference changes', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => useWebSocket(undefined, cb),
      { initialProps: { cb: cb1 } }
    );

    // Rerender with a different callback reference
    rerender({ cb: cb2 });

    // io() should still have been called only once (socket created on mount)
    expect(io).toHaveBeenCalledOnce();
  });

  it('should join a new room without recreating the socket when room changes', () => {
    mockSocket.connected = true;
    const { rerender } = renderHook(
      ({ room }) => useWebSocket(room),
      { initialProps: { room: 'room-a' } }
    );

    // Already connected, so joinRoom emitted immediately for room-a
    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'room-a');

    rerender({ room: 'room-b' });

    // Should emit joinRoom for the new room
    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'room-b');
    // Socket should never have been disconnected (no reconnect)
    expect(mockSocket.disconnect).not.toHaveBeenCalled();
    // io() still called only once
    expect(io).toHaveBeenCalledOnce();
  });

  it('should handle WebSocket disconnection event and reflect isConnected=false', () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      mockSocket.connected = true;
      triggerEvent('connect');
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      mockSocket.connected = false;
      triggerEvent('disconnect');
    });
    expect(result.current.isConnected).toBe(false);
  });
});

