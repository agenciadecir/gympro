import { PrismaClient } from '@prisma/client'

// No crear el cliente al importar - usar lazy initialization
let prismaClient: PrismaClient | null = null

function getClient(): PrismaClient {
  // Si ya existe, retornarlo
  if (prismaClient) {
    return prismaClient
  }

  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  console.log('=== DB INIT ===')
  console.log('DATABASE_URL:', databaseUrl || 'UNDEFINED')
  console.log('TURSO_AUTH_TOKEN:', tursoAuthToken ? 'SET' : 'UNDEFINED')

  // Crear cliente con Turso si hay credenciales
  if (databaseUrl && tursoAuthToken && databaseUrl.startsWith('libsql://')) {
    console.log('Creating PrismaClient with Turso adapter')
    
    const { createClient } = require('@libsql/client')
    const { PrismaLibSql } = require('@prisma/adapter-libsql')
    
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    
    const adapter = new PrismaLibSql(libsql)
    prismaClient = new PrismaClient({ adapter, log: ['error'] })
  } else {
    console.log('Creating PrismaClient without Turso (fallback)')
    prismaClient = new PrismaClient({ log: ['error'] })
  }

  return prismaClient
}

// Exportar un proxy que crea el cliente cuando se accede a cualquier propiedad
export const db = new Proxy({} as PrismaClient, {
  get(_, prop: string) {
    const client = getClient()
    // Convertir a unknown primero, luego a Record
    const value = (client as unknown as Record<string, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})