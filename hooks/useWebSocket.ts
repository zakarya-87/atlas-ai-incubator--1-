import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_CONFIG } from '../utils/constants';
import { AgentLog, AnyAnalysisData } from '../types';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  logs: AgentLog[];
  emitLog: (room: string, log: AgentLog) => void;
  onAnalysisResult?: (result: { jobId: string; result: AnyAnalysisData }) => void;
}

/**
 * Derive the WebSocket server URL from the environment.
 * - In Vite dev/prod builds: use VITE_BACKEND_URL if set.
 * - Otherwise fall back to the current page origin so relative
 *   deployments (nginx proxy) work without any configuration.
 */
function getSocketUrl(): string {
  // Vite replaces import.meta.env at build time
  const envUrl =
    typeof import.meta !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env?.VITE_BACKEND_URL;
  if (envUrl) return envUrl as string;
  // In SSR / test environments window may not exist
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export const useWebSocket = (
  room?: string,
  onAnalysisResult?: (result: { jobId: string; result: AnyAnalysisData }) => void
): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Keep a stable ref to the latest callback so we never need to recreate
  // the socket just because the parent re-renders with a new function identity.
  const onAnalysisResultRef = useRef(onAnalysisResult);
  useEffect(() => {
    onAnalysisResultRef.current = onAnalysisResult;
  }, [onAnalysisResult]);

  // ── Socket lifecycle – created ONCE, never torn down on re-renders ──────
  useEffect(() => {
    const socket = io(getSocketUrl(), {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
      reconnectionAttempts: WS_CONFIG.RECONNECT_ATTEMPTS,
      reconnectionDelay: WS_CONFIG.RECONNECT_DELAY,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('agentLog', (log: AgentLog) => {
      setLogs((prev) => [...prev, log]);
    });

    socket.on('analysisResult', (data: { jobId: string; result: AnyAnalysisData }) => {
      onAnalysisResultRef.current?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // Empty deps – socket is created once per component mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Room joining – runs whenever `room` or connection state changes ──────
  useEffect(() => {
    if (!room) return;
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.connected) {
      socket.emit('joinRoom', room);
    } else {
      // Wait until the socket has connected before joining.
      const onConnect = (): void => {
        socket.emit('joinRoom', room);
      };
      socket.once('connect', onConnect);
      return () => {
        socket.off('connect', onConnect);
      };
    }
  }, [room, isConnected]);

  const joinRoom = useCallback((newRoom: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', newRoom);
    }
  }, []);

  const emitLog = useCallback((targetRoom: string, log: AgentLog) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('agentLog', { room: targetRoom, ...log });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    logs,
    emitLog,
    onAnalysisResult,
  };
};

export default useWebSocket;

