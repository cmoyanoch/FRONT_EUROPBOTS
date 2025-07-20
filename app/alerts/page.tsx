'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, AlertTriangle, CheckCircle, Info, X, Clock, Settings } from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'

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
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'success': return <CheckCircle className="w-5 h-5 text-europbots-secondary" />
      case 'info': return <Info className="w-5 h-5 text-blue-400" />
      default: return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-400/30 bg-red-500/5'
      case 'warning': return 'border-yellow-400/30 bg-yellow-500/5'
      case 'success': return 'border-europbots-secondary/30 bg-europbots-secondary/5'
      case 'info': return 'border-blue-400/30 bg-blue-500/5'
      default: return 'border-gray-400/30 bg-gray-500/5'
    }
  }

  const getActionButton = (action: string) => {
    switch (action) {
      case 'reduce_activity':
        return <Button size="sm" variant="outline" className="text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10">Reducir Actividad</Button>
      case 'view_meeting':
        return <Button size="sm" className="bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90 shadow-lg shadow-europbots-secondary/25">Ver Reunión</Button>
      case 'retry_tool':
        return <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25">Reintentar</Button>
      case 'scale_up':
        return <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25">Escalar</Button>
      case 'refresh_session':
        return <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/25">Refrescar</Button>
      default:
        return <Button size="sm" variant="outline" className="text-gray-300 border-gray-400/30 hover:bg-white/10">Ver Detalles</Button>
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
    <div className="min-h-screen relative">
      <FuturisticBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-europbots-secondary" />
            Sistema de Alertas
          </h1>
          <p className="text-gray-300">
            Notificaciones y alertas del sistema de automatización
          </p>
        </div>

        {/* Estadísticas de Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-europbots-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Alertas</p>
                  <p className="text-2xl font-bold text-white">{alerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">No Leídas</p>
                  <p className="text-2xl font-bold text-white">{unreadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-europbots-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Resueltas</p>
                  <p className="text-2xl font-bold text-white">{alerts.filter(a => a.read).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Hoy</p>
                  <p className="text-2xl font-bold text-white">
                    {alerts.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  className={filterType === 'all' 
                    ? 'bg-europbots-secondary text-europbots-primary shadow-lg shadow-europbots-secondary/25' 
                    : 'text-gray-300 border-gray-400/30 hover:bg-white/10'
                  }
                >
                  Todas
                </Button>
                <Button
                  variant={filterType === 'error' ? 'default' : 'outline'}
                  onClick={() => setFilterType('error')}
                  className={filterType === 'error' 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                    : 'text-red-400 border-red-400/30 hover:bg-red-500/10'
                  }
                >
                  Errores
                </Button>
                <Button
                  variant={filterType === 'warning' ? 'default' : 'outline'}
                  onClick={() => setFilterType('warning')}
                  className={filterType === 'warning' 
                    ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/25' 
                    : 'text-yellow-400 border-yellow-400/30 hover:bg-yellow-500/10'
                  }
                >
                  Advertencias
                </Button>
                <Button
                  variant={filterType === 'success' ? 'default' : 'outline'}
                  onClick={() => setFilterType('success')}
                  className={filterType === 'success' 
                    ? 'bg-europbots-secondary text-europbots-primary shadow-lg shadow-europbots-secondary/25' 
                    : 'text-europbots-secondary border-europbots-secondary/30 hover:bg-europbots-secondary/10'
                  }
                >
                  Éxitos
                </Button>
                <Button
                  variant={filterType === 'info' ? 'default' : 'outline'}
                  onClick={() => setFilterType('info')}
                  className={filterType === 'info' 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-blue-400 border-blue-400/30 hover:bg-blue-500/10'
                  }
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
                  className="rounded bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary"
                />
                <label htmlFor="show-read" className="text-sm text-gray-300">
                  Mostrar leídas
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Alertas */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`bg-europbots-primary/20 backdrop-blur-md border-l-4 ${getTypeColor(alert.type)} ${!alert.read ? 'ring-2 ring-europbots-secondary/30 shadow-lg' : 'shadow-md'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-white">{alert.title}</h3>
                        {!alert.read && (
                          <span className="w-2 h-2 bg-europbots-secondary rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-gray-300 mb-3">{alert.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        {!alert.read && (
                          <span className="text-europbots-secondary font-medium">Nueva</span>
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
                        className="text-gray-300 border-gray-400/30 hover:bg-white/10"
                      >
                        Marcar como leída
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
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
          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-white mb-2">No hay alertas</h3>
              <p className="text-gray-300">No hay alertas que coincidan con los filtros seleccionados.</p>
            </CardContent>
          </Card>
        )}

        {/* Configuración de Alertas */}
        <Card className="mt-8 bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Settings className="w-5 h-5 mr-2 text-europbots-secondary" />
              Configuración de Alertas
            </CardTitle>
            <CardDescription className="text-gray-300">
              Personaliza las notificaciones y alertas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-white">Tipos de Alerta</h4>
                <div className="space-y-2">
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" defaultChecked className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Errores del sistema
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" defaultChecked className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Límites de presupuesto
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" defaultChecked className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Nuevas oportunidades
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" defaultChecked className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Alertas de rendimiento
                  </label>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-white">Notificaciones</h4>
                <div className="space-y-2">
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" defaultChecked className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Notificaciones por email
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" defaultChecked className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Notificaciones push
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Notificaciones SMS
                  </label>
                  <label className="flex items-center text-gray-300">
                    <input type="checkbox" defaultChecked className="mr-2 bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary focus:ring-europbots-secondary" />
                    Alertas en tiempo real
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button className="bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90 shadow-lg shadow-europbots-secondary/25">
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