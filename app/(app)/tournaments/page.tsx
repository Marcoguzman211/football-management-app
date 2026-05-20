import Link from "next/link";
import { TOURNAMENTS, TOURNAMENT_TEAMS } from "@/lib/mock-data";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export default function TournamentsPage() {
  const tournaments = TOURNAMENTS.map((t) => ({
    ...t,
    teamCount: TOURNAMENT_TEAMS.filter((tt) => tt.tournamentId === t.id).length,
  }));

  const active = tournaments.filter((t) => t.status === "ACTIVE");
  const draft = tournaments.filter((t) => t.status === "DRAFT");
  const finished = tournaments.filter((t) => t.status === "FINISHED");

  function Section({ title, items }: { title: string; items: typeof tournaments }) {
    if (items.length === 0) return null;
    return (
      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-3">{title}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TournamentCard
              key={t.id}
              id={t.id}
              name={t.name}
              season={t.season}
              format={t.format}
              status={t.status}
              teamCount={t.teamCount}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        title="Tournaments"
        action={
          <Link href="/tournaments/new">
            <Button>New Tournament</Button>
          </Link>
        }
      />
      <Section title="Active" items={active} />
      <Section title="Draft" items={draft} />
      <Section title="Finished" items={finished} />
    </>
  );
}
