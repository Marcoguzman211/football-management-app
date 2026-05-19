import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeamForm } from "@/components/teams/TeamForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { updateTeam } from "@/actions/team";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id } });
  if (!team) notFound();

  const action = updateTeam.bind(null, id);

  return (
    <>
      <PageHeader title={`Edit ${team.name}`} />
      <div className="max-w-lg">
        <TeamForm
          action={action}
          defaultValues={{ name: team.name, logoUrl: team.logoUrl }}
          submitLabel="Save Changes"
        />
      </div>
    </>
  );
}
