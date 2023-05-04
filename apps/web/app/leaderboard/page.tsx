export default function LeaderboardPage() {

    const dummyData = new Array(200).fill(0).map((_, i) => {
        return {
            rank: i + 1,
            name: `Player ${i + 1}`,
            score: 100,
            founder: Math.random() > 0.5,
        }

    })


    return <div className="grow h-full p-10 bg-white rounded-xl shadow overflow-y-scroll">
        <table className="w-full">
            <thead>
                <tr>
                    <th className="text-left p-2">Rank</th>
                    <th className="text-left p-2">Player</th>
                    <th className="text-left p-2">Score</th>
                </tr>
            </thead>
            <tbody>
            {dummyData.map((d, i) => (
                    <tr key={d.name} className="border-b-2 border-t-2 border-white">
                        <td className="bg-gray-100 p-2">#{d.rank}</td>
                        <td className="bg-gray-100 p-2">
                            <span className="uppercase font-bold">{d.name}</span>
                            {d.founder && <span className="ml-2 bg-red-500 rounded-full text-xs px-2 inline-flex items-center justify-center text-white">Founder 👑</span>}
                        </td>
                        <td className="bg-gray-100 p-2">{d.score}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}
