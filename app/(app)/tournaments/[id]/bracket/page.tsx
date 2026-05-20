import { notFound } from "next/navigation";
import { TOURNAMENTS, TEAMS, matchesByTournament, enrollmentsByTournament } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { BracketView } from "@/components/bracket/BracketView";
import { buildBracketTree } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default function BracketPage({ params }: { params: { id: string } }) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const enrollments = enrollmentsByTournament(params.id);
  const teamNames: Record<string, string> = {};
  for (const e of enrollments) {
    teamNames[e.teamId] = TEAMS.find((t) => t.id === e.teamId)?.name ?? e.teamId;
  }

  const knockoutMatches: MatchRow[] = matchesByTournament(params.id)
    .filter((m) => m.stage === "KNOCKOUT")
    .map((m) => ({ ...m, status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED" }));

  if (knockoutMatches.length === 0) {
    return (
      <>
        <PageHeader title={`Bracket — ${tournament.name}`} />
        <p className="text-gray-400 text-sm py-8 text-center">
          No bracket data available yet.
        </p>
      </>
    );
  }

  const tree = buildBracketTree(knockoutMatches, teamNames);

  return (
    <>
      <PageHeader title={`Bracket — ${tournament.name}`} />
      <BracketView node={tree} teamNames={teamNames} />
    </>
  );
}
