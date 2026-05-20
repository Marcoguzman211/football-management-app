import Link from "next/link";
import { TournamentStatusBadge } from "./TournamentStatusBadge";

interface TournamentCardProps {
  id: string;
  name: string;
  season: number;
  format: string;
  status: string;
  teamCount: number;
}

const formatLabels: Record<string, string> = {
  LEAGUE: "League",
  KNOCKOUT: "Knockout",
  GROUP_KNOCKOUT: "Group + Knockout",
};

export function TournamentCard({
  id,
  name,
  season,
  format,
  status,
  teamCount,
}: TournamentCardProps) {
  return (
    <Link
      href={`/tournaments/${id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <TournamentStatusBadge status={status} />
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>{season}</span>
        <span>·</span>
        <span>{formatLabels[format] ?? format}</span>
        <span>·</span>
        <span>{teamCount} teams</span>
      </div>
    </Link>
  );
}
