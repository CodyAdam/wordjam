'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { SCROLL_MAX_TILE_SIZE, SCROLL_MIN_TILE_SIZE, SCROLL_SPEED, TILE_SIZE } from '../lib/constants';
import { posCeil, posCentered, posFloor, screenToWorld, worldToScreen } from '../utils/posHelper';
import { BoardLetters, InventoryLetter } from '../types/board';
import { Position } from '../types/api';
import { Pan } from '../types/canvas';
import { drawGrid, drawPlacedLetters, drawPlacedInventoryLetters, drawDebug } from '../utils/drawing';
import { getMousePos } from '../utils/touch';

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
    drawDebug(ctx, posCentered({ x: 5, y: 5 }), '5, 5', 'blue', pan);
    if (hoverPos) drawDebug(ctx, posCentered(posFloor(hoverPos)), 'hover', '#00ff0055', pan);
    if (cursorPos) drawDebug(ctx, posCentered(cursorPos), cursorDirection ? '>' : 'v', 'purple', pan);
  }, [height, pan, width, hoverPos, placedLetters, cursorPos, cursorDirection, inventory]);

  const onDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const mousePos = getMousePos(e);
    if (!mousePos) return;
    let { x, y } = mousePos;
    setDragStart({ x, y });
    setIsDown(true);
  }, []);

  const onUp = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const mousePos = getMousePos(e);
      if (!mousePos) return;
      let { x, y } = mousePos;
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
      const mousePos = getMousePos(e);
      if (!mousePos) return;
      let { x, y } = mousePos;
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

      const newOffset: Position = {
        x: pan.offset.x + scrollX,
        y: pan.offset.y + scrollY,
      };

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
