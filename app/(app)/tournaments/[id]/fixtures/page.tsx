import { notFound } from "next/navigation";
import { TOURNAMENTS, TEAMS, matchesByTournament } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScoreEntryForm } from "@/components/fixtures/ScoreEntryForm";
import { Badge } from "@/components/ui/Badge";

export default function FixturesPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { stage?: string };
}) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const teamName = (id: string) => TEAMS.find((t) => t.id === id)?.name ?? id;
  const allMatches = matchesByTournament(params.id);

  const hasGroup = allMatches.some((m) => m.stage === "GROUP");
  const hasKnockout = allMatches.some((m) => m.stage === "KNOCKOUT");
  const activeStage = searchParams.stage ?? (hasGroup ? "GROUP" : "KNOCKOUT");

  const filteredMatches =
    tournament.format === "LEAGUE" || tournament.format === "KNOCKOUT"
      ? allMatches
      : allMatches.filter((m) => m.stage === activeStage);

  const byRound = new Map<string, typeof filteredMatches>();
  for (const match of filteredMatches) {
    if (!byRound.has(match.round)) byRound.set(match.round, []);
    byRound.get(match.round)!.push(match);
  }

  const played = allMatches.filter((m) => m.status === "PLAYED").length;
  const total = allMatches.length;

  return (
    <>
      <PageHeader
        title={`Fixtures — ${tournament.name}`}
        subtitle={`${played} / ${total} matches played`}
      />

      {tournament.format === "GROUP_KNOCKOUT" && (
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

      <div className="space-y-6">
        {Array.from(byRound.entries()).map(([round, matches]) => (
          <section key={round}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {round}
            </h3>
            <div className="space-y-2">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={`rounded-xl border bg-white p-4 ${
                    match.status === "PLAYED" ? "border-green-200" : "border-gray-200"
                  }`}
                >
                  {match.status === "PLAYED" ? (
                    // Read-only score display in demo mode
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 min-w-28 text-right">
                        {teamName(match.homeTeamId)}
                      </span>
                      <span className="w-14 text-center font-bold text-gray-900 text-sm">
                        {match.homeScore}
                      </span>
                      <span className="text-gray-400 font-medium">–</span>
                      <span className="w-14 text-center font-bold text-gray-900 text-sm">
                        {match.awayScore}
                      </span>
                      <span className="text-sm font-medium text-gray-700 min-w-28">
                        {teamName(match.awayTeamId)}
                      </span>
                      <Badge variant="success">Played</Badge>
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
        ))}
      </div>
    </>
  );
}
