import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth-utils";
import { generateRoundRobin } from "../lib/tournament/fixtures";

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const prisma = createClient();

const TEAM_NAMES = [
  "FC Alpha",
  "FC Beta",
  "FC Gamma",
  "FC Delta",
  "FC Epsilon",
  "FC Zeta",
  "FC Eta",
  "FC Theta",
];

async function main() {
  console.log("Seeding database…");

  // Admin user
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: await hashPassword("admin123"),
    },
  });

  // Global teams
  const teams = await Promise.all(
    TEAM_NAMES.map((name) =>
      prisma.team.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  console.log(`Created ${teams.length} teams`);

  // LEAGUE tournament (active)
  const league = await prisma.tournament.upsert({
    where: { id: "seed-league-2025" },
    update: {},
    create: {
      id: "seed-league-2025",
      name: "Premier League 2025",
      season: 2025,
      format: "LEAGUE",
      status: "ACTIVE",
      settings: { pointsWin: 3, pointsDraw: 1, pointsLoss: 0 },
    },
  });

  // Enroll all 8 teams
  await Promise.all(
    teams.map((team) =>
      prisma.tournamentTeam.upsert({
        where: { tournamentId_teamId: { tournamentId: league.id, teamId: team.id } },
        update: {},
        create: { tournamentId: league.id, teamId: team.id },
      })
    )
  );

  // Generate round-robin fixtures
  const existingMatches = await prisma.match.count({ where: { tournamentId: league.id } });
  if (existingMatches === 0) {
    const fixtures = generateRoundRobin(teams.map((t) => t.id));
    await prisma.match.createMany({
      data: fixtures.map((f) => ({
        tournamentId: league.id,
        homeTeamId: f.homeTeamId,
        awayTeamId: f.awayTeamId,
        round: f.round,
        stage: "GROUP",
        status: "SCHEDULED",
      })),
    });
    console.log(`Created ${fixtures.length} league fixtures`);
  }

  // KNOCKOUT tournament (draft)
  await prisma.tournament.upsert({
    where: { id: "seed-knockout-2025" },
    update: {},
    create: {
      id: "seed-knockout-2025",
      name: "Cup 2025",
      season: 2025,
      format: "KNOCKOUT",
      status: "DRAFT",
      settings: {},
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
