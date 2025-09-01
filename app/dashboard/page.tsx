"use client";

import InteractiveStatsCard from '@/components/dashboard/interactive-stats-card';
import FuturisticBackground from '@/components/futuristic-background';
import AnimatedCard from '@/components/ui/animated-card';
import { StatsCardSkeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast-provider';
import { useLeadSimulation } from '@/hooks/useLeadSimulation';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BarChart3,
    Bot,
    MessageSquare,
    Shield,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const { showSuccess, showError, showWarning, showInfo } = useToast()

  // Simular carga de leads para demostrar las alertas
  useLeadSimulation()

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
      <div className="min-h-screen relative">
        <FuturisticBackground />
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8 relative z-10">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-8 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded-lg w-64 animate-pulse"></div>
          </motion.div>
          <motion.div
            className="grid gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </motion.div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAdmin = user.role === 'admin'
  const isUser = user.role === 'user'

  // Estadísticas filtradas por rol - Estadísticas básicas visibles para todos
  const allStats: Array<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any;
    color: string;
    adminOnly: boolean;
  }> = [
    {
      title: 'Utilisateurs Actifs',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-500',
      adminOnly: false // Visible para todos
    },
    {
      title: 'Automatisations',
      value: '89',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Bot,
      color: 'bg-green-500',
      adminOnly: true // Solo para administradores
    },
    {
      title: 'Messages Envoyés',
      value: '45.2K',
      change: '+23%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'bg-purple-500',
      adminOnly: false // Visible para todos
    },
    {
      title: 'Taux de Conversion',
      value: '3.2%',
      change: '+0.8%',
      changeType: 'positive' as const,
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
    <div className="min-h-screen relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <AnimatedCard className="mb-8" hover={false}>
          <motion.h1
            className="text-3xl lg:text-4xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Tableau de Bord
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Bon retour, {user?.full_name || user?.email}
          </motion.p>
        </AnimatedCard>

        {/* Interactive Stats Cards - Responsive mejorado */}
        <motion.div
          className={`grid gap-3 sm:gap-4 lg:gap-6 mb-8 ${
            stats.length === 1 ? 'grid-cols-1' :
            stats.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            stats.length === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <InteractiveStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              color={stat.color}
              adminOnly={stat.adminOnly}
              details={[
                { label: "Cette semaine", value: "+12%" },
                { label: "Aujourd'hui", value: "+3%" },
                { label: "Objectif", value: "85%" },
                { label: "Tendance", value: "↗️" }
              ]}
              onClick={() => showInfo(`Análisis detallado de ${stat.title}`)}
            />
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          className="grid grid-cols-1 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Welcome Card */}
          <AnimatedCard className="bg-gradient-to-r from-europbots-primary/80 to-europbots-dark/80 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8 text-white" delay={0.5}>
            <motion.div
              className="flex items-center space-x-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="bg-europbots-secondary/20 p-3 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Zap className="w-8 h-8 text-europbots-secondary" />
              </motion.div>
              <div>
                <motion.h2
                  className="text-2xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Bienvenue sur EUROPBOTS !
                </motion.h2>
                <motion.p
                  className="text-europbots-secondary/90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Votre plateforme d'automatisation intelligente
                </motion.p>
              </div>
            </motion.div>

            {/* Tarjetas de información solo para administradores */}
            <AnimatePresence>
              {isAdmin && (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.6, staggerChildren: 0.1 }}
                >
                  <motion.div
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-europbots-secondary" />
                      <span className="font-medium">Objectifs</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Configurez vos objectifs d'automatisation</p>
                  </motion.div>
                  <motion.div
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-europbots-secondary" />
                      <span className="font-medium">Surveillance</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Suivez les progrès en temps réel</p>
                  </motion.div>
                  <motion.div
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-europbots-secondary" />
                      <span className="font-medium">Sécurité</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Protection avancée des données</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatedCard>
        </motion.div>

        {/* Recent Activity */}
        <AnimatePresence>
          {recentActivities.length > 0 && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.div
                className="flex items-center mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-semibold text-white">Activité Récente</h3>
              </motion.div>
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, staggerChildren: 0.2 }}
              >
                {recentActivities.slice(0, 2).map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={activity.id}
                      className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-4 sm:p-6 hover:bg-white/20 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-4">
                        <motion.div
                          className="bg-europbots-secondary/20 p-2 rounded-lg"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-5 h-5 text-europbots-secondary" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{activity.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                          <motion.p
                            className="text-xs text-gray-400 mt-2"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          >
                            {activity.time}
                          </motion.p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
