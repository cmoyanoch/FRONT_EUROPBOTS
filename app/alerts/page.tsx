'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, AlertTriangle, CheckCircle, Info, X, Clock, Settings } from 'lucide-react'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Budget Limit Approaching',
      message: 'Profile visits reaching 75% of daily limit. Consider reducing activity.',
      timestamp: '2024-01-15 15:30',
      read: false,
      action: 'reduce_activity'
    },
    {
      id: 2,
      type: 'success',
      title: 'New Meeting Booked',
      message: 'Demo meeting scheduled with Jean Dupont from Hotel Grand Paris for January 20th.',
      timestamp: '2024-01-15 14:45',
      read: false,
      action: 'view_meeting'
    },
    {
      id: 3,
      type: 'error',
      title: 'PhantomBuster Tool Error',
      message: 'Search Export tool failed to execute. Check API connection and retry.',
      timestamp: '2024-01-15 13:20',
      read: true,
      action: 'retry_tool'
    },
    {
      id: 4,
      type: 'info',
      title: 'High Performance Alert',
      message: 'Acceptance rate increased to 52%. Consider scaling up activity.',
      timestamp: '2024-01-15 12:15',
      read: true,
      action: 'scale_up'
    },
    {
      id: 5,
      type: 'warning',
      title: 'LinkedIn Session Expiring',
      message: 'LinkedIn session will expire in 2 hours. Please refresh to maintain automation.',
      timestamp: '2024-01-15 11:30',
      read: false,
      action: 'refresh_session'
    }
  ])

  const [filterType, setFilterType] = useState('all')
  const [showRead, setShowRead] = useState(true)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'info': return <Info className="w-5 h-5 text-blue-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'success': return 'border-green-200 bg-green-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getActionButton = (action: string) => {
    switch (action) {
      case 'reduce_activity':
        return <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-300">Reducir Actividad</Button>
      case 'view_meeting':
        return <Button size="sm" className="bg-green-600 hover:bg-green-700">Ver Reunión</Button>
      case 'retry_tool':
        return <Button size="sm" className="bg-red-600 hover:bg-red-700">Reintentar</Button>
      case 'scale_up':
        return <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Escalar</Button>
      case 'refresh_session':
        return <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">Refrescar</Button>
      default:
        return <Button size="sm" variant="outline">Ver Detalles</Button>
    }
  }

  const markAsRead = (id: number) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      )
    )
  }

  const deleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = filterType === 'all' || alert.type === filterType
    const matchesRead = showRead || !alert.read
    return matchesType && matchesRead
  })

  const unreadCount = alerts.filter(alert => !alert.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔔 Sistema de Alertas
          </h1>
          <p className="text-gray-600">
            Notificaciones y alertas del sistema de automatización
          </p>
        </div>

        {/* Estadísticas de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Alertas</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">No Leídas</p>
                  <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resueltas</p>
                  <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => a.read).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {alerts.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                >
                  Todas
                </Button>
                <Button
                  variant={filterType === 'error' ? 'default' : 'outline'}
                  onClick={() => setFilterType('error')}
                  className="text-red-600 border-red-300"
                >
                  Errores
                </Button>
                <Button
                  variant={filterType === 'warning' ? 'default' : 'outline'}
                  onClick={() => setFilterType('warning')}
                  className="text-yellow-600 border-yellow-300"
                >
                  Advertencias
                </Button>
                <Button
                  variant={filterType === 'success' ? 'default' : 'outline'}
                  onClick={() => setFilterType('success')}
                  className="text-green-600 border-green-300"
                >
                  Éxitos
                </Button>
                <Button
                  variant={filterType === 'info' ? 'default' : 'outline'}
                  onClick={() => setFilterType('info')}
                  className="text-blue-600 border-blue-300"
                >
                  Información
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show-read"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="show-read" className="text-sm text-gray-600">
                  Mostrar leídas
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Alertas */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getTypeColor(alert.type)} ${!alert.read ? 'ring-2 ring-blue-200' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        {!alert.read && (
                          <span className="text-blue-600 font-medium">Nueva</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getActionButton(alert.action)}
                    {!alert.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        Marcar como leída
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
              <p className="text-gray-600">No hay alertas que coincidan con los filtros seleccionados.</p>
            </CardContent>
          </Card>
        )}

        {/* Configuración de Alertas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración de Alertas
            </CardTitle>
            <CardDescription>
              Personaliza las notificaciones y alertas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Tipos de Alerta</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    Errores del sistema
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    Límites de presupuesto
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    Nuevas oportunidades
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    Alertas de rendimiento
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Notificaciones</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    Notificaciones por email
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    Notificaciones push
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Notificaciones SMS
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-2" />
                    Alertas en tiempo real
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button className="bg-europbots-blue hover:bg-europbots-blue-dark">
                <Settings className="w-4 h-4 mr-2" />
                Guardar Configuración
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 