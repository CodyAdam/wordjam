import { useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { SCROLL_SPEED, TILE_SIZE } from '../lib/constants';
import { posCeil, posCentered, posFloor, screenToWorld, worldToScreen } from '../utils/posHelper';
import { BoardLetter, Pan, Position } from '../types/board';

function drawGrid(ctx: CanvasRenderingContext2D, pan: Pan, width: number, height: number) {
  ctx.beginPath();
  ctx.strokeStyle = 'lightgrey';
  ctx.lineWidth = 1;
  // vertical lines
  TILE_SIZE;
  const minTopLeft = posFloor(screenToWorld({ x: -1, y: -1 }, pan));
  const maxBottomRight = posCeil(screenToWorld({ x: width + 1, y: height + 1 }, pan));
  for (let x = minTopLeft.x; x <= maxBottomRight.x; x++) {
    const pos = worldToScreen({ x, y: minTopLeft.y }, pan);
    ctx.moveTo(pos.x, pos.y);
    const pos2 = worldToScreen({ x, y: maxBottomRight.y }, pan);
    ctx.lineTo(pos2.x, pos2.y);
  }
  // horizontal lines
  for (let y = minTopLeft.y; y <= maxBottomRight.y; y++) {
    const pos = worldToScreen({ x: minTopLeft.x, y }, pan);
    ctx.moveTo(pos.x, pos.y);
    const pos2 = worldToScreen({ x: maxBottomRight.x, y }, pan);
    ctx.lineTo(pos2.x, pos2.y);
  }

  ctx.stroke();
}

function drawDebug(ctx: CanvasRenderingContext2D, pos: Position, text: string, color: string, pan: Pan) {
  // circle on origin
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  pos = worldToScreen(pos, pan);
  ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
  ctx.stroke();
  // text on origin
  ctx.font = '20px Arial';
  ctx.fillStyle = color;
  ctx.fillText(text, pos.x, pos.y - 20);
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
  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  const [width, height] = useWindowSize();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, pan, width, height);
    drawDebug(ctx, posCentered({ x: 0, y: 0 }), 'origin', 'red', pan);
    drawDebug(ctx, posCentered({ x: 10, y: 10 }), '10, 10', 'blue', pan);
    if (hoverPos) drawDebug(ctx, posCentered(posFloor(hoverPos)), 'cursor', 'green', pan);
  }, [height, pan, width, hoverPos]);

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
          setHoverPos(null);
        } else {
          setHoverPos(screenToWorld({ x: e.clientX, y: e.clientY }, pan));
        }
      }}
      onMouseLeave={() => {
        setHoverPos(null);
      }}
      onWheel={(e) => {
        let multiplier = 1;
        if (e.deltaY < 0) {
          multiplier += SCROLL_SPEED;
        } else {
          multiplier -= SCROLL_SPEED;
        }
        setPan({
          ...pan,
          scale: Math.max(Math.min(pan.scale * multiplier, 400), 10),
        });
      }}
    ></canvas>
  );
}
