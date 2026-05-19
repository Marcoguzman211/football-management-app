"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function createTeam(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

  if (!name) throw new Error("Team name is required");

  const team = await prisma.team.create({ data: { name, logoUrl } });
  revalidatePath("/teams");
  redirect(`/teams/${team.id}`);
}

export async function updateTeam(id: string, formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

  if (!name) throw new Error("Team name is required");

  await prisma.team.update({ where: { id }, data: { name, logoUrl } });
  revalidatePath("/teams");
  revalidatePath(`/teams/${id}`);
  redirect(`/teams/${id}`);
}

export async function deleteTeam(id: string) {
  const session = await auth();
  if (!session) redirect("/login");

  await prisma.team.delete({ where: { id } });
  revalidatePath("/teams");
  redirect("/teams");
}
