import Image from "next/image";
import jamIcon from "@/public/jam.png";
import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="flex bg-white rounded-xl shadow w-full justify-between flex-col xl:flex-row">
            <div className="flex flex-col gap-2 xl:gap-4 items-center xl:flex-row">
                <div className="flex p-4">
                    <Image className='animate-wiggle' height={40} width={40} src={jamIcon} alt='jam'></Image>
                    <h1 className='pr-2 text-2xl xl:text-5xl font-bold text-gray-700'>WordJam</h1>
                </div>
                <Link href="/"
                      className="h-full font-bold px-4 flex items-center text-xl xl:text-3xl hover:bg-gray-100 p-1 xl:p-4">Play</Link>
                <Link href="/leaderboard"
                      className="h-full font-bold px-4 flex items-center text-xl xl:text-3xl hover:bg-gray-100 p-1 xl:p-4">Leaderboard</Link>
            </div>


            <div className='font-mono text-xl font-bold h-full flex flex-col justify-center p-4 xl:text-right text-center'>
                <h1 className="text-purple-500 ">BETA VERSION</h1>
                <h2 className='text-sm font-normal'>Ending the 10th of May, 8pm CEST</h2>
            </div>

        </nav>
    )
}
