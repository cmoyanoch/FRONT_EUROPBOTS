'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  TrendingUp, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Activity,
  Calendar,
  Target,
  Zap,
  Shield
} from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'

interface User {
  id: string
  email: string
  full_name?: string
  role?: string
  avatar_url?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (!response.ok) {
          router.push('/login')
        } else {
          setUser(data.user)
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center relative pt-16">
        <FuturisticBackground />
        <div className="europbots-card p-8 flex items-center space-x-4 relative z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-europbots-secondary"></div>
          <div className="text-lg font-medium text-white">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'
  const isUser = user.role === 'user'

  // Estadísticas filtradas por rol - Estadísticas básicas visibles para todos
  const allStats = [
    {
      title: 'Utilisateurs Actifs',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
      adminOnly: false // Visible para todos
    },
    {
      title: 'Automatisations',
      value: '89',
      change: '+5%',
      changeType: 'positive',
      icon: Bot,
      color: 'bg-green-500',
      adminOnly: true // Solo para administradores
    },
    {
      title: 'Messages Envoyés',
      value: '45.2K',
      change: '+23%',
      changeType: 'positive',
      icon: MessageSquare,
      color: 'bg-purple-500',
      adminOnly: false // Visible para todos
    },
    {
      title: 'Taux de Conversion',
      value: '3.2%',
      change: '+0.8%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-orange-500',
      adminOnly: false // Visible para todos
    }
  ]

  const stats = allStats.filter(stat => !stat.adminOnly || isAdmin)

  // Actividades recientes filtradas por rol - Algunas actividades visibles para todos
  const allRecentActivities = [
    {
      id: 1,
      type: 'automation',
      title: 'Nouvelle automatisation créée',
      description: 'LinkedIn Auto Connect configuré',
      time: 'Il y a 2 heures',
      icon: Bot,
      adminOnly: true // Solo para administradores
    },
    {
      id: 2,
      type: 'message',
      title: 'Campagne de messages lancée',
      description: '500 messages envoyés avec succès',
      time: 'Il y a 4 heures',
      icon: MessageSquare,
      adminOnly: false // Visible para todos
    },
    {
      id: 3,
      type: 'user',
      title: 'Nouvel utilisateur inscrit',
      description: 'juan.perez@empresa.com s\'est joint',
      time: 'Il y a 6 heures',
      icon: Users,
      adminOnly: true // Solo para administradores
    },
    {
      id: 4,
      type: 'analytics',
      title: 'Rapport généré',
      description: 'Analyse mensuelle terminée',
      time: 'Il y a 1 jour',
      icon: BarChart3,
      adminOnly: true // Solo para administradores
    }
  ]

  const recentActivities = allRecentActivities.filter(activity => !activity.adminOnly || isAdmin)

  return (
    <div className="relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tableau de Bord
          </h1>
          <p className="text-gray-300">
            Bon retour, {user?.full_name || user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-6 mb-8 ${
          stats.length === 1 ? 'grid-cols-1' :
          stats.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          stats.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
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
                      <span className="text-sm text-gray-400 ml-1">vs mois précédent</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8">
          {/* Welcome Card */}
          <div>
            <div className="bg-gradient-to-r from-europbots-primary/80 to-europbots-dark/80 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8 text-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-europbots-secondary/20 p-3 rounded-lg">
                  <Zap className="w-8 h-8 text-europbots-secondary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Bienvenue sur EUROPBOTS !</h2>
                  <p className="text-europbots-secondary/90">Votre plateforme d'automatisation intelligente</p>
                </div>
              </div>
              
              {/* Tarjetas de información solo para administradores */}
              {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-europbots-secondary" />
                      <span className="font-medium">Objectifs</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Configurez vos objectifs d'automatisation</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-europbots-secondary" />
                      <span className="font-medium">Surveillance</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Suivez les progrès en temps réel</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-europbots-secondary" />
                      <span className="font-medium">Sécurité</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Protection avancée des données</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivities.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Activité Récente</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentActivities.slice(0, 2).map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="bg-europbots-secondary/20 p-2 rounded-lg">
                        <Icon className="w-5 h-5 text-europbots-secondary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{activity.title}</h4>
                        <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 