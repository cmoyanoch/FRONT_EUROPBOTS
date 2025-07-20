'use client'

import { useState } from 'react'
import { 
  Bot, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'

export default function AutomationPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const automations = [
    {
      id: 1,
      name: 'LinkedIn Auto Connect',
      description: 'Conecta automáticamente con leads de LinkedIn',
      status: 'active',
      type: 'social',
      lastRun: 'Hace 2 horas',
      successRate: 95,
      icon: Users
    },
    {
      id: 2,
      name: 'Email Campaign Manager',
      description: 'Gestiona campañas de email automáticamente',
      status: 'paused',
      type: 'email',
      lastRun: 'Hace 1 día',
      successRate: 88,
      icon: MessageSquare
    },
    {
      id: 3,
      name: 'Lead Qualification Bot',
      description: 'Califica leads automáticamente',
      status: 'active',
      type: 'ai',
      lastRun: 'Hace 30 minutos',
      successRate: 92,
      icon: Bot
    },
    {
      id: 4,
      name: 'Data Scraping Tool',
      description: 'Extrae datos de sitios web',
      status: 'stopped',
      type: 'data',
      lastRun: 'Hace 3 días',
      successRate: 78,
      icon: TrendingUp
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'paused': return 'text-yellow-400'
      case 'stopped': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20'
      case 'paused': return 'bg-yellow-500/20'
      case 'stopped': return 'bg-red-500/20'
      default: return 'bg-gray-500/20'
    }
  }

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         automation.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || automation.type === selectedFilter
    return matchesSearch && matchesFilter
  })

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
                Automatizaciones
              </h1>
              <p className="text-gray-300">
                Gestiona tus robots y automatizaciones
              </p>
            </div>
            <button className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Nueva Automatización</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Automatizaciones</p>
                <p className="text-2xl font-bold text-white mt-1">24</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Activas</p>
                <p className="text-2xl font-bold text-white mt-1">18</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Play className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Pausadas</p>
                <p className="text-2xl font-bold text-white mt-1">4</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Pause className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-white mt-1">89%</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar automatizaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="social">Social Media</option>
                <option value="email">Email</option>
                <option value="ai">AI/ML</option>
                <option value="data">Data Scraping</option>
              </select>
            </div>
          </div>
        </div>

        {/* Automations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAutomations.map((automation) => {
            const Icon = automation.icon
            return (
              <div key={automation.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-europbots-secondary/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-europbots-secondary/20 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-europbots-secondary" />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(automation.status)} ${getStatusColor(automation.status)}`}>
                    {automation.status === 'active' ? 'Activa' : 
                     automation.status === 'paused' ? 'Pausada' : 'Detenida'}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {automation.name}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {automation.description}
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Última ejecución:</span>
                    <span className="text-white">{automation.lastRun}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tasa de éxito:</span>
                    <span className="text-green-400">{automation.successRate}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-europbots-secondary/20">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <Edit className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                      <Settings className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    {automation.status === 'active' ? (
                      <button className="p-2 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 transition-colors">
                        <Pause className="w-4 h-4 text-yellow-400" />
                      </button>
                    ) : (
                      <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                        <Play className="w-4 h-4 text-green-400" />
                      </button>
                    )}
                    <button className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
} 