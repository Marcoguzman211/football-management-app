import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TEAMS,
  tournamentsByTeam,
  matchesByTournament,
  enrollmentsByTournament,
} from "@/lib/mock-data";
import { computeStandings, parseTournamentSettings } from "@/lib/tournament";
import { Badge } from "@/components/ui/Badge";
import type { MatchRow } from "@/lib/tournament";

const FORMAT_LABELS: Record<string, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  GROUP_KNOCKOUT: "Group + Knockout",
};

const STATUS_VARIANTS: Record<string, "success" | "info" | "default"> = {
  FINISHED: "success",
  ACTIVE: "info",
  DRAFT: "default",
};

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = TEAMS.find((t) => t.id === id);
  if (!team) notFound();

  const history = tournamentsByTeam(team.id).map(({ tournament: t }) => {
    const settings = parseTournamentSettings(t.settings);
    const rawMatches = matchesByTournament(t.id);
    const enrollments = enrollmentsByTournament(t.id);
    const teamList = enrollments.map((e) => ({
      teamId: e.teamId,
      teamName: TEAMS.find((tm) => tm.id === e.teamId)?.name ?? e.teamId,
    }));
    const groupMatches: MatchRow[] = rawMatches
      .filter((m) => m.stage === "GROUP")
      .map((m) => ({ ...m, status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED" }));
    const standings = computeStandings(groupMatches, teamList, settings);
    const position = standings.findIndex((s) => s.teamId === team.id) + 1;
    const standing = standings.find((s) => s.teamId === team.id);
    return { tournament: t, position: position || null, standing };
  });

  // Aggregate stats across all tournaments (group stage only)
  const aggregate = history.reduce(
    (acc, { standing }) => {
      if (!standing) return acc;
      return {
        played: acc.played + standing.played,
        won: acc.won + standing.won,
        drawn: acc.drawn + standing.drawn,
        lost: acc.lost + standing.lost,
        goalsFor: acc.goalsFor + standing.goalsFor,
        goalsAgainst: acc.goalsAgainst + standing.goalsAgainst,
        points: acc.points + standing.points,
      };
    },
    { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
  );

  return (
    <div>
      {/* Back */}
      <Link
        href="/teams"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Teams
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
            🛡️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-500">{history.length} tournament{history.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Link
          href={`/teams/${team.id}/edit`}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Aggregate stats */}
      {aggregate.played > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Matches", value: aggregate.played },
            { label: "Wins", value: aggregate.won },
            { label: "Draws", value: aggregate.drawn },
            { label: "Losses", value: aggregate.lost },
            { label: "Goals scored", value: aggregate.goalsFor },
            { label: "Goals conceded", value: aggregate.goalsAgainst },
            { label: "Goal diff", value: aggregate.goalsFor - aggregate.goalsAgainst, prefix: aggregate.goalsFor - aggregate.goalsAgainst > 0 ? "+" : "" },
            { label: "Total points", value: aggregate.points },
          ].map(({ label, value, prefix }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{prefix}{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tournament history */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Tournament History</h2>
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Not enrolled in any tournaments yet.</p>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200" aria-label={`${team.name} history`}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tournament</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Season</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">Format</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">Status</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Pos</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">W</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">D</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">L</th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {history.map(({ tournament: t, position, standing }) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/tournaments/${t.id}`} className="font-medium text-blue-600 hover:underline">
                        {t.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.season}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                      {FORMAT_LABELS[t.format] ?? t.format}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={STATUS_VARIANTS[t.status] ?? "default"}>
                        {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-center text-sm font-medium text-gray-700">
                      {position ? `#${position}` : "–"}
                    </td>
                    <td className="px-3 py-3 text-center text-sm text-gray-700 hidden sm:table-cell">{standing?.won ?? "–"}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-700 hidden sm:table-cell">{standing?.drawn ?? "–"}</td>
                    <td className="px-3 py-3 text-center text-sm text-gray-700 hidden sm:table-cell">{standing?.lost ?? "–"}</td>
                    <td className="px-3 py-3 text-center text-sm font-bold text-gray-900">{standing?.points ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
