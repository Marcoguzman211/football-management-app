import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  generateRoundRobin,
  generateKnockoutRound,
  getRoundLabel,
  parseTournamentSettings,
} from "@/lib/tournament";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const tournament = await prisma.tournament.findUniqueOrThrow({
    where: { id },
    include: { teams: { include: { team: true } } },
  });

  const existing = await prisma.match.count({ where: { tournamentId: id } });
  if (existing > 0) {
    return NextResponse.json({ error: "Fixtures already generated" }, { status: 400 });
  }

  const settings = parseTournamentSettings(tournament.settings);
  const teamIds = tournament.teams.map((t) => t.teamId);

  if (tournament.format === "LEAGUE") {
    const fixtures = generateRoundRobin(teamIds, settings.doubleLegged);
    const created = await prisma.match.createMany({
      data: fixtures.map((f) => ({
        tournamentId: id,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        round: f.round,
        stage: "GROUP",
        status: "SCHEDULED",
      })),
    });
    return NextResponse.json({ count: created.count });
  }

  if (tournament.format === "KNOCKOUT") {
    if (teamIds.length < 2) {
      return NextResponse.json({ error: "Need at least 2 teams" }, { status: 400 });
    }
    const roundLabel = getRoundLabel(teamIds.length);
    const fixtures = generateKnockoutRound(teamIds, roundLabel);
    const created = await prisma.match.createMany({
      data: fixtures.map((f) => ({
        tournamentId: id,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        round: f.round,
        stage: "KNOCKOUT",
        status: "SCHEDULED",
      })),
    });
    return NextResponse.json({ count: created.count });
  }

  if (tournament.format === "GROUP_KNOCKOUT") {
    // Generate group-stage round-robins per group
    const byGroup = new Map<string, string[]>();
    for (const t of tournament.teams) {
      const g = t.groupName ?? "A";
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g)!.push(t.teamId);
    }

    const allFixtures: Array<{
      homeTeamId: string;
      awayTeamId: string;
      round: string;
    }> = [];
    for (const [groupName, groupTeamIds] of byGroup) {
      const fixtures = generateRoundRobin(groupTeamIds, settings.doubleLegged);
      fixtures.forEach((f) => allFixtures.push({ ...f, round: `Group ${groupName} - ${f.round}` }));
    }

    const created = await prisma.match.createMany({
      data: allFixtures.map((f) => ({
        tournamentId: id,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        round: f.round,
        stage: "GROUP",
        status: "SCHEDULED",
      })),
    });
    return NextResponse.json({ count: created.count });
  }

  return NextResponse.json({ error: "Unknown format" }, { status: 400 });
}
