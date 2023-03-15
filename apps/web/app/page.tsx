'use client';
import Board from '@/src/components/Board';
import { useSocket } from '@/src/hooks/useSocket';
import { BoardLetter } from '@/src/types/board';
import { useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const URL = process.env.NODE_ENV === 'production' ? 'ws://localhost:8080' : 'ws://localhost:8080';

export default function App() {
  const [placedLetters, setPlacedLetters] = useState<BoardLetter[]>([]);
  const { isConnected } = useSocket(URL, {
    events: {
      board: (data) => {
        setPlacedLetters(JSON.parse(data));
      },
    },
    onAny: (event, data) => {
      console.info(event, data);
    },
  });

  if (!isConnected)
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <h1>Connecting to server...</h1>
      </div>
    );

  return (
    <main className='bg-grid flex h-full items-center justify-center bg-white [&>div]:h-screen [&>div]:w-screen'>
      <TransformWrapper centerOnInit initialScale={3}>
        <TransformComponent>
          <Board placedLetters={placedLetters} />
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}
