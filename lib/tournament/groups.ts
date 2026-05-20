import type { TeamStanding } from "./types";

export function seedKnockoutFromGroups(
  groupStandings: Record<string, TeamStanding[]>,
  teamsAdvancingPerGroup: number
): string[] {
  const groupNames = Object.keys(groupStandings).sort();
  const advancingPerGroup: TeamStanding[][] = groupNames.map((g) =>
    groupStandings[g].slice(0, teamsAdvancingPerGroup)
  );

  // UEFA-style seeding: A1 vs B2, B1 vs A2 (cross-group)
  // For more than 2 groups, use positional seeding: rank-1s vs rank-2s
  const byPosition: TeamStanding[][] = [];
  for (let pos = 0; pos < teamsAdvancingPerGroup; pos++) {
    byPosition.push(advancingPerGroup.map((g) => g[pos]).filter(Boolean));
  }

  // Interleave: A1, B2, C1, D2 … so opposing seeds face each other
  const rank1s = byPosition[0] ?? [];
  const rank2s = byPosition[1] ?? [];

  const seeded: string[] = [];
  const pairs = Math.min(rank1s.length, rank2s.length);
  for (let i = 0; i < pairs; i++) {
    seeded.push(rank1s[i].teamId);
    seeded.push(rank2s[pairs - 1 - i].teamId); // reverse rank-2s for cross-group matchups
  }

  // If there are more advancing positions (e.g. 3rd place), append them
  for (let pos = 2; pos < teamsAdvancingPerGroup; pos++) {
    for (const t of byPosition[pos] ?? []) {
      seeded.push(t.teamId);
    }
  }

  return seeded;
}
