import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TournamentForm } from "@/components/tournaments/TournamentForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateTournament } from "@/actions/tournament";

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) notFound();
  if (tournament.status !== "DRAFT") redirect(`/tournaments/${id}`);

  const action = updateTournament.bind(null, id);
  const settings = (tournament.settings ?? {}) as Record<string, unknown>;

  return (
    <>
      <PageHeader title={`Edit ${tournament.name}`} />
      <div className="max-w-lg">
        <TournamentForm
          action={action}
          defaultValues={{
            name: tournament.name,
            season: tournament.season,
            format: tournament.format,
            settings,
          }}
          submitLabel="Save Changes"
        />
      </div>
    </>
  );
}
