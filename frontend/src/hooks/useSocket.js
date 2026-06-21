import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (onNotification) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_admin');

    if (onNotification) {
      socketRef.current.on('notification', onNotification);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
};
