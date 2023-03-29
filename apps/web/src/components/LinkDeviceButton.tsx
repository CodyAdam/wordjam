import Image from "next/image";

type LinkDeviceButtonProps = {
  onClick: () => void;
}

export default function LinkDeviceButton({ onClick }: LinkDeviceButtonProps) {
  return (
    <>
    <button onClick={onClick} className='w-full rounded-md bg-green-400 p-2 text-xl font-bold text-white transition-colors hover:bg-green-500 flex gap-2 items-center'>
      <Image height={20} width={20} src="/smartphone.png" alt="phone"></Image>
      <span>Link a device</span>
      </button>
    </>
  )
}
