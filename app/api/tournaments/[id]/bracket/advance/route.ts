import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  advanceWinners,
  getRoundLabel,
  computeGroupStandings,
  seedKnockoutFromGroups,
  generateKnockoutRound,
  parseTournamentSettings,
} from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action: string = body.action ?? "advance";

  const tournament = await prisma.tournament.findUniqueOrThrow({
    where: { id },
    include: {
      matches: true,
      teams: { include: { team: true } },
    },
  });

  const settings = parseTournamentSettings(tournament.settings);

  if (action === "seed") {
    // Seed knockout stage from group results
    const groupEnrollments = tournament.teams
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
        stage: "GROUP",
        round: m.round,
        status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED",
      }));

    const unplayed = groupMatches.filter((m) => m.status !== "PLAYED" && m.status !== "CANCELLED");
    if (unplayed.length > 0) {
      return NextResponse.json({ error: "All group matches must be played first" }, { status: 400 });
    }

    const groupStandings = computeGroupStandings(groupMatches, groupEnrollments, settings);
    const seededTeamIds = seedKnockoutFromGroups(
      groupStandings,
      settings.teamsAdvancingPerGroup ?? 2
    );

    const roundLabel = getRoundLabel(seededTeamIds.length);
    const fixtures = generateKnockoutRound(seededTeamIds, roundLabel);

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

  // Default: advance winners of a completed knockout round
  const { round } = body;
  if (!round) return NextResponse.json({ error: "round is required" }, { status: 400 });

  const roundMatches: MatchRow[] = tournament.matches
    .filter((m) => m.stage === "KNOCKOUT" && m.round === round)
    .map((m) => ({
      id: m.id,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      stage: "KNOCKOUT",
      round: m.round,
      status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED",
    }));

  if (roundMatches.length === 0) {
    return NextResponse.json({ error: "No matches found for this round" }, { status: 404 });
  }

  try {
    const nextRoundLabel = getRoundLabel(roundMatches.length);
    const nextFixtures = advanceWinners(roundMatches, nextRoundLabel);
    const created = await prisma.match.createMany({
      data: nextFixtures.map((f) => ({
        tournamentId: id,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        round: f.round,
        stage: "KNOCKOUT",
        status: "SCHEDULED",
      })),
    });
    return NextResponse.json({ count: created.count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error advancing winners";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
