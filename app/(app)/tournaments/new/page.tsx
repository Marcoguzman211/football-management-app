import { TournamentForm } from "@/components/tournaments/TournamentForm";
import { PageHeader } from "@/components/layout/PageHeader";

async function noopCreate() {
  "use server";
  const { redirect } = await import("next/navigation");
  redirect("/tournaments");
}

export default function NewTournamentPage() {
  return (
    <>
      <PageHeader title="New Tournament" subtitle="Demo mode — changes are not saved." />
      <div className="max-w-lg">
        <TournamentForm action={noopCreate} submitLabel="Create Tournament" />
      </div>
    </>
  );
}
