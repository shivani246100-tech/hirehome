import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const isPostgres = databaseUrl.startsWith("postgres");

  if (isPostgres) {
    // Cloudflare Workers cannot open raw TCP sockets, so production goes
    // through the Neon serverless driver (HTTP/WebSockets) via the Prisma
    // driver adapter. Local development uses SQLite as usual.
    const adapter = new PrismaNeon({ connectionString: databaseUrl });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
