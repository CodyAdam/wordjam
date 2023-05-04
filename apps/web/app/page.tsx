'use client';
import {useSocket} from '@/src/hooks/useSocket';
import {useCallback, useEffect, useState} from 'react';
import {AppState} from '@/src/lib/AppState';
import {HIGHLIGHT_FADE_DURATION, SOCKET_URL, TILE_SIZE} from '@/src/lib/constants';
import UserUI from '@/src/components/UserUI';
import Login from '@/src/components/Login/Login';
import Canvas from '@/src/components/Canvas';
import {useCursor} from '@/src/hooks/useCursor';
import {BoardLetter, Direction, LoginResponseType, Player} from '@/src/types/api';
import {BoardLetters, Highlight, InventoryLetter} from '@/src/types/board';
import {Pan} from '@/src/types/canvas';
import {toPlaceWord} from '@/src/utils/submitHelper';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import Confetti from 'react-confetti';
import {keyFromPos} from '@/src/utils/posHelper';
import {setUsername} from '@/src/utils/user';
import useWindowSize from '@/src/hooks/useWindowSize';
import {Draft} from "@/src/types/Draft";
import NavBar from "@/src/components/NavBar";

let cooldownInterval: string | number | NodeJS.Timeout | undefined = undefined;
let highlightInterval: string | number | NodeJS.Timeout | undefined = undefined;

export default function App() {
  // login related
  const [appStage, setAppStage] = useState(AppState.AwaitingLogin);

  const [placedLetters, setPlacedLetters] = useState<BoardLetters>(new Map());
  const [pan, setPan] = useState<Pan>({ offset: { x: 0, y: 0 }, scale: 50, origin: { x: 0, y: 0 } });
  const { cursorDirection, cursorPos, setCursorDirection, setCursorPos, goToNextCursorPos } = useCursor(placedLetters);
  const [cooldown, setCooldown] = useState(0);
  const [inventory, setInventory] = useState<InventoryLetter[]>([{ letter: 'A' }]);
  const [highlight, setHighlight] = useState<Highlight>(null);
  const [scores, setScores] = useState<Player[]>([]);
  const { width, height } = useWindowSize();

  const [draft, setDraft] = useState<Draft>({cursors: [], letters: []})

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
        switch (response) {
          case LoginResponseType.ALREADY_EXIST:
            toast.error(`This nickname already exists, please choose another one`);
            break;
          case LoginResponseType.WRONG_TOKEN:
            toast.error(`This login credential is invalid`);
            break;
          case LoginResponseType.SUCCESS:
            setAppStage(AppState.InGame);
            break;
        }
      },
      onScores: (scores: Player[]) => {
        scores.sort((a, b) => b.score - a.score);
        setScores(scores);
      },
      onInventory: (letters: string[]) => {
        setInventory(letters.map((letter) => ({ letter: letter })));
      },
      onError: (error: string) => {
        toast.error(error);
      },
      onConfetti: () => {
        resetConfetti();
      },
      onHighlight: (highlight: NonNullable<Highlight>) => {
        clearInterval(highlightInterval);
        setHighlight(highlight);
        highlightInterval = setTimeout(() => {
          setHighlight(null);
        }, HIGHLIGHT_FADE_DURATION);
      },
      onCooldown: (cooldown: number) => {
        clearInterval(cooldownInterval);
        cooldown = Math.ceil(cooldown);
        setCooldown(cooldown);
        cooldownInterval = setInterval(() => {
          if (cooldown > 0) setCooldown((c) => c - 1);
        }, 1000);
      },
      onDraft: (draft: Draft) => {
        if(appStage != AppState.InGame)
          return
        setDraft(draft)
      },
      onUsername: (username: string) => {
        setUsername(username);
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

      // if pos is a board letter do nothing
      if (placedLetters.has(keyFromPos(cursorPos))) return;

      const newInventory = [...inventory];

      // if pos is a inventory letter, replaced it
      newInventory.map((letter) => {
        if (letter.position && letter.position.x === cursorPos.x && letter.position.y === cursorPos.y) {
          letter.position = undefined;
        }
      });
      newInventory[index] = { ...newInventory[index], position: cursorPos };
      setInventory(newInventory);
      goToNextCursorPos();
    },
    [cursorPos, goToNextCursorPos, inventory, placedLetters],
  );

  const removeInventoryLetterAt = useCallback(
    (pos: { x: number; y: number }) => {
      const newInventory = [...inventory];
      newInventory.map((letter) => {
        if (letter.position && letter.position.x === pos.x && letter.position.y === pos.y) {
          letter.position = undefined;
        }
      });
      setInventory(newInventory);
    },
    [inventory],
  );

  const onResetInventoryPlacement = useCallback(() => {
    setInventory((inv) => inv.map((letter) => ({ ...letter, position: undefined })));
  }, []);

  const onSubmit = useCallback(() => {
    try {
      const placeWord = toPlaceWord(inventory, placedLetters);
      const token = localStorage.getItem('token');
      socket.emit('onSubmit', { submittedLetters: placeWord, token: token });
    } catch (error) {
      error instanceof Error && toast.error(error.message);
    }
  }, [inventory, placedLetters, socket]);

  const onLogout = useCallback(() => {
    setAppStage(AppState.AwaitingLogin);
    localStorage.removeItem('token');
  }, []);

  const onCenter = useCallback(() => {
    if (!width || !height) return;
    // set pan to center of board
    const newPan: Pan = {
      ...pan,
      offset: {
        x: width / 2 - (TILE_SIZE * 5) / 2,
        y: height / 2 - (TILE_SIZE * 5) / 2,
      },
    };
    setPan(newPan);
  }, [height, pan, width]);

  const [isConfetti, setIsConfetti] = useState(true);

  function resetConfetti() {
    setIsConfetti(true);
  }

  useEffect(() => {
    if (!window || appStage !== AppState.InGame) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cursorPos) return;
      // enter key to submit
      if (e.key === 'Enter') {
        onSubmit();
        return;
      } else {
        let done = false;
        const key = e.key.toLowerCase();
        inventory.forEach((letter, index) => {
          if (done) return;
          const lower = letter.letter.toLowerCase();
          if (letter.position === undefined && lower === key) {
            placeInventoryLetter(index);
            done = true;
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [appStage, cursorPos, inventory, onSubmit, placeInventoryLetter]);

  setTimeout(() => {
    if(appStage != AppState.InGame)
      return

    let draft: Draft = {
      letters: [],
      cursors: []
    }

    if(cursorPos)
    draft.cursors.push({
      position: cursorPos,
      direction: (cursorDirection) ? Direction.RIGHT : Direction.DOWN
    })

    inventory.forEach(i => {
      if(i.position)
        draft.letters.push(i.position)
    })

    socket.emit('onDraft', {token: localStorage.getItem('token'), draft: draft})
  }, 5*1000)

  function onMoveLetter(from: number, to: number) {
    const newInventory = [...inventory];
    // do not swap, only move
    const letter = newInventory.splice(from, 1)[0];
    newInventory.splice(to, 0, letter);
    setInventory(newInventory);
  }

  if (appStage === AppState.AwaitingLogin)
    return (
      <div className="relative h-full overflow-hidden">
        <div className="absolute flex h-full w-full flex-col bg-black/20 backdrop-blur-sm p-6 gap-4">
          <NavBar></NavBar>
          <Login socket={socket} isConnected={isConnected} />
        </div>

        <Canvas
            placedLetters={placedLetters}
            pan={pan}
            setPan={(p) => setPan(p)}
            inventory={inventory}
            cursorPos={cursorPos}
            setCursorPos={setCursorPos}
            highlight={highlight}
            cursorDirection={cursorDirection}
            setCursorDirection={setCursorDirection}
            draft={draft}
        />

        <ToastContainer
          position='top-center'
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          limit={3}
          pauseOnFocusLoss
          pauseOnHover={false}
          draggable
          theme='light'
        />
      </div>
    );

  if (appStage === AppState.InGame)
    return (
      <div className="relative flex h-full items-center justify-center overflow-hidden">
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
          <div className='pointer-events-none absolute left-0 right-0 top-3 z-30 flex select-none flex-col items-center justify-center font-mono text-xl font-bold'>
            <h1>BETA VERSION</h1>
            <h2 className='text-sm font-normal'>Ending the 10th of May, 8pm CEST</h2>
          </div>
          <Canvas
            placedLetters={placedLetters}
            pan={pan}
            setPan={(p) => setPan(p)}
            highlight={highlight}
            inventory={inventory}
            cursorPos={cursorPos}
            draft={draft}
            setCursorPos={(pos) => {
              if (pos) removeInventoryLetterAt(pos);
              setCursorPos(pos);
            }}
            cursorDirection={cursorDirection}
            setCursorDirection={setCursorDirection}
          />
        </main>
        <UserUI
          onReplace={onMoveLetter}
          inventory={inventory}
          onPlace={placeInventoryLetter}
          onReset={onResetInventoryPlacement}
          onSubmit={onSubmit}
          onLogout={onLogout}
          cooldown={cooldown}
          onCenter={onCenter}
          scores={scores}
          onLetterButton={() => {
            const token = localStorage.getItem('token');
            socket.emit('onReplaceAllLetters', token);
          }}
        />
        <ToastContainer
          position='top-center'
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          limit={3}
          pauseOnFocusLoss
          pauseOnHover={false}
          draggable
          theme='light'
        />
      </div>
    );

  return null;
}
