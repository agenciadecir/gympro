import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Solo importar adaptadores dinámicamente cuando se necesiten
async function getPrismaClient(): Promise<PrismaClient> {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  // Si estamos en build o no hay credenciales, usar cliente básico
  if (!databaseUrl || !tursoAuthToken) {
    console.log('Creating basic PrismaClient (no Turso credentials)')
    const client = new PrismaClient({ log: ['error'] })
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }
    return client
  }

  // Importar adaptadores solo cuando hay credenciales
  const { PrismaLibSql } = await import('@prisma/adapter-libsql')
  const { createClient } = await import('@libsql/client')

  const libsql = createClient({
    url: databaseUrl,
    authToken: tursoAuthToken,
  })

  // @ts-expect-error - Type mismatch in adapter
  const adapter = new PrismaLibSql(libsql)
  const client = new PrismaClient({ adapter, log: ['error'] })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  
  return client
}

// Lazy-loading del cliente
let clientPromise: Promise<PrismaClient> | null = null

export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!clientPromise) {
      clientPromise = getPrismaClient()
    }
    return (...args: unknown[]) => 
      clientPromise!.then(client => {
        const method = (client as Record<string, unknown>)[prop as string]
        if (typeof method === 'function') {
          return method.apply(client, args)
        }
        return method
      })
  }
})