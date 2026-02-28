import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// PUT - Update an exercise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, sets, reps, weight, weightUnit, notes, order } = body

    // Verify ownership through routine
    const exercise = await db.exercise.findFirst({
      where: { id },
      include: {
        workoutDay: {
          include: { routine: true }
        }
      }
    })

    if (!exercise || exercise.workoutDay.routine.userId !== session.user.id) {
      return NextResponse.json({ error: "Ejercicio no encontrado" }, { status: 404 })
    }

    const updatedExercise = await db.exercise.update({
      where: { id },
      data: { name, sets, reps, weight, weightUnit, notes, order }
    })

    return NextResponse.json(updatedExercise)
  } catch (error) {
    console.error("Error updating exercise:", error)
    return NextResponse.json({ error: "Error al actualizar ejercicio" }, { status: 500 })
  }
}

// DELETE - Delete an exercise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership through routine
    const exercise = await db.exercise.findFirst({
      where: { id },
      include: {
        workoutDay: {
          include: { routine: true }
        }
      }
    })

    if (!exercise || exercise.workoutDay.routine.userId !== session.user.id) {
      return NextResponse.json({ error: "Ejercicio no encontrado" }, { status: 404 })
    }

    await db.exercise.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting exercise:", error)
    return NextResponse.json({ error: "Error al eliminar ejercicio" }, { status: 500 })
  }
}
