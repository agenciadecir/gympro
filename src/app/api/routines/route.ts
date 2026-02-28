import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get all routines for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const archived = searchParams.get("archived") === "true"

    const routines = await db.routine.findMany({
      where: {
        userId: session.user.id,
        isArchived: archived
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
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(routines)
  } catch (error) {
    console.error("Error fetching routines:", error)
    return NextResponse.json({ error: "Error al obtener rutinas" }, { status: 500 })
  }
}

// POST - Create a new routine
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, days } = body

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Create routine with days
    const routine = await db.routine.create({
      data: {
        name,
        description,
        userId: session.user.id,
        isActive: true,
        days: {
          create: (days || []).map((day: { name: string; dayNumber: number; exercises?: any[] }, index: number) => ({
            name: day.name || `Día ${day.dayNumber || index + 1}`,
            dayNumber: day.dayNumber || index + 1,
            exercises: day.exercises ? {
              create: day.exercises.map((ex: any, exIndex: number) => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight,
                weightUnit: ex.weightUnit || "kg",
                notes: ex.notes,
                order: exIndex
              }))
            } : undefined
          }))
        }
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

    // Set as active routine
    await db.user.update({
      where: { id: session.user.id },
      data: { activeRoutineId: routine.id }
    })

    return NextResponse.json(routine)
  } catch (error) {
    console.error("Error creating routine:", error)
    return NextResponse.json({ error: "Error al crear rutina" }, { status: 500 })
  }
}
