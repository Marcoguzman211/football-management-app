export type TiebreakerKey =
  | "headToHeadPoints"
  | "headToHeadGoalDiff"
  | "overallGoalDiff"
  | "overallGoalsScored"
  | "coinToss";

export interface TournamentSettings {
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  tiebreakerOrder: TiebreakerKey[];
  doubleLegged?: boolean;
  numberOfGroups?: number;
  teamsAdvancingPerGroup?: number;
}

export const DEFAULT_SETTINGS: TournamentSettings = {
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  tiebreakerOrder: [
    "headToHeadPoints",
    "headToHeadGoalDiff",
    "overallGoalDiff",
    "overallGoalsScored",
    "coinToss",
  ],
  doubleLegged: false,
};

export function parseTournamentSettings(raw: unknown): TournamentSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...(raw as Partial<TournamentSettings>) };
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface MatchRow {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  stage: "GROUP" | "KNOCKOUT";
  round: string;
  status: "SCHEDULED" | "PLAYED" | "CANCELLED";
}

export interface BracketNode {
  matchId: string | null;
  round: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: string | null;
  children: [BracketNode | null, BracketNode | null];
}
