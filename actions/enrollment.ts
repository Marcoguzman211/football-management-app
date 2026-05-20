"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function enrollTeam(tournamentId: string, teamId: string) {
  const session = await auth();
  if (!session) redirect("/login");

  await prisma.tournamentTeam.create({ data: { tournamentId, teamId } });
  revalidatePath(`/tournaments/${tournamentId}/teams`);
}

export async function removeTeam(tournamentId: string, teamId: string) {
  const session = await auth();
  if (!session) redirect("/login");

  await prisma.tournamentTeam.delete({
    where: { tournamentId_teamId: { tournamentId, teamId } },
  });
  revalidatePath(`/tournaments/${tournamentId}/teams`);
}

export async function updateEnrollmentGroup(
  tournamentId: string,
  teamId: string,
  groupName: string
) {
  const session = await auth();
  if (!session) redirect("/login");

  await prisma.tournamentTeam.update({
    where: { tournamentId_teamId: { tournamentId, teamId } },
    data: { groupName: groupName || null },
  });
  revalidatePath(`/tournaments/${tournamentId}/teams`);
}
