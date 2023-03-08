import { useEffect, useRef, useState } from 'react';

type Offset = {
  zoom: number;
  x: number;
  y: number;
};

function drawGrid(ctx: CanvasRenderingContext2D, offset: Offset) {
  ctx.beginPath();
  ctx.strokeStyle = 'lightgrey';
  ctx.lineWidth = 1;
  for (let i = 0; i < 100; i++) {
    const size = 100 * offset.zoom;
    ctx.moveTo(i * size + offset.x, 0 + offset.y);
    ctx.lineTo(i * size + offset.x, 1000 + offset.y);
    ctx.moveTo(0 + offset.x, i * size + offset.y);
    ctx.lineTo(1000 + offset.x, i * size + offset.y);
  }
  ctx.stroke();
}

export default function Canvas(props: {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState<Offset>({ zoom: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log('offset', offset);
  }, [offset]);
    

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, offset);
  }, [offset]);

  return (
    <canvas
      ref={canvasRef}
      className='border h-full w-full'
      onMouseDown={(e) => {
        setDragStart({ x: e.clientX, y: e.clientY });
        setIsDragging(true);
      }}
      onMouseUp={() => {
        setIsDragging(false);
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          setOffset((prev) => ({
            zoom: prev.zoom,
            x: prev.x + (e.clientX - dragStart.x),
            y: prev.y + (e.clientY - dragStart.y),
          }));
          setDragStart({ x: e.clientX, y: e.clientY });
        }
      }}
      onWheel={(e) => {
        e.preventDefault();
        setOffset((prev) => ({
          zoom: prev.zoom + e.deltaY * 0.01,
          x: prev.x,
          y: prev.y,
        }));
      }}
    ></canvas>
  );
}
