// Static mock data — used instead of a real DB so the scaffold is instantly browsable.
// All IDs are stable strings so URLs and navigation work correctly.

// ── Teams ─────────────────────────────────────────────────────────────────────

export const TEAMS = [
  { id: "t-alpha",   name: "FC Alpha",   logoUrl: null },
  { id: "t-beta",    name: "FC Beta",    logoUrl: null },
  { id: "t-gamma",   name: "FC Gamma",   logoUrl: null },
  { id: "t-delta",   name: "FC Delta",   logoUrl: null },
  { id: "t-epsilon", name: "FC Epsilon", logoUrl: null },
  { id: "t-zeta",    name: "FC Zeta",    logoUrl: null },
  { id: "t-eta",     name: "FC Eta",     logoUrl: null },
  { id: "t-theta",   name: "FC Theta",   logoUrl: null },
] as const;

type TeamId = (typeof TEAMS)[number]["id"];
const NAME: Record<TeamId, string> = Object.fromEntries(TEAMS.map((t) => [t.id, t.name])) as Record<TeamId, string>;

// ── Tournaments ───────────────────────────────────────────────────────────────

export const TOURNAMENTS = [
  {
    id: "tour-league",
    name: "Premier League 2025",
    season: 2025,
    format: "LEAGUE" as const,
    status: "ACTIVE" as const,
    settings: { pointsWin: 3, pointsDraw: 1, pointsLoss: 0 },
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "tour-knockout",
    name: "Champions Cup 2025",
    season: 2025,
    format: "KNOCKOUT" as const,
    status: "ACTIVE" as const,
    settings: {},
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
  },
  {
    id: "tour-groups",
    name: "Euro Tournament 2025",
    season: 2025,
    format: "GROUP_KNOCKOUT" as const,
    status: "ACTIVE" as const,
    settings: { numberOfGroups: 2, teamsAdvancingPerGroup: 2, pointsWin: 3, pointsDraw: 1, pointsLoss: 0 },
    createdAt: new Date("2025-03-01"),
    updatedAt: new Date("2025-03-01"),
  },
  {
    id: "tour-finished",
    name: "Premier League 2024",
    season: 2024,
    format: "LEAGUE" as const,
    status: "FINISHED" as const,
    settings: { pointsWin: 3, pointsDraw: 1, pointsLoss: 0 },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-31"),
  },
  {
    id: "tour-draft",
    name: "Winter Cup 2026",
    season: 2026,
    format: "KNOCKOUT" as const,
    status: "DRAFT" as const,
    settings: {},
    createdAt: new Date("2025-05-01"),
    updatedAt: new Date("2025-05-01"),
  },
];

// ── Tournament teams ──────────────────────────────────────────────────────────

export const TOURNAMENT_TEAMS: { id: string; tournamentId: string; teamId: string; groupName: string | null }[] = [
  // League 2025 — all 8 teams
  ...TEAMS.map((t) => ({ id: `tt-league-${t.id}`, tournamentId: "tour-league", teamId: t.id, groupName: null })),
  // Cup 2025 — all 8 teams
  ...TEAMS.map((t) => ({ id: `tt-cup-${t.id}`, tournamentId: "tour-knockout", teamId: t.id, groupName: null })),
  // Euro 2025 — groups A and B
  { id: "tt-euro-t-alpha",   tournamentId: "tour-groups", teamId: "t-alpha",   groupName: "A" },
  { id: "tt-euro-t-beta",    tournamentId: "tour-groups", teamId: "t-beta",    groupName: "A" },
  { id: "tt-euro-t-gamma",   tournamentId: "tour-groups", teamId: "t-gamma",   groupName: "A" },
  { id: "tt-euro-t-delta",   tournamentId: "tour-groups", teamId: "t-delta",   groupName: "A" },
  { id: "tt-euro-t-epsilon", tournamentId: "tour-groups", teamId: "t-epsilon", groupName: "B" },
  { id: "tt-euro-t-zeta",    tournamentId: "tour-groups", teamId: "t-zeta",    groupName: "B" },
  { id: "tt-euro-t-eta",     tournamentId: "tour-groups", teamId: "t-eta",     groupName: "B" },
  { id: "tt-euro-t-theta",   tournamentId: "tour-groups", teamId: "t-theta",   groupName: "B" },
  // Finished league 2024 — all 8 teams
  ...TEAMS.map((t) => ({ id: `tt-2024-${t.id}`, tournamentId: "tour-finished", teamId: t.id, groupName: null })),
];

// ── Matches ───────────────────────────────────────────────────────────────────
// Helper
function m(
  id: string,
  tournamentId: string,
  home: string,
  away: string,
  homeScore: number | null,
  awayScore: number | null,
  round: string,
  stage: "GROUP" | "KNOCKOUT" = "GROUP"
) {
  return {
    id,
    tournamentId,
    homeTeamId: home,
    awayTeamId: away,
    homeScore,
    awayScore,
    stage,
    round,
    status: (homeScore !== null ? "PLAYED" : "SCHEDULED") as "PLAYED" | "SCHEDULED" | "CANCELLED",
    scheduledAt: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };
}

// ── League 2025 matches (8-team round-robin, MD 1-4 played, 5-7 scheduled) ───

export const LEAGUE_MATCHES = [
  // Matchday 1
  m("lm1",  "tour-league", "t-alpha",   "t-theta",   2, 0, "Matchday 1"),
  m("lm2",  "tour-league", "t-beta",    "t-eta",     1, 1, "Matchday 1"),
  m("lm3",  "tour-league", "t-gamma",   "t-zeta",    3, 1, "Matchday 1"),
  m("lm4",  "tour-league", "t-delta",   "t-epsilon", 0, 2, "Matchday 1"),
  // Matchday 2
  m("lm5",  "tour-league", "t-alpha",   "t-eta",     1, 0, "Matchday 2"),
  m("lm6",  "tour-league", "t-theta",   "t-zeta",    2, 1, "Matchday 2"),
  m("lm7",  "tour-league", "t-beta",    "t-epsilon", 0, 0, "Matchday 2"),
  m("lm8",  "tour-league", "t-gamma",   "t-delta",   1, 2, "Matchday 2"),
  // Matchday 3
  m("lm9",  "tour-league", "t-alpha",   "t-zeta",    3, 2, "Matchday 3"),
  m("lm10", "tour-league", "t-eta",     "t-epsilon", 1, 1, "Matchday 3"),
  m("lm11", "tour-league", "t-theta",   "t-delta",   0, 1, "Matchday 3"),
  m("lm12", "tour-league", "t-beta",    "t-gamma",   0, 3, "Matchday 3"),
  // Matchday 4
  m("lm13", "tour-league", "t-alpha",   "t-epsilon", 2, 0, "Matchday 4"),
  m("lm14", "tour-league", "t-zeta",    "t-delta",   1, 1, "Matchday 4"),
  m("lm15", "tour-league", "t-eta",     "t-gamma",   0, 2, "Matchday 4"),
  m("lm16", "tour-league", "t-theta",   "t-beta",    1, 2, "Matchday 4"),
  // Matchday 5 (scheduled)
  m("lm17", "tour-league", "t-alpha",   "t-delta",   null, null, "Matchday 5"),
  m("lm18", "tour-league", "t-epsilon", "t-gamma",   null, null, "Matchday 5"),
  m("lm19", "tour-league", "t-zeta",    "t-beta",    null, null, "Matchday 5"),
  m("lm20", "tour-league", "t-eta",     "t-theta",   null, null, "Matchday 5"),
  // Matchday 6 (scheduled)
  m("lm21", "tour-league", "t-alpha",   "t-gamma",   null, null, "Matchday 6"),
  m("lm22", "tour-league", "t-delta",   "t-beta",    null, null, "Matchday 6"),
  m("lm23", "tour-league", "t-epsilon", "t-theta",   null, null, "Matchday 6"),
  m("lm24", "tour-league", "t-zeta",    "t-eta",     null, null, "Matchday 6"),
  // Matchday 7 (scheduled)
  m("lm25", "tour-league", "t-alpha",   "t-beta",    null, null, "Matchday 7"),
  m("lm26", "tour-league", "t-gamma",   "t-theta",   null, null, "Matchday 7"),
  m("lm27", "tour-league", "t-delta",   "t-eta",     null, null, "Matchday 7"),
  m("lm28", "tour-league", "t-epsilon", "t-zeta",    null, null, "Matchday 7"),
];

// ── Champions Cup 2025 (knockout — QF and SF played, Final scheduled) ─────────

export const CUP_MATCHES = [
  // Quarter-finals
  m("cm1", "tour-knockout", "t-alpha",   "t-delta",   2, 0, "Quarter-final", "KNOCKOUT"),
  m("cm2", "tour-knockout", "t-beta",    "t-epsilon", 1, 0, "Quarter-final", "KNOCKOUT"),
  m("cm3", "tour-knockout", "t-gamma",   "t-eta",     3, 1, "Quarter-final", "KNOCKOUT"),
  m("cm4", "tour-knockout", "t-theta",   "t-zeta",    2, 1, "Quarter-final", "KNOCKOUT"),
  // Semi-finals
  m("cm5", "tour-knockout", "t-alpha",   "t-beta",    3, 1, "Semi-final", "KNOCKOUT"),
  m("cm6", "tour-knockout", "t-gamma",   "t-theta",   2, 0, "Semi-final", "KNOCKOUT"),
  // Final (scheduled)
  m("cm7", "tour-knockout", "t-alpha",   "t-gamma",   null, null, "Final", "KNOCKOUT"),
];

// ── Euro Tournament 2025 (group stage played, knockout in progress) ───────────

export const EURO_MATCHES = [
  // Group A — all 6 matches played
  m("em1",  "tour-groups", "t-alpha", "t-delta", 2, 1, "Group A - Matchday 1"),
  m("em2",  "tour-groups", "t-beta",  "t-gamma", 1, 1, "Group A - Matchday 1"),
  m("em3",  "tour-groups", "t-alpha", "t-gamma", 1, 0, "Group A - Matchday 2"),
  m("em4",  "tour-groups", "t-delta", "t-beta",  0, 2, "Group A - Matchday 2"),
  m("em5",  "tour-groups", "t-alpha", "t-beta",  2, 0, "Group A - Matchday 3"),
  m("em6",  "tour-groups", "t-gamma", "t-delta", 3, 0, "Group A - Matchday 3"),
  // Group B — all 6 matches played
  m("em7",  "tour-groups", "t-epsilon", "t-theta", 2, 0, "Group B - Matchday 1"),
  m("em8",  "tour-groups", "t-zeta",    "t-eta",   1, 2, "Group B - Matchday 1"),
  m("em9",  "tour-groups", "t-epsilon", "t-eta",   1, 1, "Group B - Matchday 2"),
  m("em10", "tour-groups", "t-theta",   "t-zeta",  1, 0, "Group B - Matchday 2"),
  m("em11", "tour-groups", "t-epsilon", "t-zeta",  3, 1, "Group B - Matchday 3"),
  m("em12", "tour-groups", "t-eta",     "t-theta", 2, 1, "Group B - Matchday 3"),
  // Knockout — semi-finals (alpha 1st, gamma 2nd from A; epsilon 1st, eta 2nd from B)
  m("em13", "tour-groups", "t-alpha",   "t-eta",   2, 0, "Semi-final", "KNOCKOUT"),
  m("em14", "tour-groups", "t-epsilon", "t-gamma", 1, 2, "Semi-final", "KNOCKOUT"),
  // Final (scheduled)
  m("em15", "tour-groups", "t-alpha",   "t-gamma", null, null, "Final", "KNOCKOUT"),
];

// ── Finished League 2024 ──────────────────────────────────────────────────────
// Full 28-match season (all played) — gives teams historical data

export const FINISHED_MATCHES = [
  // Matchday 1-7 (all played, gamma was champion)
  m("fm1",  "tour-finished", "t-gamma",   "t-theta",   3, 0, "Matchday 1"),
  m("fm2",  "tour-finished", "t-alpha",   "t-eta",     2, 1, "Matchday 1"),
  m("fm3",  "tour-finished", "t-beta",    "t-zeta",    1, 0, "Matchday 1"),
  m("fm4",  "tour-finished", "t-delta",   "t-epsilon", 1, 2, "Matchday 1"),
  m("fm5",  "tour-finished", "t-gamma",   "t-eta",     2, 0, "Matchday 2"),
  m("fm6",  "tour-finished", "t-theta",   "t-zeta",    1, 1, "Matchday 2"),
  m("fm7",  "tour-finished", "t-alpha",   "t-epsilon", 0, 1, "Matchday 2"),
  m("fm8",  "tour-finished", "t-beta",    "t-delta",   2, 2, "Matchday 2"),
  m("fm9",  "tour-finished", "t-gamma",   "t-zeta",    4, 0, "Matchday 3"),
  m("fm10", "tour-finished", "t-eta",     "t-delta",   1, 1, "Matchday 3"),
  m("fm11", "tour-finished", "t-theta",   "t-epsilon", 0, 2, "Matchday 3"),
  m("fm12", "tour-finished", "t-alpha",   "t-beta",    1, 0, "Matchday 3"),
  m("fm13", "tour-finished", "t-gamma",   "t-alpha",   2, 1, "Matchday 4"),
  m("fm14", "tour-finished", "t-zeta",    "t-epsilon", 0, 3, "Matchday 4"),
  m("fm15", "tour-finished", "t-eta",     "t-theta",   2, 2, "Matchday 4"),
  m("fm16", "tour-finished", "t-beta",    "t-delta",   1, 0, "Matchday 4"),
  m("fm17", "tour-finished", "t-gamma",   "t-delta",   3, 1, "Matchday 5"),
  m("fm18", "tour-finished", "t-alpha",   "t-zeta",    3, 0, "Matchday 5"),
  m("fm19", "tour-finished", "t-beta",    "t-theta",   2, 1, "Matchday 5"),
  m("fm20", "tour-finished", "t-epsilon", "t-eta",     1, 0, "Matchday 5"),
  m("fm21", "tour-finished", "t-gamma",   "t-epsilon", 1, 0, "Matchday 6"),
  m("fm22", "tour-finished", "t-alpha",   "t-delta",   2, 0, "Matchday 6"),
  m("fm23", "tour-finished", "t-theta",   "t-beta",    1, 3, "Matchday 6"),
  m("fm24", "tour-finished", "t-zeta",    "t-eta",     1, 1, "Matchday 6"),
  m("fm25", "tour-finished", "t-gamma",   "t-beta",    2, 0, "Matchday 7"),
  m("fm26", "tour-finished", "t-alpha",   "t-theta",   2, 1, "Matchday 7"),
  m("fm27", "tour-finished", "t-delta",   "t-zeta",    2, 0, "Matchday 7"),
  m("fm28", "tour-finished", "t-epsilon", "t-eta",     3, 2, "Matchday 7"),
];

export const ALL_MATCHES = [
  ...LEAGUE_MATCHES,
  ...CUP_MATCHES,
  ...EURO_MATCHES,
  ...FINISHED_MATCHES,
];

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function teamById(id: string) {
  return TEAMS.find((t) => t.id === id) ?? null;
}

export function teamName(id: string): string {
  return NAME[id as TeamId] ?? id;
}

export function tournamentById(id: string) {
  return TOURNAMENTS.find((t) => t.id === id) ?? null;
}

export function matchesByTournament(tournamentId: string) {
  return ALL_MATCHES.filter((m) => m.tournamentId === tournamentId);
}

export function enrollmentsByTournament(tournamentId: string) {
  return TOURNAMENT_TEAMS.filter((tt) => tt.tournamentId === tournamentId);
}

export function tournamentsByTeam(teamId: string) {
  return TOURNAMENT_TEAMS.filter((tt) => tt.teamId === teamId).map((tt) => ({
    ...tt,
    tournament: TOURNAMENTS.find((t) => t.id === tt.tournamentId)!,
  }));
}
