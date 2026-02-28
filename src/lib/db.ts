import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

let prismaClient: PrismaClient | null = null

export function getPrismaClient(): PrismaClient {
  if (prismaClient) {
    return prismaClient
  }

  const databaseUrl = process.env.DATABASE_URL
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

  console.log('=== PRISMA DEBUG ===')
  console.log('DATABASE_URL value:', databaseUrl)
  console.log('DATABASE_URL type:', typeof databaseUrl)
  console.log('TURSO_AUTH_TOKEN exists:', !!tursoAuthToken)
  console.log('===================')

  if (databaseUrl && tursoAuthToken) {
    console.log('Creating LibSQL client with URL:', databaseUrl)
    
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoAuthToken,
    })
    
    console.log('LibSQL client created successfully')
    
    const adapter = new PrismaLibSql(libsql)
    console.log('Adapter created, now creating PrismaClient...')
    
    prismaClient = new PrismaClient({ 
      adapter,
      log: ['query', 'error', 'warn'],
    })
    
    console.log('PrismaClient created successfully')
  } else {
    console.log('WARNING: Creating PrismaClient without Turso adapter')
    prismaClient = new PrismaClient({ log: ['error'] })
  }

  return prismaClient
}

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