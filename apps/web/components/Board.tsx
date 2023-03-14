'use client';

import { useEffect } from 'react';
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch';

const mapWidth = 1000;
const mapHeight = 1000;
const tileSize = 20;
const offsetX = 400;
const offsetY = 400;
export default function Board(props: {}) {
  const { instance, ...rest } = useControls();
  instance.onChangeCallbacks.add((state) => {
    document.documentElement.style.setProperty('--size', state.instance.transformState.scale * tileSize + 'px');
    document.documentElement.style.setProperty('--off-x', state.instance.transformState.positionX + 'px');
    document.documentElement.style.setProperty('--off-y', state.instance.transformState.positionY + 'px');
  });

  const col = 20;
  const row = 20;

  const cells = [];
  for (let i = 0; i < col; i++) {
    for (let j = 0; j < row; j++) {
      cells.push(
        <div
          className='absolute z-10 p-1'
          style={{
            top: i * tileSize + offsetY,
            left: j * tileSize + offsetX,
            height: tileSize,
            width: tileSize,
          }}
          key={i + ' - ' + j}
        >
          <div className='h-full w-full cursor-pointer bg-red-500 text-[.3rem] hover:bg-slate-300'>{i + '-' + j}</div>
        </div>,
      );
    }
  }

  return (
    <div
      className='relative h-full w-full ring-1 ring-slate-600'
      style={
        {
          height: mapWidth,
          width: mapHeight,
        } as React.CSSProperties
      }
    >
      {cells}
    </div>
  );
}
