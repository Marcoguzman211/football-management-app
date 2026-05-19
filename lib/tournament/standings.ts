import type { MatchRow, TeamStanding, TournamentSettings } from "./types";
import { applyTiebreakers } from "./tiebreaker";

export function computeStandings(
  matches: MatchRow[],
  teams: { teamId: string; teamName: string }[],
  settings: TournamentSettings
): TeamStanding[] {
  const map = new Map<string, TeamStanding>(
    teams.map(({ teamId, teamName }) => [
      teamId,
      {
        teamId,
        teamName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ])
  );

  for (const m of matches) {
    if (m.status !== "PLAYED" || m.homeScore === null || m.awayScore === null) continue;
    const home = map.get(m.homeTeamId);
    const away = map.get(m.awayTeamId);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won++;
      away.lost++;
      home.points += settings.pointsWin;
      away.points += settings.pointsLoss;
    } else if (m.homeScore < m.awayScore) {
      home.lost++;
      away.won++;
      home.points += settings.pointsLoss;
      away.points += settings.pointsWin;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += settings.pointsDraw;
      away.points += settings.pointsDraw;
    }
  }

  for (const s of map.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  const standings = Array.from(map.values());

  // Sort by points, then apply tiebreakers for equal-points groups
  standings.sort((a, b) => b.points - a.points);

  const result: TeamStanding[] = [];
  let i = 0;
  while (i < standings.length) {
    let j = i + 1;
    while (j < standings.length && standings[j].points === standings[i].points) j++;
    const tiedGroup = standings.slice(i, j);
    const broken = applyTiebreakers(tiedGroup, matches, settings.tiebreakerOrder, settings);
    result.push(...broken);
    i = j;
  }

  return result;
}

export function computeGroupStandings(
  matches: MatchRow[],
  enrollments: Array<{ teamId: string; teamName: string; groupName: string }>,
  settings: TournamentSettings
): Record<string, TeamStanding[]> {
  const groups = new Map<string, Array<{ teamId: string; teamName: string }>>();
  for (const e of enrollments) {
    if (!groups.has(e.groupName)) groups.set(e.groupName, []);
    groups.get(e.groupName)!.push({ teamId: e.teamId, teamName: e.teamName });
  }

  const result: Record<string, TeamStanding[]> = {};
  for (const [groupName, groupTeams] of groups) {
    const teamIdSet = new Set(groupTeams.map((t) => t.teamId));
    const groupMatches = matches.filter(
      (m) => teamIdSet.has(m.homeTeamId) && teamIdSet.has(m.awayTeamId)
    );
    result[groupName] = computeStandings(groupMatches, groupTeams, settings);
  }

  return result;
}
