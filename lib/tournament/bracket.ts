import type { MatchRow, BracketNode } from "./types";
import { getRoundLabel, generateKnockoutRound } from "./fixtures";

export function getWinner(match: MatchRow): string | null {
  if (match.status !== "PLAYED" || match.homeScore === null || match.awayScore === null) {
    return null;
  }
  if (match.homeScore > match.awayScore) return match.homeTeamId;
  if (match.awayScore > match.homeScore) return match.awayTeamId;
  return null; // draw — not valid in knockout
}

export function advanceWinners(
  completedRound: MatchRow[],
  nextRoundLabel: string
): Array<{ homeTeamId: string; awayTeamId: string; round: string }> {
  const winners: string[] = [];
  for (const m of completedRound) {
    const winner = getWinner(m);
    if (!winner) throw new Error(`Match ${m.id} has no clear winner`);
    winners.push(winner);
  }
  return generateKnockoutRound(winners, nextRoundLabel);
}

export function buildBracketTree(
  matches: MatchRow[],
  teamNames: Record<string, string>
): BracketNode {
  // Group matches by round, order rounds from largest (first round) to smallest (final)
  const roundMap = new Map<string, MatchRow[]>();
  for (const m of matches) {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(m);
  }

  // Sort rounds: more matches = earlier round
  const rounds = Array.from(roundMap.entries()).sort(
    ([, a], [, b]) => b.length - a.length
  );

  if (rounds.length === 0) {
    return {
      matchId: null,
      round: "Final",
      homeTeamId: null,
      awayTeamId: null,
      homeScore: null,
      awayScore: null,
      winnerId: null,
      children: [null, null],
    };
  }

  function buildNode(roundIndex: number, matchIndex: number): BracketNode | null {
    if (roundIndex >= rounds.length) return null;
    const [roundName, roundMatches] = rounds[roundIndex];
    const match = roundMatches[matchIndex];
    if (!match) return null;

    const node: BracketNode = {
      matchId: match.id,
      round: roundName,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      winnerId: getWinner(match),
      children: [
        buildNode(roundIndex + 1, matchIndex * 2),
        buildNode(roundIndex + 1, matchIndex * 2 + 1),
      ],
    };
    void teamNames; // available for consumers
    return node;
  }

  return buildNode(0, 0)!;
}

export function getChampion(tournament: {
  format: string;
  matches: MatchRow[];
}): string | null {
  const knockoutMatches = tournament.matches.filter((m) => m.stage === "KNOCKOUT");
  if (knockoutMatches.length === 0) {
    if (tournament.format === "LEAGUE") {
      // Champion is the team at top of standings — caller must compute standings separately
      return null;
    }
    return null;
  }

  // Find the final: the round with only 1 match
  const roundMap = new Map<string, MatchRow[]>();
  for (const m of knockoutMatches) {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(m);
  }
  const finalRound = Array.from(roundMap.values()).find((r) => r.length === 1);
  if (!finalRound) return null;
  return getWinner(finalRound[0]);
}

export { getRoundLabel };
