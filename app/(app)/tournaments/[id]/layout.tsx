import Link from "next/link";
import { notFound } from "next/navigation";
import { TOURNAMENTS } from "@/lib/mock-data";
import { TournamentStatusBadge } from "@/components/tournaments/TournamentStatusBadge";
import { TournamentTabs } from "@/components/tournaments/TournamentTabs";

const FORMAT_LABELS: Record<string, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  GROUP_KNOCKOUT: "Group + Knockout",
};

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tournament = TOURNAMENTS.find((t) => t.id === id);
  if (!tournament) notFound();

  const tabs = [
    { href: `/tournaments/${id}`, label: "Overview", exact: true },
    { href: `/tournaments/${id}/fixtures`, label: "Fixtures" },
    ...(tournament.format !== "KNOCKOUT"
      ? [{ href: `/tournaments/${id}/standings`, label: "Standings" }]
      : []),
    ...(tournament.format === "GROUP_KNOCKOUT"
      ? [{ href: `/tournaments/${id}/groups`, label: "Groups" }]
      : []),
    ...(tournament.format !== "LEAGUE"
      ? [{ href: `/tournaments/${id}/bracket`, label: "Bracket" }]
      : []),
    { href: `/tournaments/${id}/teams`, label: "Teams" },
  ];

  return (
    <div>
      {/* Back link */}
      <Link
        href="/tournaments"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Tournaments
      </Link>

      {/* Tournament header */}
      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{tournament.name}</h1>
            <TournamentStatusBadge status={tournament.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {tournament.season} · {FORMAT_LABELS[tournament.format] ?? tournament.format}
          </p>
        </div>
        <Link
          href={`/tournaments/${id}/edit`}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Persistent tab nav */}
      <div className="mt-4 border-b border-gray-200 mb-6">
        <TournamentTabs tabs={tabs} />
      </div>

      {children}
    </div>
  );
}
