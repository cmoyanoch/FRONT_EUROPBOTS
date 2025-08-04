import pool from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener un template específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      "SELECT * FROM message_templates WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Template no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error obteniendo template:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, content, sector, type, is_active } = body;

    // Validaciones
    if (!name || !content || !sector) {
      return NextResponse.json(
        { success: false, error: "Nombre, contenido y sector son requeridos" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE message_templates
       SET name = $1, content = $2, sector = $3, type = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        name,
        content,
        sector,
        type,
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Template no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: "Template actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error actualizando template:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      "DELETE FROM message_templates WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Template no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando template:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
