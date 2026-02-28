import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let cachedClient: PrismaClient | null = null

export function getDb(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  // Si ya tenemos un cliente cached y las credenciales están disponibles
  if (cachedClient && databaseUrl && tursoAuthToken) {
    return cachedClient
  }

  // Crear nuevo cliente
  if (databaseUrl && databaseUrl.startsWith('libsql://') && tursoAuthToken) {
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    const adapter = new PrismaLibSql(libsql)
    cachedClient = new PrismaClient({ 
      adapter,
      log: ['error'],
    })
    return cachedClient
  }

  // Fallback
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ log: ['error'] })
  }
  return globalForPrisma.prisma
}

// Exportar como db para compatibilidad, pero usando getter
export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getDb()
    const value = client[prop as keyof PrismaClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})