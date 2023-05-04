import Image from 'next/image';
import jamIcon from '@/public/jam.png';
import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className='text-slate relative shrink-0 h-fit mb-16 md:mb-0 flex w-full flex-col rounded-xl bg-white/80 text-gray-700 shadow backdrop-blur-lg md:flex-row'>
      <div className='flex shrink-0 flex-col items-center md:flex-row md:gap-4 xl:gap-4'>
        <div className='flex shrink-0 items-center gap-2 px-7 py-5 xl:px-10 xl:py-6'>
          <Image className='animate-wiggle' height={40} width={40} src={jamIcon} alt='jam'></Image>
          <h1 className='w-fit text-2xl font-bold text-gray-700 xl:text-5xl'>WordJam</h1>
        </div>
        <div className='flex min-h-[4rem] w-full items-center justify-center overflow-hidden md:rounded-none rounded-xl md:h-full'>
          <Link
            href='/'
            className='flex h-full w-full items-center justify-center p-1 px-4 md:px-8 text-xl hover:bg-gray-100 md:w-fit xl:px-10 xl:text-2xl xl:font-semibold'
          >
            Play
          </Link>
          <Link
            href='/leaderboard'
            className='flex h-full w-full items-center justify-center p-1 px-4 md:px-8 text-xl hover:bg-gray-100 md:w-fit xl:px-10 xl:text-2xl xl:font-semibold'
          >
            Leaderboard
          </Link>
        </div>
      </div>
      <div className='m-auto' />
      <div className='hidden h-full  shrink-0 flex-col justify-center p-4 text-center font-mono text-base font-bold md:flex md:text-right select-none pointer-events-none'>
        <h1 className='text-purple-500 '>BETA VERSION</h1>
        <h2 className='text-xs font-normal'>Ending the 10th of May, 8pm CEST</h2>
      </div>
      <div className='absolute bottom-0 left-0 right-0 h-full shrink-0  flex-col justify-center p-4 text-center font-mono text-base font-bold md:hidden md:text-right translate-y-full select-none pointer-events-none'>
        <h1 className='text-purple-500 '>BETA VERSION</h1>
        <h2 className='text-xs font-normal'>Ending the 10th of May, 8pm CEST</h2>
      </div>
    </nav>
  );
}
