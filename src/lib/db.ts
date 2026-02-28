import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

// Singleton para el cliente Prisma
let prismaClient: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  // Si ya existe, retornarlo
  if (prismaClient) {
    return prismaClient
  }

  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  console.log('Initializing Prisma Client...')
  console.log('DATABASE_URL:', databaseUrl ? 'SET' : 'UNDEFINED')
  console.log('TURSO_AUTH_TOKEN:', tursoAuthToken ? 'SET' : 'UNDEFINED')

  // Crear cliente con Turso
  if (databaseUrl && tursoAuthToken) {
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    const adapter = new PrismaLibSql(libsql)
    prismaClient = new PrismaClient({ 
      adapter,
      log: ['error', 'warn'],
    })
  } else {
    // Fallback para build/desarrollo sin credenciales
    prismaClient = new PrismaClient({ log: ['error'] })
  }

  return prismaClient
}

// Exportar función en lugar de instancia
export const db = {
  get user() { return getPrismaClient().user },
  get routine() { return getPrismaClient().routine },
  get workoutDay() { return getPrismaClient().workoutDay },
  get exercise() { return getPrismaClient().exercise },
  get physicalProgress() { return getPrismaClient().physicalProgress },
  get diet() { return getPrismaClient().diet },
  get meal() { return getPrismaClient().meal },
  get mealItem() { return getPrismaClient().mealItem },
  get recipe() { return getPrismaClient().recipe },
  $connect: () => getPrismaClient().$connect(),
  $disconnect: () => getPrismaClient().$disconnect(),
  $transaction: <T>(fn: (client: PrismaClient) => Promise<T>) => getPrismaClient().$transaction(fn),
}