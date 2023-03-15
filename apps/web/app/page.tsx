'use client';
import Board from '@/components/Board';
import { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { AppState } from "@/lib/AppState";
import Login from "@/components/Login/Login";
import { SOCKET_URL } from "@/lib/config";



export default function Home() {
  const { sendMessage, sendJsonMessage, lastMessage, lastJsonMessage, readyState, getWebSocket } =
    useWebSocket(SOCKET_URL, {share: true});

  const [appStage, setAppStage] = useState(AppState.AwaitingLogin);

  useEffect(() => {
    if (lastMessage) {
      console.log('lastMessage', lastMessage);
    }
  }, [lastMessage]);


  return <Login></Login>

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
