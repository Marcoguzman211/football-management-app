import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TeamCard } from "@/components/teams/TeamCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";

export default async function TeamsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { tournaments: true } } },
  });

  return (
    <>
      <PageHeader
        title="Teams"
        subtitle={`${teams.length} team${teams.length !== 1 ? "s" : ""}`}
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
            tournamentCount={team._count.tournaments}
          />
        ))}
        {teams.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-12">
            No teams yet.{" "}
            <Link href="/teams/new" className="text-blue-600 hover:underline">
              Create the first one.
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
