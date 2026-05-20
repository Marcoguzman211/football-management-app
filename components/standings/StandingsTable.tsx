import type { TeamStanding } from "@/lib/tournament/types";

interface StandingsTableProps {
  standings: TeamStanding[];
  highlightTop?: number;
  caption?: string;
}

export function StandingsTable({ standings, highlightTop, caption }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200" aria-label={caption ?? "Standings"}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-8">#</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Team</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-10">P</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-10">W</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-10">D</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-10">L</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-12">GF</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-12">GA</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 w-12">GD</th>
            <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-900 font-bold w-12">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {standings.map((s, i) => {
            const isHighlighted = highlightTop !== undefined && i < highlightTop;
            return (
              <tr key={s.teamId} className={isHighlighted ? "bg-green-50" : ""}>
                <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.teamName}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">{s.played}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">{s.won}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">{s.drawn}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">{s.lost}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">{s.goalsFor}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">{s.goalsAgainst}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td className="px-3 py-3 text-center text-sm font-bold text-gray-900">{s.points}</td>
              </tr>
            );
          })}
          {standings.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-400">
                No matches played yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
