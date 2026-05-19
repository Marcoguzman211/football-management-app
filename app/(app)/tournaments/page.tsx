import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export default async function TournamentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const tournaments = await prisma.tournament.findMany({
    orderBy: [{ season: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { teams: true } } },
  });

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
              teamCount={t._count.teams}
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
      {tournaments.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          No tournaments yet.{" "}
          <Link href="/tournaments/new" className="text-blue-600 hover:underline">
            Create the first one.
          </Link>
        </p>
      ) : (
        <>
          <Section title="Active" items={active} />
          <Section title="Draft" items={draft} />
          <Section title="Finished" items={finished} />
        </>
      )}
    </>
  );
}
