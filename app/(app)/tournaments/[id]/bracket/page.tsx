import { notFound } from "next/navigation";
import { TOURNAMENTS, TEAMS, matchesByTournament, enrollmentsByTournament } from "@/lib/mock-data";
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

  const played = knockoutMatches.filter((m) => m.status === "PLAYED").length;
  const total = knockoutMatches.length;

  if (knockoutMatches.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-400">No bracket data yet.</p>
      </div>
    );
  }

  const tree = buildBracketTree(knockoutMatches, teamNames);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Bracket</h2>
        <span className="text-sm text-gray-500">{played} of {total} matches played</span>
      </div>
      <BracketView node={tree} teamNames={teamNames} />
    </div>
  );
}
