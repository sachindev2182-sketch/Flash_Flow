"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setSocketConnected } from '@/lib/redux/features/chat/chatSlice';

interface SocketContextType {
  socket: ReturnType<typeof getSocket>;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SocketProvider({ children, userId }: SocketProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = initializeSocket(userId);

    const handleConnect = () => {
      dispatch(setSocketConnected(true));
      if (userId) {
        socket.emit('user-authenticated', userId);
      }
    };

    const handleDisconnect = () => {
      dispatch(setSocketConnected(false));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      dispatch(setSocketConnected(true));
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      disconnectSocket();
    };
  }, [userId, dispatch]);

  const socket = getSocket();
  const isConnected = socket?.connected || false;

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};