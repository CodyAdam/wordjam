"use client";
import Board from "@/src/components/Board";
import { useSocket } from "@/src/hooks/useSocket";
import { BoardLetter } from "@/src/types/board";
import { useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { AppState } from "@/src/lib/AppState";
import Login from "@/src/components/Login";
import { SOCKET_URL } from "@/src/lib/config";
import LinkDeviceButton from "@/src/components/LinkDeviceButton";
import TokenModal from "@/src/components/TokenModal";

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
    <main className="bg-grid relative flex h-full items-center justify-center bg-white">
      <div className="[&>div]:h-screen [&>div]:w-screen ">
        <TransformWrapper centerOnInit initialScale={3}>
          <TransformComponent>
            <Board placedLetters={placedLetters} />
          </TransformComponent>
        </TransformWrapper>
      </div>

      {showTokenModal && (
        <TokenModal
          value={playerToken}
          onClick={() => setShowTokenModal(false)}
        />
      )}

      {appStage === AppState.InGame && (
        <div className="absolute top-0 right-0 p-2">
          <LinkDeviceButton
            onClick={() => setShowTokenModal(true)}
          ></LinkDeviceButton>
        </div>
      )}

      {appStage === AppState.AwaitingLogin && (
        <Login onLogin={onLogin} socket={socket} isConnected={isConnected} />
      )}
    </main>
  );
}
