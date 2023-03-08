'use client';
import Canvas from '@/components/Canvas';
import { useState } from 'react';

const SOCKET_URL = 'wss://localhost:8080';

export default function Home() {
  const [socket, setSocket] = useState(new WebSocket(SOCKET_URL));

  return (
    <main>
        <Canvas />
    </main>
  );
}
