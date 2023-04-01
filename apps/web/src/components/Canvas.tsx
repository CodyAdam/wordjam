'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { SCROLL_MAX_TILE_SIZE, SCROLL_MIN_TILE_SIZE, SCROLL_SPEED, TILE_SIZE } from '../lib/constants';
import { posCeil, posCentered, posFloor, screenToWorld, worldToScreen } from '../utils/posHelper';
import {  BoardLetters, InventoryLetter } from '../types/board';
import { useCursor } from '../hooks/useCursor';
import { Position } from '../types/api';
import { Pan } from '../types/canvas';

export default function Canvas({
  placedLetters,
  pan,
  setPan,
  inventory,
  cursorPos,
  setCursorPos,
  cursorDirection,
  setCursorDirection,
}: {
  placedLetters: BoardLetters;
  pan: Pan;
  setPan: (pan: Pan) => void;
  inventory: InventoryLetter[];
  cursorPos: Position | null;
  setCursorPos: (cursor: Position | null) => void;
  cursorDirection: boolean;
  setCursorDirection: (direction: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverPos, setHoverPos] = useState<Position | null>(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !width || !height) return;
    ctx.clearRect(0, 0, width, height);

    drawGrid(ctx, pan, width, height);
    drawPlacedLetters(ctx, placedLetters, pan);
    drawPlacedInventoryLetters(ctx, inventory, pan);

    // DEBUG
    drawDebug(ctx, posCentered({ x: 0, y: 0 }), 'origin', 'red', pan);
    drawDebug(ctx, posCentered({ x: 10, y: 10 }), '10, 10', 'blue', pan);
    if (hoverPos) drawDebug(ctx, posCentered(posFloor(hoverPos)), 'hover', '#00ff0055', pan);
    if (cursorPos) drawDebug(ctx, posCentered(cursorPos), cursorDirection ? '>' : 'v', 'purple', pan);
  }, [height, pan, width, hoverPos, placedLetters, cursorPos, cursorDirection, inventory]);

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
    setIsDown(true);
  }, []);

  const onUp = useCallback(
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
      if (!isDragging) {
        const pos = posFloor(screenToWorld({ x, y }, pan));
        if (pos.x === cursorPos?.x && pos.y === cursorPos?.y) {
          setCursorDirection(!cursorDirection);
        } else {
          setCursorPos(pos);
          setCursorDirection(!e.shiftKey);
        }
      } else {
        setIsDragging(false);
      }
      setIsDown(false);
    },
    [cursorDirection, cursorPos?.x, cursorPos?.y, isDragging, pan, setCursorDirection, setCursorPos],
  );

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

      if (isDown) {
        setIsDragging(true);
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
    [dragStart.x, dragStart.y, isDown, pan, setPan],
  );

  const onLeave = useCallback(() => {
    setHoverPos(null);
    setIsDragging(false);
    setIsDown(false);
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

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const scrollX = e.currentTarget.scrollLeft;
      const scrollY = e.currentTarget.scrollTop;

      const newOffset : Position= {
        x: pan.offset.x + scrollX,
        y: pan.offset.y + scrollY,
      }

      setPan({
        ...pan,
        offset: newOffset,
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
      onScroll={onScroll}
      onTouchStart={onDown}
      onTouchEnd={onUp}
      onTouchMove={onMove}
      onTouchCancel={onLeave}
    ></canvas>
  );
}

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

function drawPlacedLetters(ctx: CanvasRenderingContext2D, placedLetters: BoardLetters, pan: Pan) {
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

function drawPlacedInventoryLetters(ctx: CanvasRenderingContext2D, placedLetters: InventoryLetter[], pan: Pan) {
  placedLetters.forEach((letter) => {
    if (!letter.position) return;
    const pos = worldToScreen(posCentered(letter.position), pan);
    ctx.fillStyle = 'black';
    // use scaled font size
    const fontSize = pan.scale * TILE_SIZE * 0.025;
    ctx.font = `${fontSize}px Arial`;
    const letterOffset = pan.scale * TILE_SIZE * 0.01;
    ctx.fillText(letter.letter, pos.x - letterOffset, pos.y + letterOffset);
  });
}
