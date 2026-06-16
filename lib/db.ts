import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
