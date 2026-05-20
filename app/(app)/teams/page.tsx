import Link from "next/link";
import { TEAMS, TOURNAMENT_TEAMS } from "@/lib/mock-data";
import { TeamCard } from "@/components/teams/TeamCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export default function TeamsPage() {
  const teams = [...TEAMS].sort((a, b) => a.name.localeCompare(b.name)).map((t) => ({
    ...t,
    tournamentCount: TOURNAMENT_TEAMS.filter((tt) => tt.teamId === t.id).length,
  }));

  return (
    <>
      <PageHeader
        title="Teams"
        subtitle={`${teams.length} teams`}
        action={
          <Link href="/teams/new">
            <Button>New Team</Button>
          </Link>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            id={team.id}
            name={team.name}
            logoUrl={team.logoUrl}
            tournamentCount={team.tournamentCount}
          />
        ))}
      </div>
    </>
  );
}
