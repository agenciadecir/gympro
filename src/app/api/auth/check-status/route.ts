import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST - Check user status before login
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        isActive: true,
        bannedAt: true,
        role: true
      }
    })

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({ status: "ok" })
    }

    if (!user.isActive || user.bannedAt) {
      return NextResponse.json({ 
        status: "banned",
        message: "Tu cuenta ha sido bloqueada. Contacta al administrador."
      }, { status: 403 })
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error checking user status:", error)
    return NextResponse.json({ error: "Error al verificar estado" }, { status: 500 })
  }
}
