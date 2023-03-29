'use client';
import { useSocket } from '@/src/hooks/useSocket';
import { BoardLetter, BoardLetters, InventoryLetter, Pan, Position } from '@/src/types/board';
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

export default function App() {
  const [placedLetters, setPlacedLetters] = useState<BoardLetters>(new Map());
  const [appStage, setAppStage] = useState(AppState.AwaitingLogin);

  const [playerToken, setPlayerToken] = useState('');
  const [pan, setPan] = useState<Pan>({ offset: { x: 0, y: 0 }, scale: 20, origin: { x: 0, y: 0 } });
  const { cursorDirection, cursorPos, setCursorDirection, setCursorPos, goToNextCursorPos } = useCursor(placedLetters);
  const [inventory, setInventory] = useState<InventoryLetter[]>([
    { letter: 'A' },
    { letter: 'R' },
    { letter: 'T' },
    { letter: 'H' },
    { letter: 'U' },
    { letter: 'R' },
    {
      letter: 'X',
      position: { x: 5, y: 5 },
    },
  ]);
  const { isConnected, socket } = useSocket(SOCKET_URL, {
    events: {
      board: (data) => {
        const letters: BoardLetter[] = JSON.parse(data);
        const newPlacedLetters: BoardLetters = new Map();
        letters.forEach((letter) => {
          newPlacedLetters.set(keyFromPos(letter.position), letter);
        });
        setPlacedLetters(newPlacedLetters);
      },
    },
    onAny: (event, data) => {
      // console.info(event, data);
    },
  });

  const [showTokenModal, setShowTokenModal] = useState(false);
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
    console.log('submitting');
  }, []);

  const onLogin = useCallback((token: string) => {
    if (!token) {
      token = localStorage.getItem('token') || '';
    }
    setPlayerToken(token);
    // store the token in local storage
    localStorage.setItem('token', token);
    setAppStage(AppState.InGame);
  }, []);

  return (
    <>
      <main className='relative flex h-full bg-white'>
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

        {showTokenModal && <TokenModal value={playerToken} onClick={() => setShowTokenModal(false)} />}

        {appStage === AppState.InGame && (
          <div className='absolute top-0 right-0 p-2'>
            <LinkDeviceButton onClick={() => setShowTokenModal(true)}></LinkDeviceButton>
          </div>
        )}

        {appStage === AppState.AwaitingLogin && <Login onLogin={onLogin} socket={socket} isConnected={isConnected} />}
      </main>
      {appStage === AppState.InGame && (
        <UserUI
          inventory={inventory}
          onPlace={placeInventoryLetter}
          onReset={onResetInventoryPlacement}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}
