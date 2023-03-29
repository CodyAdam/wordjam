'use client';

import { useState } from 'react';
import { InventoryLetter } from '../types/board';
import { LetterButton } from './Letter';

export default function UserUI({
  inventory,
  onPlace,
  onReset,
  onSubmit,
}: {
  inventory: InventoryLetter[];
  onPlace: (index: number) => void;
  onReset: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className='h-30 trasnform absolute left-[50%] bottom-6 flex w-fit -translate-x-1/2 flex-wrap justify-center gap-3'>
      {inventory.map((letter, i) => {
        return <LetterButton key={i} letter={letter.letter} onClick={() => onPlace(i)} disabled={letter.position != undefined} />;
      })}
      <button
        className='flex h-20 items-center justify-center rounded-lg bg-red-100 pb-8 text-5xl font-bold text-red-700 transition-all duration-75 hover:-translate-y-4 hover:scale-105 hover:shadow-lg p-7'
        onClick={onReset}
      >
        Reset
      </button>
      <button
        className='flex h-20 items-center justify-center rounded-lg bg-blue-100 pb-8 text-5xl font-bold text-blue-700 transition-all duration-75 hover:-translate-y-4 hover:scale-105 hover:shadow-lg p-7'
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  );
}
