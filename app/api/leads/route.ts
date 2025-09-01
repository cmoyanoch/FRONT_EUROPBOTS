import { getLeadsStats, getLeadsWithFilters } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const process = searchParams.get("process") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Obtener leads con filtros
    const { leads, total } = await getLeadsWithFilters(
      searchTerm,
      status,
      process,
      limit,
      offset
    );

    // Obtener estadísticas
    const stats = await getLeadsStats();

    return NextResponse.json({
      success: true,
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error) {
    console.error("Error en API /api/leads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, leadId, status } = body;

    switch (action) {
      case "updateStatus":
        // Aquí implementarías la lógica para actualizar el estado
        return NextResponse.json({
          success: true,
          message: "Estado actualizado",
        });

      case "delete":
        // Aquí implementarías la lógica para eliminar
        return NextResponse.json({ success: true, message: "Lead eliminado" });

      default:
        return NextResponse.json(
          { success: false, error: "Acción no válida" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error en API /api/leads POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
