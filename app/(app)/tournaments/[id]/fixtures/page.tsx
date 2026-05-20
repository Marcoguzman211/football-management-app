import { notFound } from "next/navigation";
import { TOURNAMENTS, TEAMS, matchesByTournament } from "@/lib/mock-data";
import { ScoreEntryForm } from "@/components/fixtures/ScoreEntryForm";
import { Badge } from "@/components/ui/Badge";

export default async function FixturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const { id } = await params;
  const { stage } = await searchParams;
  const tournament = TOURNAMENTS.find((t) => t.id === id);
  if (!tournament) notFound();

  const teamName = (tid: string) => TEAMS.find((t) => t.id === tid)?.name ?? tid;
  const allMatches = matchesByTournament(id);

  const hasGroup = allMatches.some((m) => m.stage === "GROUP");
  const hasKnockout = allMatches.some((m) => m.stage === "KNOCKOUT");
  const showTabs = tournament.format === "GROUP_KNOCKOUT";
  const activeStage = stage ?? (hasGroup ? "GROUP" : "KNOCKOUT");

  const filteredMatches =
    showTabs ? allMatches.filter((m) => m.stage === activeStage) : allMatches;

  const byRound = new Map<string, typeof filteredMatches>();
  for (const match of filteredMatches) {
    if (!byRound.has(match.round)) byRound.set(match.round, []);
    byRound.get(match.round)!.push(match);
  }

  const played = allMatches.filter((m) => m.status === "PLAYED").length;
  const total = allMatches.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {showTabs
            ? activeStage === "GROUP" ? "Group Stage Fixtures" : "Knockout Fixtures"
            : tournament.format === "KNOCKOUT" ? "Bracket Fixtures" : "Fixtures"}
        </h2>
        <span className="text-sm text-gray-500">{played} / {total} played</span>
      </div>

      {showTabs && (
        <div className="flex gap-2 mb-6">
          <a
            href="?stage=GROUP"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStage === "GROUP"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Group Stage
          </a>
          {hasKnockout && (
            <a
              href="?stage=KNOCKOUT"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeStage === "KNOCKOUT"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Knockout
            </a>
          )}
        </div>
      )}

      {byRound.size === 0 ? (
        <p className="text-center py-12 text-gray-400 text-sm">No fixtures for this stage.</p>
      ) : (
        <div className="space-y-6">
          {Array.from(byRound.entries()).map(([round, matches]) => {
            const roundPlayed = matches.filter((m) => m.status === "PLAYED").length;
            const allDone = roundPlayed === matches.length;
            return (
              <section key={round}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {round}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {roundPlayed}/{matches.length}
                  </span>
                  {allDone && <Badge variant="success">Complete</Badge>}
                </div>
                <div className="space-y-2">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className={`rounded-xl border bg-white p-4 ${
                        match.status === "PLAYED"
                          ? "border-green-200 bg-green-50/30"
                          : "border-gray-200"
                      }`}
                    >
                      {match.status === "PLAYED" ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm font-medium text-gray-700 flex-1 text-right">
                            {teamName(match.homeTeamId)}
                          </span>
                          <span className="font-bold text-gray-900 text-lg tabular-nums min-w-[3rem] text-center">
                            {match.homeScore}
                          </span>
                          <span className="text-gray-300 font-medium">–</span>
                          <span className="font-bold text-gray-900 text-lg tabular-nums min-w-[3rem] text-center">
                            {match.awayScore}
                          </span>
                          <span className="text-sm font-medium text-gray-700 flex-1">
                            {teamName(match.awayTeamId)}
                          </span>
                          <Badge variant="success">FT</Badge>
                        </div>
                      ) : (
                        <ScoreEntryForm
                          matchId={match.id}
                          homeTeamName={teamName(match.homeTeamId)}
                          awayTeamName={teamName(match.awayTeamId)}
                          currentHomeScore={match.homeScore}
                          currentAwayScore={match.awayScore}
                          status={match.status}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
