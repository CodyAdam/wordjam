export default async function LeaderboardPage() {

    const dummyData: {username: string, score: number}[] = await fetch("https://wordjam.fgdou.ovh/api/leaderboard?count=100").then(r => r.json());


    return <div className="grow h-full p-10 bg-white rounded-xl shadow overflow-y-scroll">
        <table className="w-full ">
            <thead>
            <tr>
                <th className="text-left p-2">Rank</th>
                <th className="text-left p-2">Player</th>
                <th className="text-left p-2">Score</th>
            </tr>
            </thead>
            <tbody>
            {dummyData.map((d, i) => (
              <tr key={d.username} className="border-b-2 border-t-2 border-white ">
                  <td className="bg-gray-100 p-2">#{i + 1}</td>
                  <td className="bg-gray-100 p-2">
                      <div className="uppercase font-bold truncate overflow-hidden max-w-xs">{d.username}</div>
                  </td>
                  <td className="bg-gray-100 p-2">{d.score}</td>
              </tr>
            ))}
            </tbody>
        </table>
    </div>
}
