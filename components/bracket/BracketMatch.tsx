interface BracketMatchProps {
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  homeTeamId: string | null;
}

export function BracketMatch({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  winnerId,
  homeTeamId,
}: BracketMatchProps) {
  const homeWon = winnerId === homeTeamId;
  const awayWon = winnerId !== null && winnerId !== homeTeamId;
  const isPlayed = homeScore !== null && awayScore !== null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden w-52">
      <div className={`flex items-center justify-between px-3 py-2 border-b border-gray-100 ${homeWon ? "bg-green-50" : ""}`}>
        <span className={`text-sm truncate ${homeWon ? "font-semibold text-green-700" : "text-gray-700"}`}>
          {homeTeamName ?? "TBD"}
        </span>
        <span className={`text-sm font-bold ml-2 ${homeWon ? "text-green-700" : "text-gray-900"}`}>
          {isPlayed ? homeScore : "–"}
        </span>
      </div>
      <div className={`flex items-center justify-between px-3 py-2 ${awayWon ? "bg-green-50" : ""}`}>
        <span className={`text-sm truncate ${awayWon ? "font-semibold text-green-700" : "text-gray-700"}`}>
          {awayTeamName ?? "TBD"}
        </span>
        <span className={`text-sm font-bold ml-2 ${awayWon ? "text-green-700" : "text-gray-900"}`}>
          {isPlayed ? awayScore : "–"}
        </span>
      </div>
    </div>
  );
}
