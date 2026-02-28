import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// POST - Create or update a meal with description and macros
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { dietId, mealType, description, calories, protein, carbs, fat, fiber } = body

    if (!dietId || !mealType) {
      return NextResponse.json({ error: "ID de dieta y tipo de comida son requeridos" }, { status: 400 })
    }

    // Verify ownership
    const diet = await db.diet.findFirst({
      where: { id: dietId, userId: session.user.id }
    })

    if (!diet) {
      return NextResponse.json({ error: "Dieta no encontrada" }, { status: 404 })
    }

    // Check if meal already exists for this type
    const existingMeal = await db.meal.findFirst({
      where: { dietId, mealType }
    })

    let meal
    if (existingMeal) {
      // Update existing meal
      meal = await db.meal.update({
        where: { id: existingMeal.id },
        data: {
          description,
          calories,
          protein,
          carbs,
          fat,
          fiber
        }
      })
    } else {
      // Create new meal
      meal = await db.meal.create({
        data: {
          mealType,
          description,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          dietId
        }
      })
    }

    // Update diet totals
    const allMeals = await db.meal.findMany({ where: { dietId } })
    const totals = allMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
      fiber: acc.fiber + (meal.fiber || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

    // Add new meal values if it was just created
    if (!existingMeal) {
      totals.calories += calories || 0
      totals.protein += protein || 0
      totals.carbs += carbs || 0
      totals.fat += fat || 0
      totals.fiber += fiber || 0
    }

    await db.diet.update({
      where: { id: dietId },
      data: {
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber
      }
    })

    return NextResponse.json(meal)
  } catch (error) {
    console.error("Error creating/updating meal:", error)
    return NextResponse.json({ error: "Error al guardar comida" }, { status: 500 })
  }
}
