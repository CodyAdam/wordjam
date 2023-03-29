import { useCallback, useEffect, useState } from 'react';
import { BoardLetters, Position } from '../types/board';
import { keyFromPos } from '../utils/posHelper';

function getNextCurPos(pos: Position, direction: boolean) {
  return {
    x: direction ? pos.x + 1 : pos.x,
    y: direction ? pos.y : pos.y + 1,
  };
}

function getPrevCurPos(pos: Position, direction: boolean) {
  return {
    x: direction ? pos.x - 1 : pos.x,
    y: direction ? pos.y : pos.y - 1,
  };
}

function getCursorPosWithOffset(pos: Position, offset: Position) {
  return {
    x: pos.x + offset.x,
    y: pos.y + offset.y,
  };
}

export function useCursor(placedLetters: BoardLetters) {
  const [cursorPos, setCursorPos] = useState<Position | null>(null);
  const [cursorDirection, setCursorDirection] = useState<boolean>(true); // true = right, false = down

  const goToNextCursorPos = useCallback(() => {
    if (!cursorPos) return;
    let newCursorPos: Position = getNextCurPos(cursorPos, cursorDirection);
    while (placedLetters.has(keyFromPos(newCursorPos))) {
      newCursorPos = getNextCurPos(newCursorPos, cursorDirection);
    }
    setCursorPos(newCursorPos);
  }, [cursorPos, cursorDirection, placedLetters]);

  const goToPrevCursorPos = useCallback(() => {
    if (!cursorPos) return;
    let newCursorPos: Position = getPrevCurPos(cursorPos, cursorDirection);
    while (placedLetters.has(keyFromPos(newCursorPos))) {
      newCursorPos = getPrevCurPos(newCursorPos, cursorDirection);
    }
    setCursorPos(newCursorPos);
  }, [cursorPos, cursorDirection, placedLetters]);

  useEffect(() => {
    if (!window) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cursorPos) return;
      if (e.key === 'ArrowRight') setCursorPos(getCursorPosWithOffset(cursorPos, { x: 1, y: 0 }));
      if (e.key === 'ArrowLeft') setCursorPos(getCursorPosWithOffset(cursorPos, { x: -1, y: 0 }));
      if (e.key === 'ArrowUp') setCursorPos(getCursorPosWithOffset(cursorPos, { x: 0, y: -1 }));
      if (e.key === 'ArrowDown') setCursorPos(getCursorPosWithOffset(cursorPos, { x: 0, y: 1 }));
      if (e.key === ' ') goToNextCursorPos();
      if (e.key === 'Backspace') goToPrevCursorPos();
      if (e.key === 'Tab' || e.key === 'Shift') setCursorDirection(!cursorDirection);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cursorDirection, cursorPos, goToNextCursorPos, goToPrevCursorPos]);

  return {
    cursorPos,
    setCursorPos,
    cursorDirection,
    setCursorDirection,
    goToNextCursorPos,
  };
}
