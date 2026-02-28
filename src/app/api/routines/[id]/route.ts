import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get a specific routine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const routine = await db.routine.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" }
            }
          }
        }
      }
    })

    if (!routine) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    return NextResponse.json(routine)
  } catch (error) {
    console.error("Error fetching routine:", error)
    return NextResponse.json({ error: "Error al obtener rutina" }, { status: 500 })
  }
}

// PUT - Update a routine
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
    const { name, description, isActive, isArchived, days } = body

    // Verify ownership
    const existingRoutine = await db.routine.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingRoutine) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    // Update routine
    const routine = await db.routine.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        isArchived,
      },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" }
            }
          }
        }
      }
    })

    // If setting as active, update user
    if (isActive) {
      await db.user.update({
        where: { id: session.user.id },
        data: { activeRoutineId: id }
      })
    }
    
    // If archiving or deactivating, clear the activeRoutineId from user
    if (isActive === false && existingRoutine.isActive) {
      await db.user.update({
        where: { id: session.user.id },
        data: { activeRoutineId: null }
      })
    }

    return NextResponse.json(routine)
  } catch (error) {
    console.error("Error updating routine:", error)
    return NextResponse.json({ error: "Error al actualizar rutina" }, { status: 500 })
  }
}

// DELETE - Delete a routine
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

    // Verify ownership
    const routine = await db.routine.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!routine) {
      return NextResponse.json({ error: "Rutina no encontrada" }, { status: 404 })
    }

    // Delete routine (cascade will delete days and exercises)
    await db.routine.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting routine:", error)
    return NextResponse.json({ error: "Error al eliminar rutina" }, { status: 500 })
  }
}
