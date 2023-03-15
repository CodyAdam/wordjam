import { Position } from '../types/board';

export default function Letter(props: {
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
      <div className='flex h-full w-full cursor-pointer items-center justify-center rounded-sm text-base text-[.3rem] font-bold text-zinc-700 hover:bg-slate-200 hover:text-zinc-900'>
        {content}
      </div>
    </div>
  );
}
