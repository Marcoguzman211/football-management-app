import { notFound } from "next/navigation";
import { TOURNAMENTS } from "@/lib/mock-data";
import { TournamentForm } from "@/components/tournaments/TournamentForm";
import { PageHeader } from "@/components/layout/PageHeader";

async function noopUpdate() {
  "use server";
  const { redirect } = await import("next/navigation");
  redirect("/tournaments");
}

export default function EditTournamentPage({ params }: { params: { id: string } }) {
  const tournament = TOURNAMENTS.find((t) => t.id === params.id);
  if (!tournament) notFound();

  const settings = tournament.settings as Record<string, unknown>;

  return (
    <>
      <PageHeader title={`Edit ${tournament.name}`} subtitle="Demo mode — changes are not saved." />
      <div className="max-w-lg">
        <TournamentForm
          action={noopUpdate}
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
