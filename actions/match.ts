"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function enterScore(matchId: string, homeScore: number, awayScore: number) {
  const session = await auth();
  if (!session) redirect("/login");

  if (!Number.isInteger(homeScore) || homeScore < 0)
    throw new Error("Invalid home score");
  if (!Number.isInteger(awayScore) || awayScore < 0)
    throw new Error("Invalid away score");

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, status: "PLAYED" },
  });

  revalidatePath(`/tournaments/${match.tournamentId}/fixtures`);
  revalidatePath(`/tournaments/${match.tournamentId}/standings`);
  revalidatePath(`/tournaments/${match.tournamentId}/groups`);
  revalidatePath(`/tournaments/${match.tournamentId}/bracket`);
}

export async function cancelMatch(matchId: string) {
  const session = await auth();
  if (!session) redirect("/login");

  const match = await prisma.match.update({
    where: { id: matchId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/tournaments/${match.tournamentId}/fixtures`);
}
