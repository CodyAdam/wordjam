'use client';
import Board from '@/components/Board';
import { io } from 'socket.io-client';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const SOCKET_URL = 'ws://localhost:8080';

export default function Home() {
  const socket = io(SOCKET_URL);

  if (socket.connected)
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
