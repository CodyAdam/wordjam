'use client';
import Board from '@/src/components/Board';
import { useSocket } from '@/src/hooks/useSocket';
import { BoardLetter } from '@/src/types/board';
import { useEffect, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { AppState } from '@/src/lib/AppState';
import Login from '@/src/components/Login';
import { SOCKET_URL } from '@/src/lib/config';

export default function App() {
  const [placedLetters, setPlacedLetters] = useState<BoardLetter[]>([]);

  const [appStage, setAppStage] = useState(AppState.AwaitingLogin);
  const { isConnected } = useSocket(SOCKET_URL, {
    events: {
      board: (data) => {
        setPlacedLetters(JSON.parse(data));
      },
    },
    onAny: (event, data) => {
      console.info(event, data);
    },
  });

  return (
    <main className='bg-grid flex h-full items-center justify-center bg-white [&>div]:h-screen [&>div]:w-screen'>
      <TransformWrapper centerOnInit initialScale={3}>
        <TransformComponent>
          <Board placedLetters={placedLetters} />
        </TransformComponent>
      </TransformWrapper>
      <Login isConnected={isConnected} />
    </main>
  );
}
