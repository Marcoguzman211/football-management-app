import type { TeamStanding, MatchRow, TiebreakerKey, TournamentSettings } from "./types";

function headToHeadStandings(
  tiedTeamIds: string[],
  matches: MatchRow[],
  settings: TournamentSettings
): Map<string, { points: number; goalDiff: number }> {
  const idSet = new Set(tiedTeamIds);
  const result = new Map(tiedTeamIds.map((id) => [id, { points: 0, goalDiff: 0 }]));

  for (const m of matches) {
    if (m.status !== "PLAYED" || m.homeScore === null || m.awayScore === null) continue;
    if (!idSet.has(m.homeTeamId) || !idSet.has(m.awayTeamId)) continue;

    const home = result.get(m.homeTeamId)!;
    const away = result.get(m.awayTeamId)!;
    const diff = m.homeScore - m.awayScore;

    home.goalDiff += diff;
    away.goalDiff -= diff;

    if (m.homeScore > m.awayScore) {
      home.points += settings.pointsWin;
      away.points += settings.pointsLoss;
    } else if (m.homeScore < m.awayScore) {
      home.points += settings.pointsLoss;
      away.points += settings.pointsWin;
    } else {
      home.points += settings.pointsDraw;
      away.points += settings.pointsDraw;
    }
  }
  return result;
}

export function applyTiebreakers(
  tied: TeamStanding[],
  allMatches: MatchRow[],
  order: TiebreakerKey[],
  settings: TournamentSettings
): TeamStanding[] {
  if (tied.length <= 1) return tied;

  for (const criterion of order) {
    let sorted: TeamStanding[];

    if (criterion === "headToHeadPoints") {
      const h2h = headToHeadStandings(
        tied.map((t) => t.teamId),
        allMatches,
        settings
      );
      sorted = [...tied].sort(
        (a, b) => (h2h.get(b.teamId)?.points ?? 0) - (h2h.get(a.teamId)?.points ?? 0)
      );
    } else if (criterion === "headToHeadGoalDiff") {
      const h2h = headToHeadStandings(
        tied.map((t) => t.teamId),
        allMatches,
        settings
      );
      sorted = [...tied].sort(
        (a, b) => (h2h.get(b.teamId)?.goalDiff ?? 0) - (h2h.get(a.teamId)?.goalDiff ?? 0)
      );
    } else if (criterion === "overallGoalDiff") {
      sorted = [...tied].sort((a, b) => b.goalDifference - a.goalDifference);
    } else if (criterion === "overallGoalsScored") {
      sorted = [...tied].sort((a, b) => b.goalsFor - a.goalsFor);
    } else {
      // coinToss — stable random shuffle for the group
      sorted = [...tied].sort(() => Math.random() - 0.5);
    }

    // Check if this criterion broke the tie
    const topValue = getComparisonValue(sorted[0], criterion, allMatches, settings);
    const allSame = sorted.every(
      (t) => getComparisonValue(t, criterion, allMatches, settings) === topValue
    );
    if (!allSame) return sorted;
  }

  return tied;
}

function getComparisonValue(
  standing: TeamStanding,
  criterion: TiebreakerKey,
  allMatches: MatchRow[],
  settings: TournamentSettings
): number {
  if (criterion === "headToHeadPoints") {
    return headToHeadStandings([standing.teamId], allMatches, settings).get(standing.teamId)
      ?.points ?? 0;
  }
  if (criterion === "headToHeadGoalDiff") {
    return headToHeadStandings([standing.teamId], allMatches, settings).get(standing.teamId)
      ?.goalDiff ?? 0;
  }
  if (criterion === "overallGoalDiff") return standing.goalDifference;
  if (criterion === "overallGoalsScored") return standing.goalsFor;
  return 0;
}
