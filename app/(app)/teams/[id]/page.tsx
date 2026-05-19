import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { computeStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";
import { deleteTeam } from "@/actions/team";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      tournaments: {
        include: {
          tournament: {
            include: {
              matches: true,
              teams: { include: { team: true } },
            },
          },
        },
        orderBy: { tournament: { season: "desc" } },
      },
    },
  });
  if (!team) notFound();

  const history = team.tournaments.map((tt) => {
    const t = tt.tournament;
    const settings = parseTournamentSettings(t.settings);
    const teams = t.teams.map((e) => ({ teamId: e.teamId, teamName: e.team.name }));
    const matches: MatchRow[] = t.matches.map((m) => ({
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      stage: m.stage as "GROUP" | "KNOCKOUT",
      round: m.round,
      status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED",
    }));
    const standings = computeStandings(matches, teams, settings);
    const position = standings.findIndex((s) => s.teamId === id) + 1;
    const standing = standings.find((s) => s.teamId === id);
    return { tournament: t, position: position || null, standing };
  });

  const deleteAction = deleteTeam.bind(null, id);

  return (
    <>
      <PageHeader
        title={team.name}
        action={
          <div className="flex gap-2">
            <Link href={`/teams/${id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <form action={deleteAction}>
              <Button variant="danger" type="submit">Delete</Button>
            </form>
          </div>
        }
      />

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Tournament History</h2>
          {history.length === 0 ? (
            <p className="text-gray-400 text-sm">Not enrolled in any tournaments yet.</p>
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
