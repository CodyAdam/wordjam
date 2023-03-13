'use client';
import Canvas from '@/components/Canvas';
import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const SOCKET_URL = 'ws://localhost:8080';

export default function Home() {
  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } =
    useWebSocket(SOCKET_URL);

    useEffect(() => {
      if (lastMessage) {
        console.log('lastMessage', lastMessage);
      }
    }, [lastMessage]);

  if (readyState !== ReadyState.OPEN)
    return (
      <div className='flex flex-col justify-center items-center h-full'>
        <h1>Connecting to server...</h1>
      </div>
    );

  return (
    <main>
      <Canvas />
    </main>
  );
}
