"use client";

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';

export function useConnectionStatus() {
  const [status, setStatus] = useState({
    isConnected: false,
    socketId: null as string | null,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const updateStatus = () => {
      setStatus({
        isConnected: socket.connected,
        socketId: socket.id || null,
      });
    };

    socket.on('connect', updateStatus);
    socket.on('disconnect', updateStatus);
    socket.on('reconnect', updateStatus);

    // Initial status
    updateStatus();

    return () => {
      socket.off('connect', updateStatus);
      socket.off('disconnect', updateStatus);
      socket.off('reconnect', updateStatus);
    };
  }, []);

  return status;
}