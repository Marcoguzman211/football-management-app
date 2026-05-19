import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { GroupStandingsPanel } from "@/components/standings/GroupStandingsPanel";
import { Button } from "@/components/ui/Button";
import { computeGroupStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default async function GroupsPage({
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
  const enrollments = tournament.teams
    .filter((t) => t.groupName)
    .map((t) => ({
      teamId: t.teamId,
      teamName: t.team.name,
      groupName: t.groupName!,
    }));

  const groupMatches: MatchRow[] = tournament.matches
    .filter((m) => m.stage === "GROUP")
    .map((m) => ({
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      stage: "GROUP" as const,
      round: m.round,
      status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED",
    }));

  const groupStandings = computeGroupStandings(groupMatches, enrollments, settings);
  const groupNames = Object.keys(groupStandings).sort();

  const allPlayed =
    groupMatches.length > 0 &&
    groupMatches.every((m) => m.status === "PLAYED" || m.status === "CANCELLED");
  const hasKnockout = tournament.matches.some((m) => m.stage === "KNOCKOUT");

  return (
    <>
      <PageHeader
        title={`Groups — ${tournament.name}`}
        action={
          allPlayed && !hasKnockout ? <SeedKnockoutButton tournamentId={id} /> : null
        }
      />

      {groupNames.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No group assignments yet. Go to the Teams tab to assign groups.
        </p>
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

function SeedKnockoutButton({ tournamentId }: { tournamentId: string }) {
  async function seedKnockout() {
    "use server";
    const { redirect: doRedirect } = await import("next/navigation");
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/tournaments/${tournamentId}/bracket/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    if (!res.ok) {
      const data = await res.json() as { error: string };
      throw new Error(data.error ?? "Failed to seed knockout");
    }
    doRedirect(`/tournaments/${tournamentId}/bracket`);
  }

  return (
    <form action={seedKnockout}>
      <Button type="submit">Seed Knockout Stage</Button>
    </form>
  );
}
