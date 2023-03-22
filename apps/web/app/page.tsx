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

  const [playerToken, setPlayerToken] = useState("");
  const { isConnected, socket } = useSocket(SOCKET_URL, {
    events: {
      board: (data) => {
        setPlacedLetters(JSON.parse(data));
      },
    },
    onAny: (event, data) => {
      // console.info(event, data);
    },
  });


  function onLogin(token: string) {
    if (!token) {
      token = localStorage.getItem("token") || "";
    }
    setPlayerToken(token);
    // store the token in local storage
    localStorage.setItem("token", token);
    setAppStage(AppState.InGame);
  }

  return (
    <main className='bg-grid flex h-full items-center justify-center bg-white [&>div]:h-screen [&>div]:w-screen relative'>
      <TransformWrapper centerOnInit initialScale={3}>
        <TransformComponent>
          <Board placedLetters={placedLetters} />
        </TransformComponent>
      </TransformWrapper>
      {appStage === AppState.AwaitingLogin && <Login onLogin={onLogin} socket={socket} isConnected={isConnected} />}
    </main>
  );
}
