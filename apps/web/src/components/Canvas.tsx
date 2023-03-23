import { useCallback, useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { SCROLL_MAX_TILE_SIZE, SCROLL_MIN_TILE_SIZE, SCROLL_SPEED, TILE_SIZE } from '../lib/constants';
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

function drawPlacedLetters(ctx: CanvasRenderingContext2D, placedLetters: BoardLetter[], pan: Pan) {
  placedLetters.forEach((letter) => {
    const pos = worldToScreen(posCentered(letter.position), pan);
    ctx.fillStyle = 'black';
    // use scaled font size
    const fontSize = pan.scale * TILE_SIZE * 0.025;
    ctx.font = `${fontSize}px Arial`;
    const letterOffset = pan.scale * TILE_SIZE * 0.01;
    ctx.fillText(letter.letter, pos.x - letterOffset, pos.y + letterOffset);
  });
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
    drawPlacedLetters(ctx, placedLetters, pan);
  }, [height, pan, width, hoverPos, placedLetters]);

  const onDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    let x = 0;
    let y = 0;
    e.preventDefault();
    e.stopPropagation();
    if (e.nativeEvent instanceof TouchEvent) {
      x = e.nativeEvent.touches[0].clientX;
      y = e.nativeEvent.touches[0].clientY;
    } else if (e.nativeEvent instanceof MouseEvent) {
      x = e.nativeEvent.clientX;
      y = e.nativeEvent.clientY;
    } else {
      return;
    }
    setDragStart({ x, y });
    setIsDragging(true);
  }, []);

  const onUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      let x = 0;
      let y = 0;
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent instanceof TouchEvent) {
        x = e.nativeEvent.touches[0].clientX;
        y = e.nativeEvent.touches[0].clientY;
      } else if (e.nativeEvent instanceof MouseEvent) {
        x = e.nativeEvent.clientX;
        y = e.nativeEvent.clientY;
      } else {
        return;
      }

      if (isDragging) {
        setPan({
          ...pan,
          offset: {
            x: pan.offset.x + x - dragStart.x,
            y: pan.offset.y + y - dragStart.y,
          },
        });
        setDragStart({ x, y });
      } else {
        setHoverPos(screenToWorld({ x, y }, pan));
      }
    },
    [dragStart, isDragging, pan, setHoverPos, setPan],
  );

  const onLeave = useCallback(() => {
    setHoverPos(null);
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      let multiplier = 1;
      if (e.deltaY < 0) {
        multiplier += SCROLL_SPEED;
      } else {
        multiplier -= SCROLL_SPEED;
      }
      const x = e.clientX;
      const y = e.clientY;
      const newScale = Math.max(Math.min(pan.scale * multiplier, SCROLL_MAX_TILE_SIZE), SCROLL_MIN_TILE_SIZE);
      const before = worldToScreen(screenToWorld({ x, y }, pan), { ...pan, scale: newScale });
      const after = { x, y };
      setPan({
        ...pan,
        scale: newScale,
        offset: {
          x: pan.offset.x - (before.x - after.x),
          y: pan.offset.y - (before.y - after.y),
        },
      });
    },
    [pan, setPan],
  );

  return (
    <canvas
      ref={canvasRef}
      className='h-full w-full'
      height={height}
      width={width}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onWheel={onWheel}
      onTouchStart={onDown}
      onTouchEnd={onUp}
      onTouchMove={onMove}
    ></canvas>
  );
}
