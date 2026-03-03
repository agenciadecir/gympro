import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log database connection info for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('=== DB INIT ===')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')
  console.log('DIRECT_DATABASE_URL:', process.env.DIRECT_DATABASE_URL ? 'SET' : 'NOT SET')
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db