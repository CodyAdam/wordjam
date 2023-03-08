"use client";

import Canvas from '@/components/Canvas';
// import useSocket from '@/hooks/useSocket';

const SOCKET_URL = 'http://localhost:8080';

export default function Home() {
    // const socket = useSocket(SOCKET_URL);
    return (
        <main>
            {/* <div>Is connected : {JSON.stringify(socket?.connected)}</div> */}
            <Canvas />
        </main>
    )
}
