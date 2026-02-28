import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN
  
  // Si no hay DATABASE_URL, usar SQLite local (para build)
  if (!databaseUrl) {
    console.warn('DATABASE_URL not found, using mock client for build')
    return new PrismaClient({
      log: ['error'],
    })
  }
  
  // Si hay TURSO_AUTH_TOKEN, usar Turso
  if (tursoAuthToken) {
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  
  // Fallback a SQLite normal
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db