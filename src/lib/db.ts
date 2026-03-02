import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  // Skip Turso during build or when credentials are missing
  if (process.env.NEXT_PHASE === 'phase-production-build' || !databaseUrl || !tursoAuthToken) {
    return new PrismaClient({ log: ['error'] })
  }

  // Use Turso for production runtime
  if (databaseUrl.startsWith('libsql://')) {
    try {
      // Use require for CommonJS compatibility during build
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createClient } = require('@libsql/client')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaLibSql } = require('@prisma/adapter-libsql')
      
      const libsql = createClient({
        url: databaseUrl,
        authToken: tursoAuthToken,
      })
      
      const adapter = new PrismaLibSql(libsql)
      return new PrismaClient({ adapter, log: ['error'] })
    } catch {
      console.warn('Failed to initialize Turso adapter, using fallback')
    }
  }

  return new PrismaClient({ log: ['error'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}