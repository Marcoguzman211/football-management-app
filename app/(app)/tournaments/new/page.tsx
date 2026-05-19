import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TournamentForm } from "@/components/tournaments/TournamentForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { createTournament } from "@/actions/tournament";

export default async function NewTournamentPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <>
      <PageHeader title="New Tournament" />
      <div className="max-w-lg">
        <TournamentForm action={createTournament} submitLabel="Create Tournament" />
      </div>
    </>
  );
}
