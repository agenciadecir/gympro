import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  if (databaseUrl && tursoAuthToken && databaseUrl.startsWith('libsql://')) {
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    const adapter = new PrismaLibSql(libsql as Parameters<typeof PrismaLibSql>[0])
    return new PrismaClient({ adapter, log: ['error'] })
  }

  return new PrismaClient({ log: ['error'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db