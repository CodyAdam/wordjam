'use client';
import { useSocket } from '@/src/hooks/useSocket';
import { useCallback, useState } from 'react';
import { AppState } from '@/src/lib/AppState';
import { SOCKET_URL } from '@/src/lib/constants';
import UserUI from '@/src/components/UserUI';
import Login from '@/src/components/Login';
import Canvas from '@/src/components/Canvas';
import { useCursor } from '@/src/hooks/useCursor';
import { keyFromPos } from '@/src/utils/posHelper';
import LinkDeviceButton from '@/src/components/LinkDeviceButton';
import TokenModal from '@/src/components/TokenModal';
import { BoardLetter, LoginResponseType } from '@/src/types/api';
import { BoardLetters, InventoryLetter } from '@/src/types/board';
import { Pan } from '@/src/types/canvas';
import { toPlaceWord } from '@/src/utils/submitHelper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Confetti from 'react-confetti';
import useWindowSize from '@/src/hooks/useWindowSize';

export default function App() {
  // login related
  const [appStage, setAppStage] = useState(AppState.AwaitingLogin);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [placedLetters, setPlacedLetters] = useState<BoardLetters>(new Map());
  const [pan, setPan] = useState<Pan>({ offset: { x: 0, y: 0 }, scale: 100, origin: { x: 0, y: 0 } });
  const { cursorDirection, cursorPos, setCursorDirection, setCursorPos, goToNextCursorPos } = useCursor(placedLetters);
  const [inventory, setInventory] = useState<InventoryLetter[]>([{ letter: 'A' }]);
  const { isConnected, socket } = useSocket(SOCKET_URL, {
    events: {
      onBoard: (letters: BoardLetter[]) => {
        const newPlacedLetters: BoardLetters = new Map();
        letters.forEach((letter) => {
          newPlacedLetters.set(keyFromPos(letter.position), letter);
        });
        setPlacedLetters(newPlacedLetters);
      },
      onToken: (token) => {
        localStorage.setItem('token', token);
      },
      onLoginResponse: (response: LoginResponseType) => {
        if (response === LoginResponseType.SUCCESS) setAppStage(AppState.InGame);
      },
      onInventory: (letters: string[]) => {
        setInventory(letters.map((letter) => ({ letter: letter })));
      },
      onError: (error: string) => {
        toast.error(error);
      },
      connect: () => {
        const token = localStorage.getItem('token');
        if (token) {
          socket.emit('onLogin', token);
        }
      },
    },
    onAny: (event, data) => {
      console.info(event, data);
    },
  });

  const placeInventoryLetter = useCallback(
    (index: number) => {
      if (!cursorPos) return;
      const newInventory = [...inventory];
      newInventory[index] = { ...newInventory[index], position: cursorPos };
      setInventory(newInventory);
      goToNextCursorPos();
    },
    [cursorPos, goToNextCursorPos, inventory],
  );

  const onResetInventoryPlacement = useCallback(() => {
    setInventory((inv) => inv.map((letter) => ({ ...letter, position: undefined })));
  }, []);

  const onSubmit = useCallback(() => {
    try {
      const placeWord = toPlaceWord(inventory);
      const token = localStorage.getItem('token');
      socket.emit('onSubmit', { submittedLetters: placeWord, token: token });
    } catch (error) {
      error instanceof Error && toast.error(error.message);
    }
  }, [inventory, socket]);

  const onLogout = useCallback(() => {
    setAppStage(AppState.AwaitingLogin);
    localStorage.removeItem('token');
  }, []);

  const [isConfetti, setIsConfetti] = useState(true);

  function resetConfetti() {
    setIsConfetti(true);
  }

  if (appStage === AppState.AwaitingLogin)
    return (
      <>
        <main className='relative flex h-full bg-gray-100'>
          <Canvas
            placedLetters={placedLetters}
            pan={pan}
            setPan={(p) => setPan(p)}
            inventory={inventory}
            cursorPos={cursorPos}
            setCursorPos={setCursorPos}
            cursorDirection={cursorDirection}
            setCursorDirection={setCursorDirection}
          />
          <Login socket={socket} isConnected={isConnected} />
        </main>
      </>
    );

  if (appStage === AppState.InGame)
    return (
      <>
        {isConfetti && (
          <Confetti
            gravity={0.1}
            initialVelocityX={2}
            initialVelocityY={5}
            recycle={false}
            onConfettiComplete={() => setIsConfetti(false)}
          />
        )}

        <main className='relative flex h-full bg-gray-100'>
          <Canvas
            placedLetters={placedLetters}
            pan={pan}
            setPan={(p) => setPan(p)}
            inventory={inventory}
            cursorPos={cursorPos}
            setCursorPos={setCursorPos}
            cursorDirection={cursorDirection}
            setCursorDirection={setCursorDirection}
          />
          {showTokenModal && <TokenModal onClick={() => setShowTokenModal(false)} />}
          <div className='absolute top-0 right-0 p-2'>
            <LinkDeviceButton onClick={() => setShowTokenModal(true)}></LinkDeviceButton>
          </div>
        </main>
        <UserUI
          inventory={inventory}
          onPlace={placeInventoryLetter}
          onReset={onResetInventoryPlacement}
          onSubmit={onSubmit}
        />
        <button
          className='absolute bottom-0 left-0 m-3 rounded-md bg-purple-200 p-3 text-purple-800 '
          onClick={() => onLogout()}
        >
          (Debug) Logout
        </button>
        <button
          className='absolute bottom-20 left-0 m-3 rounded-md bg-purple-200 p-3 text-purple-800 '
          onClick={() => {
            const token = localStorage.getItem('token');
            socket.emit('onAskLetter', token);
          }}
        >
          Ask letter
        </button>
        <button
          className='absolute bottom-0 left-48 m-3 rounded-md bg-purple-200 p-3 text-purple-800 '
          onClick={resetConfetti}
        >
          Reset confetti (Debug)
        </button>
        <ToastContainer
          position='bottom-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
        />
      </>
    );

  return null;
}
