import { Position } from '../types/board';

export default function LetterBoard(props: {
  letter: string;
  position: Position;
  mapOffset: Position;
  tileSize: number;
  value?: number;
}) {
  const { letter, position, mapOffset, tileSize, value } = props;
  const x = position.x;
  const y = position.y;
  const content = letter;
  const offsetX = mapOffset.x;
  const offsetY = mapOffset.y;
  return (
    <div
      className='absolute z-10 p-[.1rem]'
      style={{
        left: x * tileSize + offsetX,
        top: y * tileSize + offsetY,
        height: tileSize,
        width: tileSize,
      }}
      key={x + '-' + y}
    >
      <div className='flex h-full w-full cursor-pointer select-none items-center justify-center rounded-sm text-base  font-bold text-zinc-700 hover:bg-slate-200 hover:text-zinc-900'>
        {content}
      </div>
    </div>
  );
}

export function LetterButton({ letter }: { letter: string }) {
  return (
    <div className='flex h-20 w-20 cursor-pointer select-none items-center justify-center rounded-lg border-2 bg-white p-2 border-b-8 text-5xl font-bold text-zinc-700 transition-all hover:-translate-y-3 hover:text-zinc-900 hover:shadow-md duration-75'>
      {letter}
    </div>
  );
}
