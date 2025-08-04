import pool from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get("sector");
    const type = searchParams.get("type");
    const isActive = searchParams.get("is_active");

    let query = "SELECT * FROM webapp.message_templates WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (sector) {
      query += ` AND sector = $${paramIndex}`;
      params.push(sector);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (isActive !== null) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(isActive === "true");
      paramIndex++;
    }

    query += " ORDER BY sector, name";

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error obteniendo templates:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, content, sector, type = "general" } = body;

    // Validaciones
    if (!name || !content || !sector) {
      return NextResponse.json(
        { success: false, error: "Nombre, contenido y sector son requeridos" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "INSERT INTO webapp.message_templates (name, content, sector, type) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, content, sector, type]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: "Template creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando template:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
