'use client';
import Board from '@/components/Board';
import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

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
      <div className='flex h-full flex-col items-center justify-center'>
        <h1>Connecting to server...</h1>
      </div>
    );

  return (
    <main className='bg-grid flex h-full items-center justify-center bg-slate-100 [&>div]:h-screen [&>div]:w-screen'>
      <TransformWrapper centerOnInit initialScale={3}>
        <TransformComponent>
          <Board />
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}
