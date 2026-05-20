import { notFound } from "next/navigation";
import { TOURNAMENTS, TOURNAMENT_TEAMS, TEAMS } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/PageHeader";

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

  return (
    <>
      <PageHeader
        title={`Teams — ${tournament.name}`}
        subtitle={`${enrollments.length} enrolled`}
      />

      <section>
        <ul className="space-y-2">
          {enrollments.map((tt) => (
            <li
              key={tt.teamId}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <span className="font-medium text-gray-900">{tt.team.name}</span>
              {isGroupKnockout && tt.groupName && (
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700">
                  Group {tt.groupName}
                </span>
              )}
            </li>
          ))}
        </ul>

        {isGroupKnockout && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {groupLabels.map((g) => {
              const count = enrollments.filter((tt) => tt.groupName === g).length;
              return (
                <div key={g} className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
                  <span className="font-medium">Group {g}:</span>{" "}
                  <span className="text-gray-600">{count} team{count !== 1 ? "s" : ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
