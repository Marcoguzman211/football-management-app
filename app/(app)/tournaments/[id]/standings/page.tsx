import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { computeStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default async function StandingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      matches: true,
      teams: { include: { team: true } },
    },
  });
  if (!tournament) notFound();

  const settings = parseTournamentSettings(tournament.settings);
  const teamList = tournament.teams.map((t) => ({
    teamId: t.teamId,
    teamName: t.team.name,
  }));
  const matches: MatchRow[] = tournament.matches
    .filter((m) => m.stage === "GROUP")
    .map((m) => ({
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      stage: "GROUP",
      round: m.round,
      status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED",
    }));

  const standings = computeStandings(matches, teamList, settings);

  return (
    <>
      <PageHeader title={`Standings — ${tournament.name}`} />
      <StandingsTable standings={standings} caption={`${tournament.name} standings`} />
    </>
  );
}
