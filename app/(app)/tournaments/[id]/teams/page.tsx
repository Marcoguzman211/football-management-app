import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { enrollTeam, removeTeam, updateEnrollmentGroup } from "@/actions/enrollment";

export default async function TournamentTeamsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { teams: { include: { team: true } } },
  });
  if (!tournament) notFound();

  const allTeams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const enrolledIds = new Set(tournament.teams.map((t) => t.teamId));
  const unenrolled = allTeams.filter((t) => !enrolledIds.has(t.id));

  const isGroupKnockout = tournament.format === "GROUP_KNOCKOUT";
  const settings = (tournament.settings ?? {}) as Record<string, unknown>;
  const numGroups = (settings.numberOfGroups as number) ?? 2;
  const groupLabels = Array.from({ length: numGroups }, (_, i) =>
    String.fromCharCode(65 + i)
  ); // A, B, C…

  return (
    <>
      <PageHeader
        title={`Teams — ${tournament.name}`}
        subtitle={`${tournament.teams.length} enrolled`}
      />

      {/* Enrolled teams */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Enrolled</h2>
        {tournament.teams.length === 0 ? (
          <p className="text-sm text-gray-400">No teams enrolled yet.</p>
        ) : (
          <ul className="space-y-2">
            {tournament.teams.map((tt) => {
              const removeAction = removeTeam.bind(null, id, tt.teamId);
              return (
                <li
                  key={tt.teamId}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="font-medium text-gray-900">{tt.team.name}</span>
                  <div className="flex items-center gap-3">
                    {isGroupKnockout && (
                      <form>
                        <input type="hidden" name="tournamentId" value={id} />
                        <input type="hidden" name="teamId" value={tt.teamId} />
                        <select
                          name="groupName"
                          defaultValue={tt.groupName ?? ""}
                          onChange={async () => {}}
                          className="rounded border border-gray-300 px-2 py-1 text-sm"
                          aria-label={`Group for ${tt.team.name}`}
                        >
                          <option value="">No group</option>
                          {groupLabels.map((g) => (
                            <option key={g} value={g}>
                              Group {g}
                            </option>
                          ))}
                        </select>
                      </form>
                    )}
                    <form action={removeAction}>
                      <Button variant="ghost" size="sm" type="submit">
                        Remove
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Group assignment (GROUP_KNOCKOUT) */}
      {isGroupKnockout && tournament.teams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Assign Groups</h2>
          <form className="space-y-2">
            {tournament.teams.map((tt) => {
              const updateAction = updateEnrollmentGroup.bind(null, id, tt.teamId);
              return (
                <div key={tt.teamId} className="flex items-center gap-3">
                  <span className="w-40 text-sm text-gray-700">{tt.team.name}</span>
                  <select
                    defaultValue={tt.groupName ?? ""}
                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                    aria-label={`Group assignment for ${tt.team.name}`}
                    form={`group-form-${tt.teamId}`}
                  >
                    <option value="">Unassigned</option>
                    {groupLabels.map((g) => (
                      <option key={g} value={g}>
                        Group {g}
                      </option>
                    ))}
                  </select>
                  <form id={`group-form-${tt.teamId}`} action={async (fd: FormData) => {
                    "use server";
                    const g = fd.get("groupName") as string;
                    await updateAction(g);
                  }}>
                    <input type="hidden" name="groupName" value={tt.groupName ?? ""} />
                    <Button variant="ghost" size="sm" type="submit">Save</Button>
                  </form>
                </div>
              );
            })}
          </form>
        </section>
      )}

      {/* Available teams */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Add Teams</h2>
        {unenrolled.length === 0 ? (
          <p className="text-sm text-gray-400">All teams are enrolled.</p>
        ) : (
          <ul className="space-y-2">
            {unenrolled.map((team) => {
              const enrollAction = enrollTeam.bind(null, id, team.id);
              return (
                <li
                  key={team.id}
                  className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-white px-4 py-3"
                >
                  <span className="text-gray-700">{team.name}</span>
                  <form action={enrollAction}>
                    <Button variant="secondary" size="sm" type="submit">
                      Enroll
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
