'use client';

import { ReactElement } from 'react';
import { useControls } from 'react-zoom-pan-pinch';
import { BoardLetter } from '../types/board';
import Letter from './Letter';

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

  return (
    <div
      className='relative h-full w-full ring-1 ring-slate-600'
      style={
        {
          height: mapHeight,
          width: mapWidth,
        } as React.CSSProperties
      }
    >
      {props.placedLetters.map((letter) => (
        <Letter
          key={letter.position.x + '-' + letter.position.y}
          letter={letter.letter}
          position={letter.position}
          mapOffset={{ x: offsetX, y: offsetY }}
          tileSize={tileSize}
        />
      ))}
    </div>
  );
}
