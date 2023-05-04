export default function LoginHeader({children}: { children: any }) {
    return (
        <>
            <h1 className="pr-2 text-3xl font-bold text-gray-700">{children}</h1>
            <p className='-mt-3 text-gray-300'>A multiplayer word game</p></>

    )
}
