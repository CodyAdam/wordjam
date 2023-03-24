'use client';

export function LetterButton({
  letter,
  onClick,
  disabled,
}: {
  letter: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className='group cursor-pointer select-none disabled:opacity-50' onClick={onClick} disabled={disabled}>
      <div className='flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 pb-8 text-5xl font-bold text-zinc-700 transition-all duration-75 group-hover:-translate-y-4 group-hover:scale-105 group-hover:shadow-lg'>
        <div className='flex h-20 w-20 items-center justify-center rounded-lg border-2 border-slate-100 bg-white p-2'>
          {letter}
        </div>
      </div>
    </button>
  );
}
