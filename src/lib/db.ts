import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  // Si tenemos Turso credentials, usar adaptador
  if (databaseUrl && databaseUrl.startsWith('libsql://') && tursoAuthToken) {
    try {
      const libsql = createClient({
        url: databaseUrl,
        authToken: tursoAuthToken,
      })
      const adapter = new PrismaLibSql(libsql)
      return new PrismaClient({ 
        adapter,
        log: ['error'],
      })
    } catch (error) {
      console.error('Error creating Turso client:', error)
    }
  }

  // Fallback: SQLite local
  return new PrismaClient({
    log: ['error'],
  })
}

// En producción, crear una sola instancia
// En desarrollo, usar global para hot reload
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}