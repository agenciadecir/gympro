import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  console.log('=== DB INIT ===')
  console.log('DATABASE_URL:', databaseUrl)
  console.log('TURSO_AUTH_TOKEN:', tursoAuthToken ? 'SET' : 'UNDEFINED')

  // Si tenemos credenciales de Turso, usar el adapter
  if (databaseUrl?.startsWith('libsql://') && tursoAuthToken) {
    console.log('Using Turso adapter')
    
    const { createClient } = require('@libsql/client')
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter, log: ['error'] })
  }

  // Fallback a SQLite local
  console.log('Using local SQLite')
  return new PrismaClient({ log: ['error'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}