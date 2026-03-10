import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get progress records for a specific user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const progress = await db.physicalProgress.findMany({
      where: { userId: id },
      orderBy: { date: "desc" }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return NextResponse.json({ error: "Error al obtener progreso del usuario" }, { status: 500 })
  }
}
