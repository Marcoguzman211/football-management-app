import { notFound } from "next/navigation";
import {
  TOURNAMENTS,
  TEAMS,
  matchesByTournament,
  enrollmentsByTournament,
} from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { GroupStandingsPanel } from "@/components/standings/GroupStandingsPanel";
import { computeGroupStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default function GroupsPage({ params }: { params: { id: string } }) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const settings = parseTournamentSettings(tournament.settings);
  const enrollments = enrollmentsByTournament(params.id).filter((e) => e.groupName);
  const groupEnrollments = enrollments.map((e) => ({
    teamId: e.teamId,
    teamName: TEAMS.find((t) => t.id === e.teamId)?.name ?? e.teamId,
    groupName: e.groupName!,
  }));

  const groupMatches: MatchRow[] = matchesByTournament(params.id)
    .filter((m) => m.stage === "GROUP")
    .map((m) => ({ ...m, status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED" }));

  const groupStandings = computeGroupStandings(groupMatches, groupEnrollments, settings);
  const groupNames = Object.keys(groupStandings).sort();

  const allPlayed =
    groupMatches.length > 0 &&
    groupMatches.every((m) => m.status === "PLAYED" || m.status === "CANCELLED");
  const hasKnockout = matchesByTournament(params.id).some((m) => m.stage === "KNOCKOUT");

  return (
    <>
      <PageHeader
        title={`Groups — ${tournament.name}`}
        subtitle={
          allPlayed && hasKnockout
            ? "Group stage complete — knockout stage seeded."
            : allPlayed
            ? "All group matches played."
            : "Group stage in progress."
        }
      />

      {groupNames.length === 0 ? (
        <p className="text-gray-400 text-sm">No group assignments found.</p>
      ) : (
        <div className="space-y-8">
          {groupNames.map((g) => (
            <GroupStandingsPanel
              key={g}
              groupName={g}
              standings={groupStandings[g]}
              teamsAdvancing={settings.teamsAdvancingPerGroup}
            />
          ))}
        </div>
      )}
    </>
  );
}
