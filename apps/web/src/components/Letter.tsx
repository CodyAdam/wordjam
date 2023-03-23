'use client';
import { TILE_SIZE } from '../lib/constants';
import { Position } from '../types/board';

export default function LetterBoard({
  letter,
  pos,
  origin,
  value,
}: {
  letter: string;
  pos: Position;
  origin: Position;
  value?: number;
}) {
  return (
    <div
      className='absolute z-10 p-[.1rem]'
      style={{
        left: (pos.x + origin.x) * TILE_SIZE,
        top: (pos.y + origin.y) * TILE_SIZE,
        height: TILE_SIZE,
        width: TILE_SIZE,
      }}
      key={pos.x + '-' + pos.y}
    >
      <div className='flex h-full w-full cursor-pointer select-none items-center justify-center rounded-sm text-base  font-bold text-zinc-700 hover:bg-slate-200 hover:text-zinc-900'>
        {letter}
      </div>
    </div>
  );
}

export function LetterButton({ letter }: { letter: string }) {
  return (
    <div className='group cursor-pointer select-none'>
      <div className='flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 pb-8 text-5xl font-bold text-zinc-700 transition-all duration-75 group-hover:-translate-y-4 group-hover:scale-105 group-hover:shadow-lg'>
        <div className='flex h-20 w-20 items-center justify-center rounded-lg border-2 border-slate-100 bg-white p-2'>
          {letter}
        </div>
      </div>
    </div>
  );
}
