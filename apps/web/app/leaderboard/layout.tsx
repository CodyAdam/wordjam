import Canvas from "@/src/components/Canvas";
import NavBar from "@/src/components/NavBar";

export default function LeaderboardLayout({children}: any) {
    return <div className="relative  h-full  overflow-hidden">
        <div className="absolute flex h-full w-full flex-col bg-black/20 backdrop-blur-sm p-6 gap-4">
            <NavBar></NavBar>
            {children}
        </div>
        <Canvas isInteractive={false}></Canvas>
    </div>
}
