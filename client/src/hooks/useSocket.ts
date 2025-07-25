import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef<Socket<SocketEvents> | null>(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔗 Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
};