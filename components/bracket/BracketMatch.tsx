interface BracketMatchProps {
  homeTeamName: string | null;
  awayTeamName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  homeTeamId: string | null;
  isScheduled?: boolean;
}

export function BracketMatch({
  homeTeamName,
  awayTeamName,
  homeScore,
  awayScore,
  winnerId,
  homeTeamId,
  isScheduled,
}: BracketMatchProps) {
  const homeWon = winnerId !== null && winnerId === homeTeamId;
  const awayWon = winnerId !== null && winnerId !== homeTeamId;
  const isPlayed = homeScore !== null && awayScore !== null;

  return (
    <div className="w-56 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden text-sm">
      {/* Home team */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 border-b border-gray-100 ${
          homeWon ? "bg-green-50" : ""
        }`}
      >
        <span
          className={`truncate flex-1 ${
            homeWon ? "font-semibold text-green-700" : "text-gray-700"
          } ${!homeTeamName ? "text-gray-300 italic" : ""}`}
        >
          {homeTeamName ?? "TBD"}
        </span>
        <span
          className={`ml-3 font-bold tabular-nums min-w-[1.5rem] text-right ${
            homeWon ? "text-green-700" : isPlayed ? "text-gray-900" : "text-gray-300"
          }`}
        >
          {isPlayed ? homeScore : "–"}
        </span>
      </div>
      {/* Away team */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 ${
          awayWon ? "bg-green-50" : ""
        }`}
      >
        <span
          className={`truncate flex-1 ${
            awayWon ? "font-semibold text-green-700" : "text-gray-700"
          } ${!awayTeamName ? "text-gray-300 italic" : ""}`}
        >
          {awayTeamName ?? "TBD"}
        </span>
        <span
          className={`ml-3 font-bold tabular-nums min-w-[1.5rem] text-right ${
            awayWon ? "text-green-700" : isPlayed ? "text-gray-900" : "text-gray-300"
          }`}
        >
          {isPlayed ? awayScore : "–"}
        </span>
      </div>
      {/* Status bar */}
      {isScheduled && (
        <div className="px-3 py-1 bg-gray-50 border-t border-gray-100">
          <span className="text-xs text-gray-400">Upcoming</span>
        </div>
      )}
    </div>
  );
}
