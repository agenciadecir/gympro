import { PrismaClient } from '@prisma/client'

let prismaClient: PrismaClient | null = null

function getClient(): PrismaClient {
  if (prismaClient) {
    return prismaClient
  }

  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  console.log('=== DB INIT ===')
  console.log('DATABASE_URL:', databaseUrl || 'UNDEFINED')
  console.log('TURSO_AUTH_TOKEN:', tursoAuthToken ? 'SET' : 'UNDEFINED')

  // Siempre usar Turso si hay credenciales
  if (databaseUrl && tursoAuthToken && databaseUrl.startsWith('libsql://')) {
    console.log('Creating PrismaClient with Turso adapter')
    
    try {
      const { createClient } = require('@libsql/client')
      const { PrismaLibSql } = require('@prisma/adapter-libsql')
      
      const libsql = createClient({
        url: databaseUrl,
        authToken: tursoAuthToken,
      })
      
      const adapter = new PrismaLibSql(libsql)
      prismaClient = new PrismaClient({ adapter, log: ['error', 'warn', 'query'] })
      console.log('PrismaClient created successfully with adapter')
      return prismaClient
    } catch (error) {
      console.error('Failed to create Turso adapter:', error)
    }
  }

  console.log('Creating PrismaClient without adapter (fallback)')
  prismaClient = new PrismaClient({ log: ['error'] })
  return prismaClient
}

export const db = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    const client = getClient()
    const value = (client as unknown as Record<string, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})