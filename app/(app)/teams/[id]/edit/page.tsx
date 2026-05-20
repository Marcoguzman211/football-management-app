import { notFound } from "next/navigation";
import { TEAMS } from "@/lib/mock-data";
import { TeamForm } from "@/components/teams/TeamForm";
import { PageHeader } from "@/components/layout/PageHeader";

async function noopUpdate() {
  "use server";
  const { redirect } = await import("next/navigation");
  redirect("/teams");
}

export default function EditTeamPage({ params }: { params: { id: string } }) {
  const team = TEAMS.find((t) => t.id === params.id);
  if (!team) notFound();

  return (
    <>
      <PageHeader title={`Edit ${team.name}`} subtitle="Demo mode — changes are not saved." />
      <div className="max-w-lg">
        <TeamForm
          action={noopUpdate}
          defaultValues={{ name: team.name, logoUrl: team.logoUrl }}
          submitLabel="Save Changes"
        />
      </div>
    </>
  );
}
