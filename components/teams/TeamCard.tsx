import Link from "next/link";
import Image from "next/image";

interface TeamCardProps {
  id: string;
  name: string;
  logoUrl?: string | null;
  tournamentCount?: number;
}

export function TeamCard({ id, name, logoUrl, tournamentCount }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${id}`}
      className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 overflow-hidden">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} width={48} height={48} className="object-cover" />
        ) : (
          <span className="text-xl">🛡️</span>
        )}
      </div>
      <div>
        <p className="font-semibold text-gray-900">{name}</p>
        {tournamentCount !== undefined && (
          <p className="text-sm text-gray-500">{tournamentCount} tournament{tournamentCount !== 1 ? "s" : ""}</p>
        )}
      </div>
    </Link>
  );
}
