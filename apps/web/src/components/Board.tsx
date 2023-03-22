'use client';

import { MouseEventHandler, ReactElement, ReactEventHandler, useCallback, useState } from 'react';
import { useControls } from 'react-zoom-pan-pinch';
import { TILE_SIZE } from '../lib/constants';
import { posFloor, screenToWorld } from '../utils/posHelper';
import { BoardLetter, InventoryLetter, Pan, Position } from '../types/board';
import LetterBoard from './Letter';

const mapWidth = 1000;
const mapHeight = 1000;

export default function Board({
  placedLetters,
  pan,
  setPan,
}: {
  placedLetters: BoardLetter[];
  pan: Pan;
  setPan: (pan: Pan) => void;
}) {
  const { instance, ...rest } = useControls();
  // Update pan state on pan
  instance.onChangeCallbacks.add((state) => {
    const newPan = {
      ...pan,
      offset: { x: state.instance.transformState.positionX, y: state.instance.transformState.positionY },
      scale: state.instance.transformState.scale * TILE_SIZE,
    };
    document.documentElement.style.setProperty('--size', newPan.scale + 'px');
    document.documentElement.style.setProperty('--off-x', newPan.offset.x + 'px');
    document.documentElement.style.setProperty('--off-y', newPan.offset.y + 'px');
    setPan(newPan);
  });

  const [hoverPos, setHoverPos] = useState<Position | null>(null);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const pos = { x: e.clientX, y: e.clientY };
      setHoverPos(posFloor(screenToWorld(pos, pan)));
    },
    [pan],
  );

  return (
    <div
      className='relative h-full w-full ring-1 ring-slate-600'
      onClick={onMove}
      onMouseMove={onMove}
      onMouseLeave={() => setHoverPos(null)}
      style={
        {
          height: mapHeight,
          width: mapWidth,
        } as React.CSSProperties
      }
    >
      {placedLetters.map((letter) => (
        <LetterBoard
          key={letter.position.x + '-' + letter.position.y}
          letter={letter.letter}
          pos={letter.position}
          origin={pan.origin}
        />
      ))}
      {hoverPos && <LetterBoard key={'selector'} letter={'>'} pos={hoverPos} origin={{ x: 0, y: 0 }} />}
    </div>
  );
}
