'use client';
import Board from '@/src/components/Board';
import { useSocket } from '@/src/hooks/useSocket';
import { BoardLetter, Pan } from '@/src/types/board';
import { useEffect, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { AppState } from '@/src/lib/AppState';
import Login from '@/src/components/Login';
import { SOCKET_URL } from '@/src/lib/config';
import UserUI from '@/src/components/UserUI';

export default function App() {
  const [placedLetters, setPlacedLetters] = useState<BoardLetter[]>([]);
  const [appStage, setAppStage] = useState(AppState.AwaitingLogin);
  const [pan, setPan] = useState<Pan>({ offset: { x: 0, y: 0 }, scale: 1, origin: { x: 13, y: 13 } });
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
    <div className='h-full'>
      <main className='bg-grid relative flex h-full bg-white [&>div]:h-screen [&>div]:w-screen'>
        <TransformWrapper centerOnInit initialScale={3}>
          <TransformComponent>
            <Board placedLetters={placedLetters} pan={pan} setPan={(p)=> setPan(p)}/>
          </TransformComponent>
        </TransformWrapper>
        {/* <Login isConnected={isConnected} /> */}
      </main>
      <UserUI />
    </div>
  );
}
