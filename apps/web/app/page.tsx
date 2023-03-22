'use client';
import Board from '@/src/components/Board';
import { useSocket } from '@/src/hooks/useSocket';
import { BoardLetter } from '@/src/types/board';
import { useEffect, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { AppState } from '@/src/lib/AppState';
import Login from '@/src/components/Login';
import { SOCKET_URL } from '@/src/lib/config';
import LinkDeviceButton from "@/src/components/LinkDeviceButton";

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

  const [showTokenModal, setShowTokenModal] = useState(false);


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
    <main className='bg-grid flex h-full items-center justify-center bg-white relative'>
      <div className="[&>div]:h-screen [&>div]:w-screen ">
        <TransformWrapper centerOnInit initialScale={3}>
          <TransformComponent>
            <Board placedLetters={placedLetters} />
          </TransformComponent>
        </TransformWrapper>



      </div>

      {showTokenModal && (
        <div className="absolute p-2 bg-black/20 backdrop-blur-sm w-full h-full z-20 flex justify-center items-center">
          <div className="rounded-lg bg-white p-10 shadow space-y-4">
            <div className="text-xl font-bold">Your token</div>
            <input disabled value={playerToken} className='focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-700 shadow focus:outline-none'></input>
            <button className='w-full rounded-md bg-green-400 p-2 text-xl font-bold text-white transition-colors hover:bg-green-500'>
              Done
            </button>

          </div>

        </div>
      )}


      {appStage === AppState.InGame && (
        <div className="absolute top-0 right-0 p-2">
          <LinkDeviceButton></LinkDeviceButton>
        </div>
      )}

      {appStage === AppState.AwaitingLogin && <Login onLogin={onLogin} socket={socket} isConnected={isConnected} />}

    </main>
  );
}
