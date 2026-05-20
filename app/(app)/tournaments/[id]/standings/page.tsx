import { notFound } from "next/navigation";
import { TOURNAMENTS, TEAMS, matchesByTournament, enrollmentsByTournament } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { computeStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default function StandingsPage({ params }: { params: { id: string } }) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const settings = parseTournamentSettings(tournament.settings);
  const enrollments = enrollmentsByTournament(params.id);
  const teamList = enrollments.map((e) => ({
    teamId: e.teamId,
    teamName: TEAMS.find((t) => t.id === e.teamId)?.name ?? e.teamId,
  }));

  const matches: MatchRow[] = matchesByTournament(params.id)
    .filter((m) => m.stage === "GROUP")
    .map((m) => ({ ...m, status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED" }));

  const standings = computeStandings(matches, teamList, settings);
  const played = matches.filter((m) => m.status === "PLAYED").length;
  const total = matches.length;

  return (
    <>
      <PageHeader
        title={`Standings — ${tournament.name}`}
        subtitle={`After ${played} of ${total} matches`}
      />
      <StandingsTable standings={standings} caption={`${tournament.name} standings`} />
    </>
  );
}
