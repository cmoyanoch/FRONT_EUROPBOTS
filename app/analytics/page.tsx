'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Bot, 
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Zap,
  DollarSign
} from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  const stats = [
    {
      title: 'Leads Generados',
      value: '1,247',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Conversiones',
      value: '156',
      change: '+8.3%',
      changeType: 'positive',
      icon: Target,
      color: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      title: 'Automatizaciones Activas',
      value: '24',
      change: '+2',
      changeType: 'positive',
      icon: Bot,
      color: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'ROI Promedio',
      value: '340%',
      change: '+15.2%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-orange-500/20',
      iconColor: 'text-orange-400'
    }
  ]

  const topSources = [
    { source: 'LinkedIn', leads: 456, conversion: 12.3, icon: '💼' },
    { source: 'Website', leads: 234, conversion: 8.7, icon: '🌐' },
    { source: 'Referrals', leads: 189, conversion: 15.2, icon: '👥' },
    { source: 'Email Campaigns', leads: 156, conversion: 6.8, icon: '📧' },
    { source: 'Social Media', leads: 123, conversion: 4.2, icon: '📱' }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'lead',
      description: 'Nuevo lead calificado: Juan Pérez de Tech Solutions',
      time: 'Hace 2 horas',
      value: '+1'
    },
    {
      id: 2,
      type: 'conversion',
      description: 'Conversión exitosa: María García',
      time: 'Hace 4 horas',
      value: '+1'
    },
    {
      id: 3,
      type: 'automation',
      description: 'Automatización "LinkedIn Auto Connect" completada',
      time: 'Hace 6 horas',
      value: '156 leads'
    },
    {
      id: 4,
      type: 'campaign',
      description: 'Campaña de email iniciada: "Q1 Follow-up"',
      time: 'Hace 1 día',
      value: '500 emails'
    }
  ]

  return (
    <div className="min-h-screen relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Analytics & Reportes
          </h1>
              <p className="text-gray-300">
                Métricas y análisis detallados de tu rendimiento
          </p>
        </div>
            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
              <button className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
              </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-europbots-secondary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">{stat.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-400 ml-1">vs período anterior</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
              </div>
              </div>
            )
          })}
              </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Rendimiento de Leads</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-europbots-secondary/20 text-europbots-secondary rounded-lg text-sm font-medium">
                    Leads
                  </button>
                  <button className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/20">
                    Conversiones
                  </button>
              </div>
              </div>
              
              {/* Placeholder for chart */}
              <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center">
              <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Gráfico de rendimiento</p>
                  <p className="text-sm text-gray-500">Integración con librería de gráficos</p>
              </div>
              </div>
            </div>
          </div>

          {/* Top Sources */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Fuentes Principales</h3>
              <div className="space-y-4">
              {topSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{source.icon}</span>
                    <div>
                      <p className="font-medium text-white">{source.source}</p>
                      <p className="text-sm text-gray-400">{source.leads} leads</p>
                      </div>
                    </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-400">{source.conversion}%</p>
                    <p className="text-xs text-gray-400">conversión</p>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
              <button className="text-europbots-secondary hover:text-europbots-secondary/80 font-medium text-sm">
                Ver todo
              </button>
            </div>
              <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                  <div className="bg-europbots-secondary/20 p-2 rounded-lg">
                    <Eye className="w-4 h-4 text-europbots-secondary" />
                    </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-green-400">{activity.value}</span>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full bg-europbots-secondary text-europbots-primary font-medium py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
                Generar Reporte Mensual
              </button>
              <button className="w-full bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20">
                Configurar Alertas
              </button>
              <button className="w-full bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20">
                Comparar Períodos
              </button>
              <button className="w-full bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20">
                Optimizar Campañas
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 