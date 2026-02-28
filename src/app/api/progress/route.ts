import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get all progress records for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const progress = await db.physicalProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Error al obtener progreso" }, { status: 500 })
  }
}

// POST - Create a new progress record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const {
      date,
      bodyWeight,
      backMeasurement,
      chestMeasurement,
      leftArmMeasurement,
      rightArmMeasurement,
      abdomenMeasurement,
      glutesMeasurement,
      rightLegMeasurement,
      leftLegMeasurement,
      frontPhoto,
      sidePhoto,
      backPhoto,
      extraPhoto,
      notes
    } = body

    const progress = await db.physicalProgress.create({
      data: {
        date: date ? new Date(date) : new Date(),
        bodyWeight,
        backMeasurement,
        chestMeasurement,
        leftArmMeasurement,
        rightArmMeasurement,
        abdomenMeasurement,
        glutesMeasurement,
        rightLegMeasurement,
        leftLegMeasurement,
        frontPhoto,
        sidePhoto,
        backPhoto,
        extraPhoto,
        notes,
        userId: session.user.id
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error creating progress:", error)
    return NextResponse.json({ error: "Error al crear registro de progreso" }, { status: 500 })
  }
}
