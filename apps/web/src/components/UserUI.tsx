'use client';

import { useState } from 'react';
import { InventoryLetter } from '../types/board';
import { LetterButton } from './Letter';

export default function UserUI() {
  const [inventory, setInventory] = useState<InventoryLetter[]>([
    {
      letter: 'A',
    },
    {
      letter: 'B',
    },
    {
      letter: 'C',
    },
    {
      letter: 'D',
    },
    {
      letter: 'J',
    },
  ]);
  return (
    <div className='h-30 trasnform absolute left-[50%] bottom-6 flex w-fit -translate-x-1/2 flex-wrap justify-center gap-3'>
      {inventory.map((letter, i) => {
        return <LetterButton key={i} letter={letter.letter} />;
      })}
    </div>
  );
}
