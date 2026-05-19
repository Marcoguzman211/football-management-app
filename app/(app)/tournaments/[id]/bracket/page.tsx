import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { BracketView } from "@/components/bracket/BracketView";
import { Button } from "@/components/ui/Button";
import { buildBracketTree } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default async function BracketPage({
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
      matches: { include: { homeTeam: true, awayTeam: true } },
      teams: { include: { team: true } },
    },
  });
  if (!tournament) notFound();

  const knockoutMatches = tournament.matches.filter((m) => m.stage === "KNOCKOUT");
  const teamNames: Record<string, string> = {};
  for (const t of tournament.teams) teamNames[t.teamId] = t.team.name;

  const matchRows: MatchRow[] = knockoutMatches.map((m) => ({
    id: m.id,
    homeTeamId: m.homeTeamId,
    awayTeamId: m.awayTeamId,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    stage: "KNOCKOUT" as const,
    round: m.round,
    status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED",
  }));

  // Determine which rounds are completable (all played, not the last round)
  const roundMap = new Map<string, MatchRow[]>();
  for (const m of matchRows) {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(m);
  }
  const rounds = Array.from(roundMap.entries()).sort(([, a], [, b]) => b.length - a.length);
  const completableRound = rounds.find(
    ([, matches]) =>
      matches.length > 1 &&
      matches.every((m) => m.status === "PLAYED") &&
      rounds.indexOf(rounds.find(([, ms]) => ms === matches)!) < rounds.length - 1
  );

  const hasKnockout = knockoutMatches.length > 0;

  if (!hasKnockout) {
    return (
      <>
        <PageHeader title={`Bracket — ${tournament.name}`} />
        {tournament.format === "KNOCKOUT" ? (
          <GenerateKnockoutButton tournamentId={id} />
        ) : (
          <p className="text-gray-400 text-sm">
            Complete the group stage first, then seed the knockout stage from the Groups tab.
          </p>
        )}
      </>
    );
  }

  const tree = buildBracketTree(matchRows, teamNames);

  return (
    <>
      <PageHeader
        title={`Bracket — ${tournament.name}`}
        action={
          completableRound ? (
            <AdvanceRoundButton tournamentId={id} round={completableRound[0]} />
          ) : null
        }
      />
      <BracketView node={tree} teamNames={teamNames} />
    </>
  );
}

function GenerateKnockoutButton({ tournamentId }: { tournamentId: string }) {
  async function generate() {
    "use server";
    const { redirect: doRedirect } = await import("next/navigation");
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/tournaments/${tournamentId}/fixtures/generate`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json() as { error: string };
      throw new Error(data.error ?? "Failed to generate bracket");
    }
    doRedirect(`/tournaments/${tournamentId}/bracket`);
  }

  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">
        No bracket generated yet. Make sure teams are enrolled first.
      </p>
      <form action={generate}>
        <Button type="submit" size="lg">Generate Bracket</Button>
      </form>
    </div>
  );
}

function AdvanceRoundButton({ tournamentId, round }: { tournamentId: string; round: string }) {
  async function advance() {
    "use server";
    const { redirect: doRedirect } = await import("next/navigation");
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/tournaments/${tournamentId}/bracket/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round }),
    });
    if (!res.ok) {
      const data = await res.json() as { error: string };
      throw new Error(data.error ?? "Failed to advance round");
    }
    doRedirect(`/tournaments/${tournamentId}/bracket`);
  }

  return (
    <form action={advance}>
      <Button type="submit">Advance to Next Round</Button>
    </form>
  );
}
