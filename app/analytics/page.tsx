'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, Target, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState({
    profileVisits: { current: 65, limit: 80, percentage: 81 },
    newLeads: 23,
    connectionRequests: { sent: 8, total: 10, percentage: 80 },
    acceptanceRate: 42,
    messagesSent: { count: 15, responseRate: 18 },
    activePhantoms: { running: 4, total: 5, percentage: 80 }
  })

  const [pipeline, setPipeline] = useState({
    profilesFound: 1247,
    profilesVisited: 834,
    connectionsSent: 286,
    connectionsAccepted: 124,
    conversationsStarted: 45,
    meetingsBooked: 8,
    opportunitiesQualified: 3
  })

  const [campaigns, setCampaigns] = useState([
    { name: '🏨 HoReCa Q4 2025', status: 'active', leads: 89, conversion: 15, nextStep: '📅' },
    { name: '🏭 Logistics Europe', status: 'active', leads: 67, conversion: 22, nextStep: '📅' },
    { name: '🧹 Cleaning Services FR', status: 'paused', leads: 134, conversion: 12, nextStep: '💬' },
    { name: '🏥 Healthcare DACH', status: 'active', leads: 45, conversion: 28, nextStep: '📅' },
    { name: '🏢 Real Estate UK', status: 'testing', leads: 23, conversion: 8, nextStep: '💬' }
  ])

  const [messageSequence, setMessageSequence] = useState([
    { message: '🤝 Connection Request', sent: 100, opened: 85, response: 42, type: 'accept' },
    { message: '🤖 Robot Introduction', sent: 89, opened: 72, response: 18, type: 'reply' },
    { message: '📹 Demo Video Offer', sent: 67, opened: 64, response: 25, type: 'interest' },
    { message: '📅 Meeting Invitation', sent: 45, opened: 78, response: 35, type: 'booking' }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'testing': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅'
      case 'paused': return '⏸️'
      case 'testing': return '🟡'
      default: return '⚪'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Métricas en tiempo real y análisis de rendimiento de las campañas de prospección
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Visits</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.profileVisits.current}/{metrics.profileVisits.limit}</div>
              <p className="text-xs text-muted-foreground">
                Budget: {metrics.profileVisits.percentage}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-europbots-blue h-2 rounded-full" 
                  style={{ width: `${metrics.profileVisits.percentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.newLeads}</div>
              <p className="text-xs text-muted-foreground">
                Today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.connectionRequests.sent}/{metrics.connectionRequests.total}</div>
              <p className="text-xs text-muted-foreground">
                Sent today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.acceptanceRate}%</div>
              <p className="text-xs text-muted-foreground">
                Target: &gt;40%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.messagesSent.count}</div>
              <p className="text-xs text-muted-foreground">
                Response Rate: {metrics.messagesSent.responseRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Phantoms</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activePhantoms.running}/{metrics.activePhantoms.total}</div>
              <p className="text-xs text-muted-foreground">
                Running
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline de Conversión */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pipeline de Conversión</CardTitle>
            <CardDescription>
              Embudo de ventas - Progreso de prospectos a oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pipeline.profilesFound}</div>
                <div className="text-sm text-gray-600">🔍 Perfiles Encontrados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{pipeline.profilesVisited}</div>
                <div className="text-sm text-gray-600">👁️ Perfiles Visitados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{pipeline.connectionsSent}</div>
                <div className="text-sm text-gray-600">🤝 Conexiones Enviadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{pipeline.connectionsAccepted}</div>
                <div className="text-sm text-gray-600">✅ Conexiones Aceptadas</div>
                <div className="text-xs text-gray-500">({Math.round((pipeline.connectionsAccepted / pipeline.connectionsSent) * 100)}%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{pipeline.conversationsStarted}</div>
                <div className="text-sm text-gray-600">💬 Conversaciones Iniciadas</div>
                <div className="text-xs text-gray-500">({Math.round((pipeline.conversationsStarted / pipeline.connectionsAccepted) * 100)}%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{pipeline.meetingsBooked}</div>
                <div className="text-sm text-gray-600">📅 Reuniones Agendadas</div>
                <div className="text-xs text-gray-500">({Math.round((pipeline.meetingsBooked / pipeline.conversationsStarted) * 100)}%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{pipeline.opportunitiesQualified}</div>
                <div className="text-sm text-gray-600">🎯 Oportunidades Cualificadas</div>
                <div className="text-xs text-gray-500">({Math.round((pipeline.opportunitiesQualified / pipeline.meetingsBooked) * 100)}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campañas Activas */}
          <Card>
            <CardHeader>
              <CardTitle>Campañas por Sector</CardTitle>
              <CardDescription>
                Estado y rendimiento de las campañas activas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-sm text-gray-500">
                        {campaign.leads} leads • {campaign.conversion}% conversion
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusIcon(campaign.status)} {campaign.status.toUpperCase()}
                      </span>
                      <span className="text-lg">{campaign.nextStep}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Secuencias de Mensajes */}
          <Card>
            <CardHeader>
              <CardTitle>Secuencias de Mensajes Automatizadas</CardTitle>
              <CardDescription>
                Rendimiento de las secuencias de mensajes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messageSequence.map((message, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{message.message}</span>
                      <span className="text-xs text-gray-500">{message.sent}%</span>
                    </div>
                    <div className="flex space-x-2 text-xs">
                      <span className="text-blue-600">Apertura: {message.opened}%</span>
                      <span className="text-green-600">Respuesta: {message.response}% {message.type}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-europbots-blue h-1 rounded-full" 
                        style={{ width: `${message.sent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 