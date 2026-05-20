import { notFound } from "next/navigation";
import Link from "next/link";
import { TOURNAMENTS, TOURNAMENT_TEAMS, matchesByTournament } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { TournamentStatusBadge } from "@/components/tournaments/TournamentStatusBadge";
import { Button } from "@/components/ui/Button";

const formatLabels: Record<string, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  GROUP_KNOCKOUT: "Group + Knockout",
};

export default function TournamentOverviewPage({ params }: { params: { id: string } }) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const teamCount = TOURNAMENT_TEAMS.filter((tt) => tt.tournamentId === params.id).length;
  const matchCount = matchesByTournament(params.id).length;

  const navLinks = [
    { href: `/tournaments/${params.id}/teams`, label: "Teams" },
    ...(tournament.format !== "KNOCKOUT"
      ? [{ href: `/tournaments/${params.id}/standings`, label: "Standings" }]
      : []),
    ...(tournament.format === "GROUP_KNOCKOUT"
      ? [{ href: `/tournaments/${params.id}/groups`, label: "Groups" }]
      : []),
    ...(tournament.format !== "LEAGUE"
      ? [{ href: `/tournaments/${params.id}/bracket`, label: "Bracket" }]
      : []),
    { href: `/tournaments/${params.id}/fixtures`, label: "Fixtures" },
  ];

  return (
    <>
      <PageHeader
        title={tournament.name}
        subtitle={`${tournament.season} · ${formatLabels[tournament.format] ?? tournament.format}`}
        action={
          <div className="flex gap-2 items-center">
            <TournamentStatusBadge status={tournament.status} />
            <Link href={`/tournaments/${params.id}/edit`}>
              <Button variant="secondary" size="sm">Edit</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{teamCount}</p>
          <p className="text-sm text-gray-500 mt-1">Teams</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{matchCount}</p>
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
