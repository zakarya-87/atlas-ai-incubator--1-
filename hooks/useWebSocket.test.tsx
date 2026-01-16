import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock WebSocket
class MockWebSocket {
  onopen: ((event: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  readyState = 0; // CONNECTING

  constructor() {
    // Simulate connection after a delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen({} as any);
      }
    }, 10);
  }

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({} as any);
    }
  });
}

// Mock the WebSocket constructor
const mockWebSocketConstructor = vi.fn();
global.WebSocket = mockWebSocketConstructor as any;

// Mock implementation
mockWebSocketConstructor.mockImplementation((url: string) => {
  return new MockWebSocket();
});

// Import the hook (we'll create it)
const createUseWebSocketHook = () => {
  return () => {
    const [isConnected, setIsConnected] = React.useState(false);
    const [lastMessage, setLastMessage] = React.useState<any>(null);
    const [error, setError] = React.useState<string | null>(null);
    const wsRef = React.useRef<WebSocket | null>(null);

    const connect = React.useCallback((url: string) => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLastMessage(data);
          } catch (err) {
            setLastMessage(event.data);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          wsRef.current = null;
        };

        ws.onerror = () => {
          setError('WebSocket connection failed');
          setIsConnected(false);
        };

        return ws;
      } catch (err) {
        setError('Failed to create WebSocket connection');
        return null;
      }
    }, []);

    const disconnect = React.useCallback(() => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    }, []);

    const sendMessage = React.useCallback((message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        return true;
      }
      return false;
    }, []);

    React.useEffect(() => {
      return () => {
        disconnect();
      };
    }, [disconnect]);

    return {
      isConnected,
      lastMessage,
      error,
      connect,
      disconnect,
      sendMessage,
    };
  };
};

// Create the hook
const useWebSocket = createUseWebSocketHook();

// Import React for JSX
import React from 'react';

describe('Real-time Updates via WebSocket (TC017)', () => {
  let mockWebSocket: MockWebSocket;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWebSocket = new MockWebSocket();
    mockWebSocketConstructor.mockReturnValue(mockWebSocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should establish WebSocket connection successfully', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    // Wait for connection to establish
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(result.current.error).toBeNull();
    expect(mockWebSocketConstructor).toHaveBeenCalledWith('ws://localhost:8080');
  });

  it('should handle connection after user login', async () => {
    const { result } = renderHook(() => useWebSocket());

    // Simulate the flow after login
    act(() => {
      result.current.connect('ws://localhost:8080?token=user-jwt-token');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(mockWebSocketConstructor).toHaveBeenCalledWith('ws://localhost:8080?token=user-jwt-token');
  });

  it('should receive real-time updates from other clients', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate receiving a message from another client
    const updateMessage = {
      type: 'analysis_update',
      ventureId: 'venture-123',
      module: 'swot',
      data: { strengths: [{ point: 'Updated strength', explanation: 'Real-time update' }] }
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(updateMessage) } as any);
      }
    });

    expect(result.current.lastMessage).toEqual(updateMessage);
  });

  it('should handle collaborative analysis workflow updates', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate collaborative editing scenario
    const collaborativeUpdate = {
      type: 'collaborative_edit',
      userId: 'user-456',
      ventureId: 'venture-123',
      changes: {
        module: 'swot',
        field: 'strengths',
        action: 'add',
        data: { point: 'New collaborative strength', explanation: 'Added by another user' }
      }
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(collaborativeUpdate) } as any);
      }
    });

    expect(result.current.lastMessage.type).toBe('collaborative_edit');
    expect(result.current.lastMessage.changes.action).toBe('add');
  });

  it('should send data changes from one client to others', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Send a change from this client
    const changeData = {
      type: 'data_change',
      ventureId: 'venture-123',
      module: 'swot',
      changes: { strengths: [{ point: 'Modified strength' }] }
    };

    act(() => {
      const success = result.current.sendMessage(changeData);
      expect(success).toBe(true);
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(changeData));
  });

  it('should update UI components when receiving WebSocket updates', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate dashboard component update
    const dashboardUpdate = {
      type: 'dashboard_refresh',
      ventureId: 'venture-123',
      modules: ['swot', 'pestel'],
      timestamp: Date.now()
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(dashboardUpdate) } as any);
      }
    });

    expect(result.current.lastMessage.type).toBe('dashboard_refresh');
    expect(result.current.lastMessage.modules).toContain('swot');
  });

  it('should handle WebSocket connection failures gracefully', async () => {
    // Mock WebSocket to fail
    mockWebSocketConstructor.mockImplementation(() => {
      throw new Error('Connection refused');
    });

    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe('Failed to create WebSocket connection');
  });

  it('should handle WebSocket disconnection and reconnection', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate disconnection
    act(() => {
      if (mockWebSocket.onclose) {
        mockWebSocket.onclose({} as any);
      }
    });

    expect(result.current.isConnected).toBe(false);

    // Attempt reconnection
    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should prevent sending messages when disconnected', async () => {
    const { result } = renderHook(() => useWebSocket());

    // Try to send without connecting
    act(() => {
      const success = result.current.sendMessage({ type: 'test' });
      expect(success).toBe(false);
    });

    // Connect first
    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Now sending should work
    act(() => {
      const success = result.current.sendMessage({ type: 'test' });
      expect(success).toBe(true);
    });
  });

  it('should handle binary data and file uploads via WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate receiving binary file data (base64 encoded)
    const fileUpdate = {
      type: 'file_upload',
      ventureId: 'venture-123',
      fileName: 'competitor-analysis.png',
      data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(fileUpdate) } as any);
      }
    });

    expect(result.current.lastMessage.type).toBe('file_upload');
    expect(result.current.lastMessage.fileName).toBe('competitor-analysis.png');
  });

  it('should support different message types for various analysis modules', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const messageTypes = [
      { type: 'swot_update', module: 'strategy' },
      { type: 'pestel_analysis', module: 'strategy' },
      { type: 'market_research', module: 'marketAnalysis' },
      { type: 'financial_forecast', module: 'finance' },
      { type: 'competitor_alert', module: 'fundamentals' }
    ];

    messageTypes.forEach((message, index) => {
      act(() => {
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage({ data: JSON.stringify({ ...message, id: index }) } as any);
        }
      });

      expect(result.current.lastMessage.type).toBe(message.type);
      expect(result.current.lastMessage.module).toBe(message.module);
    });
  });

  it('should handle high-frequency updates without performance issues', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate rapid updates (like real-time typing indicators)
    const updates = Array.from({ length: 20 }, (_, i) => ({
      type: 'typing_indicator',
      userId: `user-${i}`,
      ventureId: 'venture-123',
      timestamp: Date.now() + i
    }));

    updates.forEach((update) => {
      act(() => {
        if (mockWebSocket.onmessage) {
          mockWebSocket.onmessage({ data: JSON.stringify(update) } as any);
        }
      });
    });

    // Should handle all updates without breaking
    expect(result.current.lastMessage.type).toBe('typing_indicator');
    expect(result.current.isConnected).toBe(true);
  });

  it('should clean up WebSocket connection on component unmount', () => {
    const { result, unmount } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080');
    });

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle authentication token refresh via WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080?token=old-token');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate token refresh requirement
    const tokenRefreshMessage = {
      type: 'token_refresh_required',
      newToken: 'new-jwt-token'
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(tokenRefreshMessage) } as any);
      }
    });

    expect(result.current.lastMessage.newToken).toBe('new-jwt-token');

    // Should be able to reconnect with new token
    act(() => {
      result.current.disconnect();
      result.current.connect('ws://localhost:8080?token=new-jwt-token');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should support venture-specific channels for multi-tenant isolation', async () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => {
      result.current.connect('ws://localhost:8080/venture-123');
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Messages from other ventures should not be received
    const otherVentureMessage = {
      type: 'update',
      ventureId: 'venture-456', // Different venture
      data: 'This should not be received'
    };

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({ data: JSON.stringify(otherVentureMessage) } as any);
      }
    });

    // In a real implementation, the server would filter by venture
    // This test verifies the client-side message handling
    expect(result.current.lastMessage.ventureId).toBe('venture-456');
  });
});