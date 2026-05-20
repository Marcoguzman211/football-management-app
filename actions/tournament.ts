"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { TournamentFormat } from "@/app/generated/prisma/client";

export async function createTournament(formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const season = parseInt(formData.get("season") as string);
  const format = formData.get("format") as TournamentFormat;

  if (!name || !season || !format) throw new Error("Missing required fields");

  const settings = buildSettings(format, formData);

  const tournament = await prisma.tournament.create({
    data: { name, season, format, status: "DRAFT", settings },
  });

  revalidatePath("/tournaments");
  redirect(`/tournaments/${tournament.id}/teams`);
}

export async function updateTournament(id: string, formData: FormData) {
  const session = await auth();
  if (!session) redirect("/login");

  const tournament = await prisma.tournament.findUniqueOrThrow({ where: { id } });
  if (tournament.status !== "DRAFT") throw new Error("Can only edit DRAFT tournaments");

  const name = (formData.get("name") as string)?.trim();
  const season = parseInt(formData.get("season") as string);
  const format = formData.get("format") as TournamentFormat;
  const settings = buildSettings(format, formData);

  await prisma.tournament.update({ where: { id }, data: { name, season, format, settings } });

  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${id}`);
  redirect(`/tournaments/${id}`);
}

export async function deleteTournament(id: string) {
  const session = await auth();
  if (!session) redirect("/login");

  await prisma.tournament.delete({ where: { id } });
  revalidatePath("/tournaments");
  redirect("/tournaments");
}

export async function activateTournament(id: string) {
  const session = await auth();
  if (!session) redirect("/login");

  const matchCount = await prisma.match.count({ where: { tournamentId: id } });
  if (matchCount === 0) throw new Error("Generate fixtures before activating");

  await prisma.tournament.update({ where: { id }, data: { status: "ACTIVE" } });
  revalidatePath(`/tournaments/${id}`);
}

export async function finishTournament(id: string) {
  const session = await auth();
  if (!session) redirect("/login");

  await prisma.tournament.update({ where: { id }, data: { status: "FINISHED" } });
  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${id}`);
}

function buildSettings(format: TournamentFormat, formData: FormData) {
  const base = {
    pointsWin: parseInt((formData.get("pointsWin") as string) ?? "3") || 3,
    pointsDraw: parseInt((formData.get("pointsDraw") as string) ?? "1") || 1,
    pointsLoss: parseInt((formData.get("pointsLoss") as string) ?? "0") || 0,
    doubleLegged: formData.get("doubleLegged") === "true",
  };
  if (format === "GROUP_KNOCKOUT") {
    return {
      ...base,
      numberOfGroups: parseInt((formData.get("numberOfGroups") as string) ?? "2") || 2,
      teamsAdvancingPerGroup:
        parseInt((formData.get("teamsAdvancingPerGroup") as string) ?? "2") || 2,
    };
  }
  return base;
}
