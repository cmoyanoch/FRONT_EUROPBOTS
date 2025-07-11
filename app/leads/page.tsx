'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Star, MessageSquare, Calendar, Building, MapPin, Phone, Mail } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState([
    {
      id: 1,
      name: 'Jean Dupont',
      company: 'Hotel Grand Paris',
      position: 'Operations Manager',
      industry: 'HoReCa',
      location: 'Paris, France',
      score: 85,
      status: 'qualified',
      lastContact: '2024-01-15',
      email: 'jean.dupont@hotelgrandparis.fr',
      phone: '+33 1 23 45 67 89',
      notes: 'Interesado en robots de limpieza para habitaciones'
    },
    {
      id: 2,
      name: 'Maria Schmidt',
      company: 'Logistics Solutions GmbH',
      position: 'Facilities Director',
      industry: 'Logistics',
      location: 'Berlin, Germany',
      score: 92,
      status: 'meeting_scheduled',
      lastContact: '2024-01-14',
      email: 'm.schmidt@logistics-solutions.de',
      phone: '+49 30 12 34 56 78',
      notes: 'Demo programada para el 20 de enero'
    },
    {
      id: 3,
      name: 'David Wilson',
      company: 'CleanTech Services',
      position: 'CEO',
      industry: 'Cleaning Services',
      location: 'London, UK',
      score: 78,
      status: 'contacted',
      lastContact: '2024-01-13',
      email: 'david.wilson@cleantech.co.uk',
      phone: '+44 20 71 23 45 67',
      notes: 'Evaluando opciones de automatización'
    },
    {
      id: 4,
      name: 'Sophie Martin',
      company: 'Healthcare Center Lyon',
      position: 'Facilities Manager',
      industry: 'Healthcare',
      location: 'Lyon, France',
      score: 88,
      status: 'qualified',
      lastContact: '2024-01-12',
      email: 's.martin@healthcare-lyon.fr',
      phone: '+33 4 78 90 12 34',
      notes: 'Necesita solución para limpieza nocturna'
    }
  ])

  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified': return 'text-green-600 bg-green-100'
      case 'meeting_scheduled': return 'text-blue-600 bg-blue-100'
      case 'contacted': return 'text-yellow-600 bg-yellow-100'
      case 'new': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'qualified': return '🎯 Cualificado'
      case 'meeting_scheduled': return '📅 Reunión Agendada'
      case 'contacted': return '💬 Contactado'
      case 'new': return '🆕 Nuevo'
      default: return '❓ Desconocido'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.position.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const stats = {
    total: leads.length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    meetings: leads.filter(l => l.status === 'meeting_scheduled').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    averageScore: Math.round(leads.reduce((acc, lead) => acc + lead.score, 0) / leads.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 Gestión de Leads
          </h1>
          <p className="text-gray-600">
            Prospectos cualificados y pipeline de ventas
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cualificados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reuniones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.meetings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nombre, empresa o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'qualified' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('qualified')}
                >
                  Cualificados
                </Button>
                <Button
                  variant={filterStatus === 'meeting_scheduled' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('meeting_scheduled')}
                >
                  Reuniones
                </Button>
                <Button
                  variant={filterStatus === 'contacted' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('contacted')}
                >
                  Contactados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de leads */}
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <p className="text-sm text-gray-600">{lead.position}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                        <span className={`flex items-center text-sm font-medium ${getScoreColor(lead.score)}`}>
                          <Star className="w-4 h-4 mr-1" />
                          {lead.score}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.company}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">📊 {lead.industry}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.phone}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{lead.notes}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button size="sm" className="bg-europbots-blue hover:bg-europbots-blue-dark">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contactar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      Agendar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4 mr-1" />
                      Cualificar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 