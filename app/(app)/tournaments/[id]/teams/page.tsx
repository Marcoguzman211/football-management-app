import { notFound } from "next/navigation";
import Link from "next/link";
import { TOURNAMENTS, TOURNAMENT_TEAMS, TEAMS } from "@/lib/mock-data";

export default function TournamentTeamsPage({ params }: { params: { id: string } }) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const enrollments = TOURNAMENT_TEAMS.filter((tt) => tt.tournamentId === params.id).map((tt) => ({
    ...tt,
    team: TEAMS.find((t) => t.id === tt.teamId)!,
  }));

  const isGroupKnockout = tournament.format === "GROUP_KNOCKOUT";
  const settings = tournament.settings as Record<string, unknown>;
  const numGroups = (settings.numberOfGroups as number) ?? 2;
  const groupLabels = Array.from({ length: numGroups }, (_, i) => String.fromCharCode(65 + i));

  // Group by group name for GROUP_KNOCKOUT
  const byGroup = isGroupKnockout
    ? groupLabels.map((g) => ({
        label: g,
        teams: enrollments.filter((e) => e.groupName === g),
      }))
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Enrolled Teams</h2>
        <span className="text-sm text-gray-500">{enrollments.length} teams</span>
      </div>

      {isGroupKnockout && byGroup ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {byGroup.map(({ label, teams }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                <h3 className="text-sm font-semibold text-gray-700">Group {label}</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {teams.map((tt) => (
                  <li key={tt.teamId}>
                    <Link
                      href={`/teams/${tt.teamId}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                        🛡️
                      </div>
                      <span className="font-medium text-gray-900">{tt.team.name}</span>
                    </Link>
                  </li>
                ))}
                {teams.length === 0 && (
                  <li className="px-4 py-3 text-sm text-gray-400">No teams assigned</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {enrollments.map((tt) => (
              <li key={tt.teamId}>
                <Link
                  href={`/teams/${tt.teamId}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">
                    🛡️
                  </div>
                  <span className="font-medium text-gray-900">{tt.team.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
