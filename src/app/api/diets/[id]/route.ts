import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get a specific diet
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

    const diet = await db.diet.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        meals: {
          orderBy: { mealType: "asc" },
          include: {
            items: {
              orderBy: { createdAt: "asc" }
            }
          }
        }
      }
    })

    if (!diet) {
      return NextResponse.json({ error: "Dieta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(diet)
  } catch (error) {
    console.error("Error fetching diet:", error)
    return NextResponse.json({ error: "Error al obtener dieta" }, { status: 500 })
  }
}

// PUT - Update a diet
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
    const { name, description, isActive, isArchived, startDate, endDate, totalCalories, totalProtein, totalCarbs, totalFat, totalFiber, vitaminA, vitaminC, vitaminD, calcium, iron } = body

    // Verify ownership
    const existingDiet = await db.diet.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingDiet) {
      return NextResponse.json({ error: "Dieta no encontrada" }, { status: 404 })
    }

    const diet = await db.diet.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        isArchived,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
        vitaminA,
        vitaminC,
        vitaminD,
        calcium,
        iron
      },
      include: {
        meals: {
          include: {
            items: true
          }
        }
      }
    })

    // If setting as active, update user
    if (isActive) {
      await db.user.update({
        where: { id: session.user.id },
        data: { activeDietId: id }
      })
    }
    
    // If archiving or deactivating, clear the activeDietId from user
    if (isActive === false && existingDiet.isActive) {
      await db.user.update({
        where: { id: session.user.id },
        data: { activeDietId: null }
      })
    }

    return NextResponse.json(diet)
  } catch (error) {
    console.error("Error updating diet:", error)
    return NextResponse.json({ error: "Error al actualizar dieta" }, { status: 500 })
  }
}

// DELETE - Delete a diet
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
    const diet = await db.diet.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!diet) {
      return NextResponse.json({ error: "Dieta no encontrada" }, { status: 404 })
    }

    await db.diet.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting diet:", error)
    return NextResponse.json({ error: "Error al eliminar dieta" }, { status: 500 })
  }
}
