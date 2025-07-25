'use client'

import { useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Star,
  MessageSquare,
  Calendar,
  TrendingUp,
  Download,
  Edit,
  Trash2
} from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const leads = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@empresa.com',
      phone: '+34 600 123 456',
      company: 'Tech Solutions S.L.',
      position: 'CEO',
      location: 'Madrid, España',
      status: 'qualified',
      source: 'LinkedIn',
      lastContact: 'Hace 2 días',
      score: 85,
      icon: Building
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria.garcia@startup.es',
      phone: '+34 600 789 012',
      company: 'Innovation Labs',
      position: 'CTO',
      location: 'Barcelona, España',
      status: 'contacted',
      source: 'Website',
      lastContact: 'Hace 1 semana',
      score: 72,
      icon: Building
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos.lopez@consulting.com',
      phone: '+34 600 345 678',
      company: 'Digital Consulting',
      position: 'Director de Operaciones',
      location: 'Valencia, España',
      status: 'new',
      source: 'Referral',
      lastContact: 'Nunca',
      score: 68,
      icon: Building
    },
    {
      id: 4,
      name: 'Ana Rodríguez',
      email: 'ana.rodriguez@automation.es',
      phone: '+34 600 901 234',
      company: 'AutoTech Solutions',
      position: 'VP de Ventas',
      location: 'Sevilla, España',
      status: 'qualified',
      source: 'LinkedIn',
      lastContact: 'Hace 3 días',
      score: 91,
      icon: Building
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'text-green-400 bg-green-500/20'
      case 'contacted': return 'text-blue-400 bg-blue-500/20'
      case 'new': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'qualified': return 'Calificado'
      case 'contacted': return 'Contactado'
      case 'new': return 'Nuevo'
      default: return 'Desconocido'
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || lead.status === selectedFilter
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
                Gestion des Leads
              </h1>
              <p className="text-gray-300">
                Administrez et suivez vos leads potentiels
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20 flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Exporter</span>
              </button>
              <button className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Nouveau Lead</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Leads</p>
                <p className="text-2xl font-bold text-white mt-1">1,247</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Qualifiés</p>
                <p className="text-2xl font-bold text-white mt-1">342</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Star className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Contactés</p>
                <p className="text-2xl font-bold text-white mt-1">156</p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Taux de Conversion</p>
                <p className="text-2xl font-bold text-white mt-1">12.5%</p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-400" />
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
                  placeholder="Rechercher des leads par nom, email ou entreprise..."
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
                <option value="all">Tous les états</option>
                <option value="new">Nouveaux</option>
                <option value="contacted">Contactés</option>
                <option value="qualified">Qualifiés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Lead
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Último Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-europbots-secondary/10">
                {filteredLeads.map((lead) => {
                  const Icon = lead.icon
                  return (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-europbots-secondary/20 p-2 rounded-lg mr-3">
                            <Icon className="w-5 h-5 text-europbots-secondary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{lead.name}</div>
                            <div className="text-sm text-gray-300">{lead.position}</div>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Mail className="w-3 h-3 mr-1" />
                              {lead.email}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              {lead.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{lead.company}</div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {lead.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusText(lead.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {lead.lastContact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className="bg-europbots-secondary h-2 rounded-full" 
                              style={{ width: `${lead.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-white">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                            <Edit className="w-4 h-4 text-gray-300" />
                          </button>
                          <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                            <MessageSquare className="w-4 h-4 text-gray-300" />
                          </button>
                          <button className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
} 