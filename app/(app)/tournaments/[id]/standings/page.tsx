import { notFound } from "next/navigation";
import { TOURNAMENTS, TEAMS, matchesByTournament, enrollmentsByTournament } from "@/lib/mock-data";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { computeStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default async function StandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = TOURNAMENTS.find((t) => t.id === id);
  if (!tournament) notFound();

  const settings = parseTournamentSettings(tournament.settings);
  const enrollments = enrollmentsByTournament(id);
  const teamList = enrollments.map((e) => ({
    teamId: e.teamId,
    teamName: TEAMS.find((t) => t.id === e.teamId)?.name ?? e.teamId,
  }));
  const teamLinks = Object.fromEntries(enrollments.map((e) => [e.teamId, `/teams/${e.teamId}`]));

  const matches: MatchRow[] = matchesByTournament(id)
    .filter((m) => m.stage === "GROUP")
    .map((m) => ({ ...m, status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED" }));

  const standings = computeStandings(matches, teamList, settings);
  const played = matches.filter((m) => m.status === "PLAYED").length;
  const total = matches.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">League Table</h2>
        <span className="text-sm text-gray-500">{played} of {total} matches played</span>
      </div>
      <StandingsTable
        standings={standings}
        teamLinks={teamLinks}
        caption={`${tournament.name} standings`}
      />
    </div>
  );
}
