import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../utils/constants';
import { AgentLog } from '../types';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  logs: AgentLog[];
  emitLog: (room: string, log: AgentLog) => void;
}

export const useWebSocket = (room?: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(API_CONFIG.BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (room) {
        socket.emit('joinRoom', room);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('agentLog', (log: AgentLog) => {
      setLogs((prev) => [...prev, log]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [room]);

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
    emitLog
  };
};

export default useWebSocket;
