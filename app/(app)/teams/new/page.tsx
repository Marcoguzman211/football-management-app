import { TeamForm } from "@/components/teams/TeamForm";
import { PageHeader } from "@/components/layout/PageHeader";

async function noopCreate() {
  "use server";
  // Demo mode — mutations are not persisted.
  const { redirect } = await import("next/navigation");
  redirect("/teams");
}

export default function NewTeamPage() {
  return (
    <>
      <PageHeader title="New Team" subtitle="Demo mode — changes are not saved." />
      <div className="max-w-lg">
        <TeamForm action={noopCreate} submitLabel="Create Team" />
      </div>
    </>
  );
}
