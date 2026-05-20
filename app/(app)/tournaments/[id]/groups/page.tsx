import { notFound } from "next/navigation";
import {
  TOURNAMENTS,
  TEAMS,
  matchesByTournament,
  enrollmentsByTournament,
} from "@/lib/mock-data";
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
  const teamLinks = Object.fromEntries(enrollments.map((e) => [e.teamId, `/teams/${e.teamId}`]));

  const groupMatches: MatchRow[] = matchesByTournament(params.id)
    .filter((m) => m.stage === "GROUP")
    .map((m) => ({ ...m, status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED" }));

  const groupStandings = computeGroupStandings(groupMatches, groupEnrollments, settings);
  const groupNames = Object.keys(groupStandings).sort();

  const allPlayed =
    groupMatches.length > 0 &&
    groupMatches.every((m) => m.status === "PLAYED" || m.status === "CANCELLED");
  const hasKnockout = matchesByTournament(params.id).some((m) => m.stage === "KNOCKOUT");

  const teamsAdvancing = settings.teamsAdvancingPerGroup ?? 2;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Group Stage</h2>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
          allPlayed && hasKnockout
            ? "bg-green-100 text-green-700"
            : allPlayed
            ? "bg-blue-100 text-blue-700"
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {allPlayed && hasKnockout
            ? "Knockout seeded"
            : allPlayed
            ? "All matches played"
            : "In progress"}
        </span>
      </div>

      {groupNames.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No group assignments found.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {groupNames.map((g) => (
            <GroupStandingsPanelWithLinks
              key={g}
              groupName={g}
              standings={groupStandings[g]}
              teamsAdvancing={teamsAdvancing}
              teamLinks={teamLinks}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupStandingsPanelWithLinks({
  groupName,
  standings,
  teamsAdvancing,
  teamLinks,
}: {
  groupName: string;
  standings: import("@/lib/tournament/types").TeamStanding[];
  teamsAdvancing: number;
  teamLinks: Record<string, string>;
}) {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-gray-900">Group {groupName}</h3>
      <GroupStandingsPanel
        groupName={groupName}
        standings={standings}
        teamsAdvancing={teamsAdvancing}
        teamLinks={teamLinks}
      />
    </div>
  );
}
