import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get a specific progress record
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

    const progress = await db.physicalProgress.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!progress) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error fetching progress:", error)
    return NextResponse.json({ error: "Error al obtener progreso" }, { status: 500 })
  }
}

// PUT - Update a progress record
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

    // Verify ownership
    const existingProgress = await db.physicalProgress.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!existingProgress) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    const progress = await db.physicalProgress.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        bodyWeight: body.bodyWeight,
        backMeasurement: body.backMeasurement,
        chestMeasurement: body.chestMeasurement,
        leftArmMeasurement: body.leftArmMeasurement,
        rightArmMeasurement: body.rightArmMeasurement,
        abdomenMeasurement: body.abdomenMeasurement,
        glutesMeasurement: body.glutesMeasurement,
        rightLegMeasurement: body.rightLegMeasurement,
        leftLegMeasurement: body.leftLegMeasurement,
        frontPhoto: body.frontPhoto,
        sidePhoto: body.sidePhoto,
        backPhoto: body.backPhoto,
        extraPhoto: body.extraPhoto,
        notes: body.notes
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error updating progress:", error)
    return NextResponse.json({ error: "Error al actualizar progreso" }, { status: 500 })
  }
}

// DELETE - Delete a progress record
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
    const progress = await db.physicalProgress.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!progress) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    await db.physicalProgress.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting progress:", error)
    return NextResponse.json({ error: "Error al eliminar progreso" }, { status: 500 })
  }
}
