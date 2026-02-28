import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get all diets for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const archived = searchParams.get("archived") === "true"

    const diets = await db.diet.findMany({
      where: {
        userId: session.user.id,
        isArchived: archived
      },
      include: {
        meals: {
          orderBy: { mealType: "asc" },
          include: {
            items: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(diets)
  } catch (error) {
    console.error("Error fetching diets:", error)
    return NextResponse.json({ error: "Error al obtener dietas" }, { status: 500 })
  }
}

// POST - Create a new diet
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, meals, totalCalories, totalProtein, totalCarbs, totalFat, dietType } = body

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    const diet = await db.diet.create({
      data: {
        name,
        description,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        dietType: dietType || "training_day",
        isActive: true,
        userId: session.user.id,
        meals: meals ? {
          create: meals.map((meal: any) => ({
            mealType: meal.mealType,
            name: meal.name,
            time: meal.time,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            items: meal.items ? {
              create: meal.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit || "g",
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat
              }))
            } : undefined
          }))
        } : undefined
      },
      include: {
        meals: {
          include: {
            items: true
          }
        }
      }
    })

    // Set as active diet
    await db.user.update({
      where: { id: session.user.id },
      data: { activeDietId: diet.id }
    })

    return NextResponse.json(diet)
  } catch (error) {
    console.error("Error creating diet:", error)
    return NextResponse.json({ error: "Error al crear dieta" }, { status: 500 })
  }
}
