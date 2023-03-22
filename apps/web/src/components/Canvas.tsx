import { useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { BoardLetter, Pan } from '../types/board';

function drawGrid(ctx: CanvasRenderingContext2D, pan: Pan) {
  ctx.beginPath();
  ctx.strokeStyle = 'lightgrey';
  ctx.lineWidth = 1;
  for (let i = 0; i < 100; i++) {
    ctx.moveTo(i * pan.scale + pan.offset.x + 1, 0 + pan.offset.y + 1);
    ctx.lineTo(i * pan.scale + pan.offset.x + 1, 1000 * pan.scale + pan.offset.y + 1);
    ctx.moveTo(0 + pan.offset.x + 1, i * pan.scale + pan.offset.y + 1);
    ctx.lineTo(1000 * pan.scale + pan.offset.x + 1, i * pan.scale + pan.offset.y + 1);
  }
  ctx.stroke();
}

function drawOrigin(ctx: CanvasRenderingContext2D, pan: Pan) {
  // circle on origin
  ctx.beginPath();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  ctx.arc(pan.offset.x + pan.scale, pan.offset.y + pan.scale, 10, 0, 2 * Math.PI);
  ctx.stroke();
}

export default function Canvas({
  placedLetters,
  pan,
  setPan,
}: {
  placedLetters: BoardLetter[];
  pan: Pan;
  setPan: (pan: Pan) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [width, height] = useWindowSize();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, pan);
    drawOrigin(ctx, pan);
  }, [height, pan, width]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      width={width}
      className='h-full w-full'
      onMouseDown={(e) => {
        setDragStart({ x: e.clientX, y: e.clientY });
        setIsDragging(true);
      }}
      onMouseUp={() => {
        setIsDragging(false);
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          setPan({
            ...pan,
            offset: {
              x: pan.offset.x + e.clientX - dragStart.x,
              y: pan.offset.y + e.clientY - dragStart.y,
            },
          });
          setDragStart({ x: e.clientX, y: e.clientY });
        }
      }}
      onWheel={(e) => {
        setPan({
          ...pan,
          scale: Math.max(Math.min(pan.scale * (1 + -e.deltaY / 1000), 400), 20),
        });
      }}
    ></canvas>
  );
}
