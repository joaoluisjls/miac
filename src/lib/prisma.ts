import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // In production (Vercel), use Neon
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient({
      log: ['error'],
    });
  }
  // In development, use local connection
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
