import Image from 'next/image';
import MaterialSymbolsFramePersonSharp from './svg/MaterialSymbolsFramePersonSharp';

type LinkDeviceButtonProps = {
  onClick: () => void;
};

export default function LinkDeviceButton({ onClick }: LinkDeviceButtonProps) {
  return (
    <>
      <button
        onClick={onClick}
        className='flex w-full items-center gap-2 rounded-md border-b-4 border-blue-400 bg-blue-100 px-4 py-2 text-xl font-bold text-blue-800 transition-colors hover:bg-blue-200'
      >
        <MaterialSymbolsFramePersonSharp className='h-6 w-6' />
        <span>Login credential</span>
      </button>
    </>
  );
}
