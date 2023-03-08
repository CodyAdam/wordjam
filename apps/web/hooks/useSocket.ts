"use client";

import * as io from 'socket.io-client';
import { useState, useEffect } from 'react';

/**
 * This hook is used to connect to a socket server
 * @param url the url of the socket server
 * @param callback a callback function that is called when the socket is connected
 */
const useSocket = (url: string, callback?: (socket: io.Socket) => void) => {
  const [socket, setSocket] = useState<io.Socket | null>(null);
  useEffect(() => {
    console.log('Connecting to socket server at', url);
    if (socket) {
      socket.disconnect();
    }
    const s = io.io(url, {
      autoConnect: true,  
    });
    s.on('connect', () => {
      console.log('%cConnected to socket!', 'color: lightgreen');
      setSocket(s);
    });
    s.on('disconnect', () => {
      console.log('%cDisconnected from socket, trying to reconnect...', 'color: red');
      setSocket(null);
    });
    if (callback) callback(s);
    s.onAny((event, ...args) => {
      console.log(`incoming event '${event}':`, args);
    });

    // This is called when the component is unmounted
    return () => {
      if (s) s.disconnect();
    };
  }, [callback, socket, url]);

  return socket;
};

export default useSocket;
