'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import {
  DRAG_TRESHOLD,
  SCROLL_MAX_TILE_SIZE,
  SCROLL_MIN_TILE_SIZE,
  SCROLL_SPEED,
  TILE_SIZE,
  TOUCH_ZOOM_SENSITIVITY,
} from '../lib/constants';
import { distance, keyFromPos, posCentered, posFloor, screenToWorld, worldToScreen } from '../utils/posHelper';
import { BoardLetters, Highlight, InventoryLetter } from '../types/board';
import { Position } from '../types/api';
import { Pan } from '../types/canvas';
import {
  drawGrid,
  drawPlacedLetters,
  drawPlacedInventoryLetters,
  drawDarkenTile,
  drawCursor,
  drawDraft
} from '../utils/drawing';
import {Draft} from "@/src/types/Draft";

export default function Canvas({
  placedLetters = new Map(),
  pan = { offset: { x: 0, y: 0 }, scale: 50, origin: { x: 0, y: 0 } },
  setPan = () => {},
  inventory = [],
  cursorPos = null,
  setCursorPos = () => {},
  highlight = null,
  cursorDirection = true,
  setCursorDirection = () => {},
  draft = {letters: [], cursors: []},
    isInteractive = true,
}: {
  placedLetters?: BoardLetters;
  pan?: Pan;
  setPan?: (pan: Pan) => void;
  inventory?: InventoryLetter[];
  cursorPos?: Position | null;
  highlight?: null | Highlight;
  setCursorPos?: (cursor: Position | null) => void;
  cursorDirection?: boolean;
  setCursorDirection?: (direction: boolean) => void;
  draft?: Draft;
    isInteractive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverPos, setHoverPos] = useState<Position | null>(null);
  const [touchInitialDistance, setTouchInitialDistance] = useState<number>(0);
  const [isPinching, setIsPinching] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    // center on load
    if (!width || !height) return;

    // set pan to center of board
    const newPan: Pan = {
      ...pan,
      offset: {
        x: width / 2 - (TILE_SIZE * 5) / 2,
        y: height / 2 - (TILE_SIZE * 5) / 2,
      },
    };
    setPan(newPan);

    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    // Set display size (css pixels).
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, width, canvasRef]);

  function isFree(p: Position): boolean{
    if(inventory.find(i => i.position != null && i.position.x == p.x && i.position.y == p.y))
      return false

    if(cursorPos != null && cursorPos.x == p.x && cursorPos.y == p.y)
      return false

    let key = keyFromPos(p)
    if(placedLetters.has(key))
      return false

    return true
  }

  useEffect(() => {
    const ctx = canvasRef.current!.getContext('2d');
    if (!ctx || !width || !height) return;
    ctx.clearRect(0, 0, width, height);

    drawGrid(ctx, pan, width, height);

    let newDraft: Draft = {
      cursors: draft.cursors.filter(c => isFree(c.position)),
      letters: draft.letters.filter(c => isFree(c))
    }


    drawDraft(ctx, newDraft, pan)
    if (hoverPos) drawDarkenTile(ctx, posFloor(hoverPos), pan);
    drawPlacedLetters(ctx, placedLetters, pan, highlight);
    drawPlacedInventoryLetters(ctx, inventory, pan, highlight);

    if (cursorPos) {
      if (placedLetters.has(keyFromPos(cursorPos))) drawCursor(ctx, posCentered(cursorPos), cursorDirection, true, pan);
      else drawCursor(ctx, posCentered(cursorPos), cursorDirection, false, pan);
    }
  }, [height, pan, width, hoverPos, placedLetters, cursorPos, cursorDirection, inventory, highlight]);



  if (!isInteractive) return (
      <canvas
          ref={canvasRef}
          className='h-full w-full'
          height={height}
          width={width}></canvas>
  )

  return (
    <canvas
      ref={canvasRef}
      className='h-full w-full'
      height={height}
      width={width}
      onMouseDown={(e) => {
        const { clientX: x, clientY: y } = e;
        setDragStart({ x, y });
        setIsDown(true);
      }}
      onMouseUp={(e) => {
        const { clientX: x, clientY: y } = e;
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
      }}
      onMouseMove={(e) => {
        const { clientX: x, clientY: y } = e;

        if (isDown && distance(dragStart, { x, y }) > DRAG_TRESHOLD && !isDragging) setIsDragging(true);

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
      }}
      onMouseLeave={(e) => {
        setHoverPos(null);
        setIsDragging(false);
        setIsDown(false);
      }}
      onWheel={(e) => {
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
      }}
      onTouchStart={(event) => {
        if (event.touches.length === 2) {
          setTouchInitialDistance(
            Math.hypot(
              event.touches[0].pageX - event.touches[1].pageX,
              event.touches[0].pageY - event.touches[1].pageY,
            ),
          );
          setIsPinching(true);
        } else if (event.touches.length === 1) {
          const { pageX: x, pageY: y } = event.touches[0];
          setDragStart({ x, y });
          setIsDown(true);
        }
      }}
      onTouchMove={(event) => {
        if (event.touches.length === 2) {
          const { pageX: x, pageY: y } = event.touches[0];
          const currentDistance = Math.hypot(
            event.touches[0].pageX - event.touches[1].pageX,
            event.touches[0].pageY - event.touches[1].pageY,
          );

          const diff = currentDistance - touchInitialDistance;
          // use multiplier to scale the zoom TOUCH_ZOOM_SENSITIVITY
          const newScale = Math.max(
            Math.min(pan.scale + diff * TOUCH_ZOOM_SENSITIVITY, SCROLL_MAX_TILE_SIZE),
            SCROLL_MIN_TILE_SIZE,
          );

          const before = worldToScreen(screenToWorld({ x, y }, pan), { ...pan, scale: newScale });
          const after = { x, y };
          const newPan = {
            ...pan,
            scale: newScale,
            offset: {
              x: pan.offset.x - (before.x - after.x),
              y: pan.offset.y - (before.y - after.y),
            },
          };

          if (isDown && distance(dragStart, { x, y }) > DRAG_TRESHOLD && !isDragging) setIsDragging(true);

          if (isDragging) {
            newPan.offset = {
              x: newPan.offset.x + x - dragStart.x,
              y: newPan.offset.y + y - dragStart.y,
            };
            setDragStart({ x, y });
          } else {
            setHoverPos(screenToWorld({ x, y }, pan));
          }
          setPan(newPan);
          setTouchInitialDistance(currentDistance);
        } else if (event.touches.length === 1) {
          if (isPinching) return;
          const { pageX: x, pageY: y } = event.touches[0];

          if (isDown && distance(dragStart, { x, y }) > DRAG_TRESHOLD && !isDragging) setIsDragging(true);

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
        }
      }}
      onTouchEnd={(event) => {
        if (event.touches.length === 0) {
          setIsDragging(false);
          setIsPinching(false);
          setIsDown(false);
        }
      }}
    ></canvas>
  );
}
