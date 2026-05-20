import { notFound } from "next/navigation";
import Link from "next/link";
import {
  TOURNAMENTS,
  TOURNAMENT_TEAMS,
  TEAMS,
  matchesByTournament,
  enrollmentsByTournament,
} from "@/lib/mock-data";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { computeStandings, parseTournamentSettings } from "@/lib/tournament";
import type { MatchRow } from "@/lib/tournament";

export default function TournamentOverviewPage({ params }: { params: { id: string } }) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const id = params.id;
  const allMatches = matchesByTournament(id);
  const played = allMatches.filter((m) => m.status === "PLAYED").length;
  const total = allMatches.length;
  const teamCount = TOURNAMENT_TEAMS.filter((tt) => tt.tournamentId === id).length;
  const pct = total > 0 ? Math.round((played / total) * 100) : 0;

  // Most recent results (last 5 played)
  const recentResults = [...allMatches]
    .filter((m) => m.status === "PLAYED")
    .slice(-5)
    .reverse();

  // Top of standings preview (for LEAGUE / GROUP_KNOCKOUT)
  let topStandings = null;
  if (tournament.format === "LEAGUE") {
    const settings = parseTournamentSettings(tournament.settings);
    const enrollments = enrollmentsByTournament(id);
    const teamList = enrollments.map((e) => ({
      teamId: e.teamId,
      teamName: TEAMS.find((t) => t.id === e.teamId)?.name ?? e.teamId,
    }));
    const groupMatches: MatchRow[] = allMatches
      .filter((m) => m.stage === "GROUP")
      .map((m) => ({ ...m, status: m.status as "SCHEDULED" | "PLAYED" | "CANCELLED" }));
    topStandings = computeStandings(groupMatches, teamList, settings).slice(0, 5);
  }

  // Upcoming fixtures (next 3 scheduled)
  const upcoming = allMatches.filter((m) => m.status === "SCHEDULED").slice(0, 3);

  const teamName = (tid: string) => TEAMS.find((t) => t.id === tid)?.name ?? tid;

  return (
    <div className="space-y-8">
      {/* Progress bar + stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500 mb-1">Matches played</p>
          <p className="text-3xl font-bold text-gray-900">{played}<span className="text-lg font-normal text-gray-400"> / {total}</span></p>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{pct}% complete</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500 mb-1">Teams</p>
          <p className="text-3xl font-bold text-gray-900">{teamCount}</p>
          <Link
            href={`/tournaments/${id}/teams`}
            className="mt-3 inline-block text-xs text-blue-600 hover:underline"
          >
            View all teams →
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500 mb-1">Format</p>
          <p className="text-lg font-semibold text-gray-900">
            {tournament.format === "LEAGUE" && "Round-robin"}
            {tournament.format === "KNOCKOUT" && "Single elimination"}
            {tournament.format === "GROUP_KNOCKOUT" && "Groups + Knockout"}
          </p>
          <p className="text-xs text-gray-400 mt-1">Season {tournament.season}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Standings preview (league only) */}
        {topStandings && topStandings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Top of the Table</h2>
              <Link href={`/tournaments/${id}/standings`} className="text-sm text-blue-600 hover:underline">
                Full standings →
              </Link>
            </div>
            <StandingsTable standings={topStandings} caption="Top standings preview" />
          </section>
        )}

        {/* Recent results */}
        {recentResults.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Recent Results</h2>
              <Link href={`/tournaments/${id}/fixtures`} className="text-sm text-blue-600 hover:underline">
                All fixtures →
              </Link>
            </div>
            <div className="space-y-2">
              {recentResults.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-green-200 bg-white px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700 flex-1 text-right pr-3">
                    {teamName(m.homeTeamId)}
                  </span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums bg-gray-50 rounded px-2 py-0.5 border border-gray-200">
                    {m.homeScore} – {m.awayScore}
                  </span>
                  <span className="text-sm font-medium text-gray-700 flex-1 pl-3">
                    {teamName(m.awayTeamId)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming fixtures */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Upcoming Fixtures</h2>
              <Link href={`/tournaments/${id}/fixtures`} className="text-sm text-blue-600 hover:underline">
                All fixtures →
              </Link>
            </div>
            <div className="space-y-2">
              {upcoming.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-700 flex-1 text-right pr-3">
                    {teamName(m.homeTeamId)}
                  </span>
                  <span className="text-xs text-gray-400 tabular-nums bg-gray-50 rounded px-2 py-0.5 border border-gray-200">
                    vs
                  </span>
                  <span className="text-sm font-medium text-gray-700 flex-1 pl-3">
                    {teamName(m.awayTeamId)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
