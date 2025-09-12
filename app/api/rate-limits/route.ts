import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // En Docker, usar el nombre del contenedor
    const baseUrl = process.env.PHANTOMBUSTER_API_URL || 'http://phantombuster-api:3001';
    const apiKey = process.env.PHANTOMBUSTER_API_KEY || 'dev-api-key-12345';

    // Obtener límites diarios desde la API de PhantomBuster
    const response = await fetch(`${baseUrl}/api/limits/daily`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.success) {
        return NextResponse.json({
          success: true,
          data: data.data,
          timestamp: new Date().toISOString()
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Error obteniendo límites desde la API',
          data: null
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        data: null
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Error fetching rate limits:', error);

    return NextResponse.json({
      success: false,
      error: 'Error de conexión al obtener límites',
      data: null
    }, { status: 500 });
  }
}