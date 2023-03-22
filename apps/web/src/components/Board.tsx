'use client';

import { MouseEventHandler, ReactElement, ReactEventHandler, useCallback, useState } from 'react';
import { useControls } from 'react-zoom-pan-pinch';
import { BoardLetter, InventoryLetter } from '../types/board';
import LetterBoard from './Letter';

const mapWidth = 1000;
const mapHeight = 1000;
const tileSize = 20;
const offsetX = 400;
const offsetY = 400;

export default function Board(props: { placedLetters: BoardLetter[] }) {
  const { instance, ...rest } = useControls();
  instance.onChangeCallbacks.add((state) => {
    document.documentElement.style.setProperty('--size', state.instance.transformState.scale * tileSize + 'px');
    document.documentElement.style.setProperty('--off-x', state.instance.transformState.positionX + 'px');
    document.documentElement.style.setProperty('--off-y', state.instance.transformState.positionY + 'px');
  });
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const pos = { x: e.clientX, y: e.clientY };
    console.log('move', pos);
  }, []);

  return (
    <div
      className='relative h-full w-full ring-1 ring-slate-600'
      onClick={onMove}
      onMouseMove={onMove}
      style={
        {
          height: mapHeight,
          width: mapWidth,
        } as React.CSSProperties
      }
    >
      {props.placedLetters.map((letter) => (
        <LetterBoard
          key={letter.position.x + '-' + letter.position.y}
          letter={letter.letter}
          position={letter.position}
          mapOffset={{ x: offsetX, y: offsetY }}
          tileSize={tileSize}
        />
      ))}
      <LetterBoard
        key={'djwaidjowai '}
        letter={'00'}
        position={{ x: 0, y: 0 }}
        mapOffset={{ x: offsetX, y: offsetY }}
        tileSize={tileSize}
      />
    </div>
  );
}
