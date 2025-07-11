'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Bot, Shield, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export default function ConfigPage() {
  const [toolConfig, setToolConfig] = useState([
    {
      name: 'Search Export',
      status: 'active',
      budget: 10,
      nextRun: 'in 2h 15m',
      icon: '🔍'
    },
    {
      name: 'Profile Visitor',
      status: 'active',
      budget: 20,
      nextRun: 'in 45m',
      icon: '👁️'
    },
    {
      name: 'Profile Scraper',
      status: 'active',
      budget: 25,
      nextRun: 'in 1h 30m',
      icon: '📧'
    },
    {
      name: 'Auto Connect',
      status: 'paused',
      budget: 10,
      nextRun: 'Paused (Weekend)',
      icon: '🤝'
    },
    {
      name: 'Message Sender',
      status: 'active',
      budget: 15,
      nextRun: 'in 3h',
      icon: '💬'
    }
  ])

  const [safetyMetrics, setSafetyMetrics] = useState([
    { metric: 'Profile Visits', value: '65/80', status: 'safe', target: 'Safe' },
    { metric: 'Error Rate', value: '2%', status: 'safe', target: '<5%' },
    { metric: 'Session Age', value: '18h', status: 'safe', target: 'Fresh' },
    { metric: 'Accept Rate', value: '38%', status: 'monitor', target: 'Monitor' },
    { metric: 'LinkedIn Warnings', value: 'None', status: 'safe', target: 'None' }
  ])

  const [alerts, setAlerts] = useState([
    { type: 'Account Warning', trigger: 'LinkedIn alert', action: 'Stop all tools', severity: 'high' },
    { type: 'Budget Limit', trigger: '75 visits/day', action: 'Reduce activity', severity: 'medium' },
    { type: 'High Performance', trigger: 'Accept rate >50%', action: 'Scale up', severity: 'low' },
    { type: 'New Opportunity', trigger: 'Meeting booked', action: 'CRM notification', severity: 'low' },
    { type: 'Tool Error', trigger: 'Phantom fails', action: 'Technical review', severity: 'medium' }
  ])

  const [apiKeys, setApiKeys] = useState({
    phantomBuster: 'pb_••••••••••••••••••••••••••••••••',
    linkedIn: 'li_••••••••••••••••••••••••••••••••',
    axonaut: 'ax_••••••••••••••••••••••••••••••••'
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100'
      case 'monitor': return 'text-yellow-600 bg-yellow-100'
      case 'warning': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⚙️ Configuración del Sistema
          </h1>
          <p className="text-gray-600">
            Configuración de herramientas PhantomBuster y monitoreo de seguridad
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuración de Herramientas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                Configuración de Herramientas PhantomBuster
              </CardTitle>
              <CardDescription>
                Estado y configuración de las herramientas de automatización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {toolConfig.map((tool, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-gray-500">
                          Budget: {tool.budget}/day • Next: {tool.nextRun}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.status === 'active' ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100'
                      }`}>
                        {tool.status === 'active' ? '✅' : '⏸️'} {tool.status.toUpperCase()}
                      </span>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monitoreo de Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Monitoreo de Seguridad de Cuenta
              </CardTitle>
              <CardDescription>
                Métricas de seguridad y estado de la cuenta LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safetyMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        metric.status === 'safe' ? 'bg-green-500' : 
                        metric.status === 'monitor' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{metric.metric}</div>
                        <div className="text-sm text-gray-500">Target: {metric.target}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{metric.value}</div>
                      <div className={`text-xs ${getStatusColor(metric.status)}`}>
                        {metric.status === 'safe' ? '🟢 Safe' : 
                         metric.status === 'monitor' ? '🟡 Monitor' : '🔴 Warning'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Alertas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Sistema de Alertas
            </CardTitle>
            <CardDescription>
              Configuración de alertas y notificaciones automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{alert.type}</h4>
                    <span className={`text-lg ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-600">
                      <strong>Trigger:</strong> {alert.trigger}
                    </div>
                    <div className="text-gray-600">
                      <strong>Action:</strong> {alert.action}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                    <Button size="sm" variant="outline">
                      Test
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuración de API */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración de API Keys
            </CardTitle>
            <CardDescription>
              Gestión segura de claves API para integraciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="phantom-api">PhantomBuster API Key</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="phantom-api"
                    type="password"
                    value={apiKeys.phantomBuster}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin-api">LinkedIn API Key</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="linkedin-api"
                    type="password"
                    value={apiKeys.linkedIn}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="axonaut-api">Axonaut CRM API Key</Label>
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="axonaut-api"
                    type="password"
                    value={apiKeys.axonaut}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Button className="bg-europbots-blue hover:bg-europbots-blue-dark">
                <Settings className="w-4 h-4 mr-2" />
                Guardar Configuración
              </Button>
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Probar Conexiones
              </Button>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Ver Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 