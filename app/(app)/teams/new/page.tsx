import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeamForm } from "@/components/teams/TeamForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { createTeam } from "@/actions/team";

export default async function NewTeamPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <>
      <PageHeader title="New Team" />
      <div className="max-w-lg">
        <TeamForm action={createTeam} submitLabel="Create Team" />
      </div>
    </>
  );
}
