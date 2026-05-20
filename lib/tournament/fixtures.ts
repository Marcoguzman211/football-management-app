export function generateRoundRobin(
  teamIds: string[],
  doubleLegged = false
): Array<{ homeTeamId: string; awayTeamId: string; round: string }> {
  const n = teamIds.length;
  if (n < 2) return [];

  // Circle method: pin teams[0], rotate the rest
  const teams = n % 2 === 0 ? [...teamIds] : [...teamIds, "BYE"];
  const size = teams.length;
  const fixtures: Array<{ homeTeamId: string; awayTeamId: string; round: string }> = [];

  for (let round = 0; round < size - 1; round++) {
    const roundLabel = `Matchday ${round + 1}`;
    for (let match = 0; match < size / 2; match++) {
      const home = teams[match];
      const away = teams[size - 1 - match];
      if (home !== "BYE" && away !== "BYE") {
        fixtures.push({ homeTeamId: home, awayTeamId: away, round: roundLabel });
      }
    }
    // Rotate all except first element
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }

  if (!doubleLegged) return fixtures;

  // Add return legs
  const returnFixtures = fixtures.map((f, i) => ({
    homeTeamId: f.awayTeamId,
    awayTeamId: f.homeTeamId,
    round: `Matchday ${Math.floor(i / Math.floor(n / 2)) + (size - 1) + 1}`,
  }));

  // Recalculate return round labels properly
  const firstLegRounds = size - 1;
  const returnWithCorrectRounds = fixtures.map((f, i) => {
    const originalRound = parseInt(f.round.replace("Matchday ", ""));
    return {
      homeTeamId: f.awayTeamId,
      awayTeamId: f.homeTeamId,
      round: `Matchday ${originalRound + firstLegRounds}`,
    };
  });

  void returnFixtures; // suppress unused warning
  return [...fixtures, ...returnWithCorrectRounds];
}

const ROUND_LABELS: Record<number, string> = {
  2: "Final",
  4: "Semi-final",
  8: "Quarter-final",
  16: "Round of 16",
  32: "Round of 32",
  64: "Round of 64",
};

export function getRoundLabel(teamCount: number): string {
  return ROUND_LABELS[teamCount] ?? `Round of ${teamCount}`;
}

export function generateKnockoutRound(
  teamIds: string[],
  roundLabel: string
): Array<{ homeTeamId: string; awayTeamId: string; round: string }> {
  const fixtures: Array<{ homeTeamId: string; awayTeamId: string; round: string }> = [];
  for (let i = 0; i < teamIds.length; i += 2) {
    if (i + 1 < teamIds.length) {
      fixtures.push({
        homeTeamId: teamIds[i],
        awayTeamId: teamIds[i + 1],
        round: roundLabel,
      });
    }
  }
  return fixtures;
}
