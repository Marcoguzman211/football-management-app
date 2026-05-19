import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { TournamentStatusBadge } from "@/components/tournaments/TournamentStatusBadge";
import { Button } from "@/components/ui/Button";
import { activateTournament, finishTournament } from "@/actions/tournament";

const formatLabels: Record<string, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  GROUP_KNOCKOUT: "Group + Knockout",
};

export default async function TournamentOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      _count: { select: { teams: true, matches: true } },
    },
  });
  if (!tournament) notFound();

  const activateAction = activateTournament.bind(null, id);
  const finishAction = finishTournament.bind(null, id);

  const navLinks = [
    { href: `/tournaments/${id}/teams`, label: "Teams" },
    ...(tournament.format !== "KNOCKOUT"
      ? [{ href: `/tournaments/${id}/standings`, label: "Standings" }]
      : []),
    ...(tournament.format === "GROUP_KNOCKOUT"
      ? [{ href: `/tournaments/${id}/groups`, label: "Groups" }]
      : []),
    ...(tournament.format !== "LEAGUE"
      ? [{ href: `/tournaments/${id}/bracket`, label: "Bracket" }]
      : []),
    { href: `/tournaments/${id}/fixtures`, label: "Fixtures" },
  ];

  return (
    <>
      <PageHeader
        title={tournament.name}
        subtitle={`${tournament.season} · ${formatLabels[tournament.format] ?? tournament.format}`}
        action={
          <div className="flex gap-2 items-center">
            <TournamentStatusBadge status={tournament.status} />
            {tournament.status === "DRAFT" && (
              <>
                <Link href={`/tournaments/${id}/edit`}>
                  <Button variant="secondary" size="sm">Edit</Button>
                </Link>
                <form action={activateAction}>
                  <Button size="sm" type="submit">Activate</Button>
                </form>
              </>
            )}
            {tournament.status === "ACTIVE" && (
              <form action={finishAction}>
                <Button variant="secondary" size="sm" type="submit">Mark Finished</Button>
              </form>
            )}
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{tournament._count.teams}</p>
          <p className="text-sm text-gray-500 mt-1">Teams</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{tournament._count.matches}</p>
          <p className="text-sm text-gray-500 mt-1">Matches</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{tournament.season}</p>
          <p className="text-sm text-gray-500 mt-1">Season</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href}>
            <Button variant="secondary">{l.label}</Button>
          </Link>
        ))}
      </div>
    </>
  );
}
