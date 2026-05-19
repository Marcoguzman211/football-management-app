import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ScoreEntryForm } from "@/components/fixtures/ScoreEntryForm";

export default async function FixturesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stage?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const { stage } = await searchParams;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!tournament) notFound();

  const hasKnockout = tournament.matches.some((m) => m.stage === "KNOCKOUT");
  const hasGroup = tournament.matches.some((m) => m.stage === "GROUP");
  const activeStage = stage ?? (hasGroup ? "GROUP" : "KNOCKOUT");

  const filteredMatches = tournament.matches.filter(
    (m) =>
      tournament.format === "LEAGUE" || tournament.format === "KNOCKOUT" || m.stage === activeStage
  );

  // Group by round
  const byRound = new Map<string, typeof filteredMatches>();
  for (const m of filteredMatches) {
    if (!byRound.has(m.round)) byRound.set(m.round, []);
    byRound.get(m.round)!.push(m);
  }

  const totalMatches = tournament.matches.length;
  const hasFixtures = totalMatches > 0;

  return (
    <>
      <PageHeader
        title={`Fixtures — ${tournament.name}`}
        action={
          !hasFixtures ? (
            <form
              action={async () => {
                "use server";
                const res = await fetch(
                  `${process.env.AUTH_URL}/api/tournaments/${id}/fixtures/generate`,
                  { method: "POST" }
                );
                void res;
              }}
            >
              <Button type="submit">Generate Fixtures</Button>
            </form>
          ) : null
        }
      />

      {!hasFixtures ? (
        <GenerateFixturesButton tournamentId={id} />
      ) : (
        <>
          {/* Stage tabs for GROUP_KNOCKOUT */}
          {tournament.format === "GROUP_KNOCKOUT" && (
            <div className="flex gap-2 mb-6">
              <a
                href={`?stage=GROUP`}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeStage === "GROUP" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Group Stage
              </a>
              {hasKnockout && (
                <a
                  href={`?stage=KNOCKOUT`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${activeStage === "KNOCKOUT" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  Knockout
                </a>
              )}
            </div>
          )}

          <div className="space-y-6">
            {byRound.size === 0 && (
              <p className="text-gray-400 text-sm">No fixtures for this stage.</p>
            )}
            {Array.from(byRound.entries()).map(([round, matches]) => (
              <section key={round}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {round}
                </h3>
                <div className="space-y-2">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-xl border bg-white p-4 ${m.status === "PLAYED" ? "border-green-200" : "border-gray-200"}`}
                    >
                      <ScoreEntryForm
                        matchId={m.id}
                        homeTeamName={m.homeTeam.name}
                        awayTeamName={m.awayTeam.name}
                        currentHomeScore={m.homeScore}
                        currentAwayScore={m.awayScore}
                        status={m.status}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function GenerateFixturesButton({ tournamentId }: { tournamentId: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">No fixtures generated yet.</p>
      <GenerateButton tournamentId={tournamentId} />
    </div>
  );
}

function GenerateButton({ tournamentId }: { tournamentId: string }) {
  async function generate() {
    "use server";
    const { redirect: doRedirect } = await import("next/navigation");
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/tournaments/${tournamentId}/fixtures/generate`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json() as { error: string };
      throw new Error(data.error ?? "Failed to generate fixtures");
    }
    doRedirect(`/tournaments/${tournamentId}/fixtures`);
  }

  return (
    <form action={generate}>
      <Button type="submit" size="lg">
        Generate Fixtures
      </Button>
    </form>
  );
}
