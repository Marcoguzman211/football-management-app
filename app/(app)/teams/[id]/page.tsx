import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TEAMS,
  tournamentsByTeam,
  matchesByTournament,
  enrollmentsByTournament,
} from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { computeStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  const team = TEAMS.find((t) => t.id === params.id);
  if (!team) notFound();

  const history = tournamentsByTeam(team.id).map(({ tournament: t, groupName }) => {
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
    return { tournament: t, groupName, position: position || null, standing };
  });

  return (
    <>
      <PageHeader
        title={team.name}
        action={
          <div className="flex gap-2">
            <Link href={`/teams/${team.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Tournament History</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">No tournaments found.</p>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200" aria-label={`${team.name} history`}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tournament</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Season</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Format</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Pos</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">W</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">D</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">L</th>
                    <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {history.map(({ tournament: t, position, standing }) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/tournaments/${t.id}`} className="font-medium text-blue-600 hover:underline">
                          {t.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.season}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{t.format}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-700">{position ?? "–"}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-700">{standing?.won ?? "–"}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-700">{standing?.drawn ?? "–"}</td>
                      <td className="px-3 py-3 text-center text-sm text-gray-700">{standing?.lost ?? "–"}</td>
                      <td className="px-3 py-3 text-center text-sm font-bold text-gray-900">{standing?.points ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
