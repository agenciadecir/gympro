import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Create a new exercise
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { workoutDayId, name, sets, reps, weight, weightUnit, notes } = body

    if (!workoutDayId || !name) {
      return NextResponse.json({ error: "ID de día y nombre son requeridos" }, { status: 400 })
    }

    // Verify ownership through routine
    const day = await db.workoutDay.findFirst({
      where: { id: workoutDayId },
      include: { routine: true }
    })

    if (!day || day.routine.userId !== session.user.id) {
      return NextResponse.json({ error: "Día no encontrado" }, { status: 404 })
    }

    // Get current max order
    const maxOrder = await db.exercise.findFirst({
      where: { workoutDayId },
      orderBy: { order: "desc" },
      select: { order: true }
    })

    const exercise = await db.exercise.create({
      data: {
        name,
        sets,
        reps,
        weight,
        weightUnit: weightUnit || "kg",
        notes,
        order: (maxOrder?.order || 0) + 1,
        workoutDayId
      }
    })

    return NextResponse.json(exercise)
  } catch (error) {
    console.error("Error creating exercise:", error)
    return NextResponse.json({ error: "Error al crear ejercicio" }, { status: 500 })
  }
}
