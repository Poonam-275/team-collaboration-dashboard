import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getAuth } from 'firebase/auth';
import { useAtom } from 'jotai';
import { userAtom } from '../store/auth';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [user] = useAtom(userAtom);

  useEffect(() => {
    if (!user) return;

    const auth = getAuth();
    auth.currentUser?.getIdToken().then((token) => {
      socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
        auth: { token },
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const joinTaskRoom = useCallback((taskId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('joinTaskRoom', { taskId });
    }
  }, []);

  const leaveTaskRoom = useCallback((taskId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveTaskRoom', { taskId });
    }
  }, []);

  const joinChannel = useCallback((channel: string) => {
    if (socketRef.current) {
      socketRef.current.emit('joinChannel', { channel });
    }
  }, []);

  const leaveChannel = useCallback((channel: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveChannel', { channel });
    }
  }, []);

  const onTaskUpdate = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('taskUpdated', callback);
    }
  }, []);

  const onNewMessage = useCallback((callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('newMessage', callback);
    }
  }, []);

  return {
    joinTaskRoom,
    leaveTaskRoom,
    joinChannel,
    leaveChannel,
    onTaskUpdate,
    onNewMessage,
  };
};
