import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const isTurso = process.env.TURSO_AUTH_TOKEN || 
                  process.env.DATABASE_URL?.startsWith('libsql://')

  if (isTurso && process.env.DATABASE_URL) {
    const libsql = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db