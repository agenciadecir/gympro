import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Solo importar adaptadores si tenemos las credenciales
async function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN
  
  // Si tenemos credenciales de Turso, usar el adaptador
  if (databaseUrl && databaseUrl.startsWith('libsql://') && tursoAuthToken) {
    const { PrismaLibSql } = await import('@prisma/adapter-libsql')
    const { createClient } = await import('@libsql/client')
    
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ 
      adapter,
      log: ['error'],
    })
  }
  
  // Fallback: SQLite local o mock para build
  return new PrismaClient({
    log: ['error'],
  })
}

// Lazy initialization - solo crear cuando se necesite
let prismaPromise: Promise<PrismaClient> | null = null

export const db = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      if (!prismaPromise) {
        prismaPromise = createPrismaClient().then(client => {
          globalForPrisma.prisma = client
          return client
        })
      }
      // Para métodos async, esperamos a que el cliente esté listo
      return (...args: unknown[]) => 
        prismaPromise!.then(client => 
          (client as Record<string, unknown>)[prop as string](...args)
        )
    }
    return (globalForPrisma.prisma as Record<string, unknown>)[prop as string]
  }
})