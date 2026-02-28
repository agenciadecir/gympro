import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'UNDEFINED',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET (length: ' + process.env.TURSO_AUTH_TOKEN.length + ')' : 'UNDEFINED',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'UNDEFINED',
    NODE_ENV: process.env.NODE_ENV,
  })
}