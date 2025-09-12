import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // En Docker, usar el nombre del contenedor
    const baseUrl = process.env.PHANTOMBUSTER_API_URL || 'http://phantombuster-api:3001';
    const apiKey = process.env.PHANTOMBUSTER_API_KEY || 'dev-api-key-12345';

    // Verificar estado de Phantombuster
    const phantombusterResponse = await fetch(`${baseUrl}/api/phantombuster/status`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    // Verificar estado de Axonaut
    const axonautResponse = await fetch(`${baseUrl}/api/axonaut/test-connection`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    // Verificar errores conocidos
    const errorsResponse = await fetch(`${baseUrl}/api/known-errors/statistics`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    let errors: any[] = [];
    let isOnline = false;
    let axonautStatus = {
      isConnected: false,
      status: 'offline' as 'online' | 'offline' | 'error' | 'timeout',
      apiKeyConfigured: false,
      errorMessage: ''
    };

    // Procesar estado de Phantombuster
    if (phantombusterResponse.ok) {
      const phantombusterData = await phantombusterResponse.json();
      if (phantombusterData.success && phantombusterData.data) {
        const phantombusterStatus = phantombusterData.data;
        isOnline = phantombusterStatus.isOnline || false;

        // Solo agregar error de créditos si realmente no hay créditos
        if (phantombusterStatus.connectivity && !phantombusterStatus.connectivity.hasCredits) {
          errors.push({
            id: `phantombuster_credits_${Date.now()}`,
            type: 'credits_exhausted',
            message: phantombusterStatus.connectivity.errorMessage || '⚠️ Créditos de ejecución agotados en Phantombuster',
            severity: 'warning',
            timestamp: new Date().toISOString(),
            recommendations: [
              'Actualizar el plan de Phantombuster',
              'Esperar hasta el próximo reset mensual',
              'Contactar soporte de Phantombuster'
            ],
            affectedAgents: [
              'LinkedIn Profile Visitor',
              'LinkedIn Autoconnect',
              'LinkedIn Message Sender'
            ]
          });
        }
      } else {
        isOnline = false;
      }
    } else {
      isOnline = false;
    }

    // Procesar estado de Axonaut
    if (axonautResponse.ok) {
      const axonautData = await axonautResponse.json();
      if (axonautData.success) {
        axonautStatus = {
          isConnected: true,
          status: 'online',
          apiKeyConfigured: axonautData.data.api_key === 'configured',
          errorMessage: ''
        };
      } else {
        axonautStatus = {
          isConnected: false,
          status: 'error',
          apiKeyConfigured: axonautData.data.api_key === 'configured',
          errorMessage: axonautData.message
        };
      }
    } else {
      axonautStatus = {
        isConnected: false,
        status: 'offline',
        apiKeyConfigured: false,
        errorMessage: `HTTP ${axonautResponse.status}: ${axonautResponse.statusText}`
      };
    }

    // Verificar errores de créditos específicamente
    const creditsErrorsResponse = await fetch(`${baseUrl}/api/known-errors/by-type/credits_exhausted`, {
      headers: {
        'X-API-Key': apiKey
      }
    });

    // Procesar errores de créditos solo si existen en la base de datos
    if (creditsErrorsResponse.ok) {
      const creditsData = await creditsErrorsResponse.json();
      if (creditsData.data && creditsData.data.errors && creditsData.data.errors.length > 0) {
        creditsData.data.errors.forEach((error: any) => {
          if (!error.is_resolved) {
            errors.push({
              id: error.container_id || `credit_error_${Date.now()}`,
              type: 'credits_exhausted',
              message: '⚠️ Créditos de ejecución agotados en Phantombuster',
              severity: 'warning',
              timestamp: error.created_at,
              recommendations: [
                'Actualizar el plan de Phantombuster',
                'Esperar hasta el próximo reset mensual',
                'Contactar soporte de Phantombuster'
              ],
              affectedAgents: [
                'LinkedIn Profile Visitor',
                'LinkedIn Autoconnect',
                'LinkedIn Message Sender'
              ]
            });
          }
        });
      }
    }

    // Procesar otros errores
    if (errorsResponse.ok) {
      const errorsData = await errorsResponse.json();
      if (errorsData.data && errorsData.data.statistics) {
        errorsData.data.statistics.forEach((stat: any) => {
          // Log específico para rate limit errors
          if (stat.error_type === 'rate_limit_error') {
            console.log('🚦 RATE LIMIT ERROR DETAILS:', {
              error_type: stat.error_type,
              unresolved_errors: stat.unresolved_errors,
              total_occurrences: stat.total_occurrences,
              last_occurrence: stat.last_occurrence,
              full_stat: stat
            });
          }

          // Solo mostrar errores críticos del sistema
          const criticalErrorTypes = [
            'authentication_error',
            'permission_error',
            'agent_not_found',
            'connectivity_error',
            'rate_limit_error',
            'argument_validation_error'
          ];

          if (criticalErrorTypes.includes(stat.error_type) && parseInt(stat.unresolved_errors) > 0) {
            errors.push({
              id: `error_${stat.error_type}_${Date.now()}`,
              type: stat.error_type,
              message: `⚠️ ${stat.unresolved_errors} errores no resueltos de tipo: ${stat.error_type}`,
              severity: parseInt(stat.unresolved_errors) > 5 ? 'high' : 'medium',
              timestamp: stat.last_occurrence || new Date().toISOString(),
              recommendations: [
                'Revisar los logs del sistema',
                'Contactar soporte técnico',
                'Verificar la configuración'
              ]
            });
          }
        });
      }
    }

    const criticalErrors = errors.filter(error => error.severity === 'critical').length;
    const hasActiveErrors = errors.length > 0 || axonautStatus.status !== 'online';

    return NextResponse.json({
      success: true,
      data: {
        isOnline,
        lastCheck: new Date().toISOString(),
        errors,
        totalErrors: errors.length,
        criticalErrors,
        hasActiveErrors,
        axonautStatus
      }
    });

  } catch (error) {
    console.error('Error fetching system status:', error);

    return NextResponse.json({
      success: false,
      error: 'Error fetching system status',
      data: {
        isOnline: false,
        lastCheck: new Date().toISOString(),
        errors: [],
        totalErrors: 0,
        criticalErrors: 0,
        hasActiveErrors: true,
        axonautStatus: {
          isConnected: false,
          status: 'offline',
          apiKeyConfigured: false,
          errorMessage: 'Error de conexión'
        }
      }
    }, { status: 500 });
  }
}
