import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { io, ManagerOptions, SocketOptions } from 'socket.io-client';

const SOCKET_OPTION: Partial<ManagerOptions & SocketOptions> = {
  autoConnect: false,
};

export function useSocket(
  url: string,
  options?: {
    events?: {
      [key: string]: (data: any) => void;
    };
    onAny?: (event: string, data: any) => void;
  },
) {
  const [socket, setSocket] = useState(io(url, SOCKET_OPTION));
  const [isConnected, setIsConnected] = useState(socket.connected);
  useEffect(() => {
    function onConnect() {
      console.log('Connected to server');
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('Disconnected from server');
      toast.error("You have been disconnected from the server.\nWe'll be back soon !");
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (!socket.connected) socket.connect();
    if (options?.events) {
      Object.entries(options.events).forEach(([event, callback]) => {
        socket.on(event, callback);
      });
    }
    if (options?.onAny) {
      socket.onAny(options.onAny);
    }
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      if (options?.events) {
        Object.entries(options.events).forEach(([event, callback]) => {
          socket.off(event, callback);
        });
      }
      if (options?.onAny) {
        socket.offAny(options.onAny);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return { socket, isConnected };
}
