"use client";

import FuturisticBackground from "@/components/futuristic-background";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCard from "@/components/ui/animated-card";
import InteractiveStatsCard from "@/components/dashboard/interactive-stats-card";
import { useToast } from "@/components/ui/toast-provider";
import {
  BarChart3,
  Bot,
  DollarSign,
  Download,
  Eye,
  Target,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const stats = [
    {
      title: "Leads Générés",
      value: "1,247",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-blue-500/20",
      details: [
        { label: "Cette semaine", value: "312" },
        { label: "Objectif mensuel", value: "1,500" },
        { label: "Taux conversion", value: "12.5%" },
        { label: "Coût/lead", value: "€45" }
      ]
    },
    {
      title: "Conversions",
      value: "156",
      change: "+8.3%",
      changeType: "positive" as const,
      icon: Target,
      color: "bg-green-500/20",
      details: [
        { label: "Taux conversion", value: "12.5%" },
        { label: "Valeur moyenne", value: "€850" },
        { label: "Pipeline", value: "€132k" },
        { label: "Fermées", value: "89" }
      ]
    },
    {
      title: "Automatisations Actives",
      value: "24",
      change: "+2",
      changeType: "positive" as const,
      icon: Bot,
      color: "bg-purple-500/20",
      details: [
        { label: "LinkedIn", value: "15" },
        { label: "Email", value: "6" },
        { label: "Webhook", value: "3" },
        { label: "Temps économisé", value: "45h" }
      ]
    },
    {
      title: "ROI Moyen",
      value: "340%",
      change: "+15.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "bg-orange-500/20",
      details: [
        { label: "Investissement", value: "€15k" },
        { label: "Retour", value: "€51k" },
        { label: "Bénéfice", value: "€36k" },
        { label: "ROI target", value: "300%" }
      ]
    },
  ];

  const topSources = [
    { source: "LinkedIn", leads: 456, conversion: 12.3, icon: "💼" },
    { source: "Website", leads: 234, conversion: 8.7, icon: "🌐" },
    { source: "Referrals", leads: 189, conversion: 15.2, icon: "👥" },
    { source: "Email Campaigns", leads: 156, conversion: 6.8, icon: "📧" },
    { source: "Social Media", leads: 123, conversion: 4.2, icon: "📱" },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "lead",
      description: "Nouveau lead qualifié: Juan Pérez de Tech Solutions",
      time: "Il y a 2 heures",
      value: "+1",
    },
    {
      id: 2,
      type: "conversion",
      description: "Conversion réussie: María García",
      time: "Il y a 4 heures",
      value: "+1",
    },
    {
      id: 3,
      type: "automation",
      description: 'Automatisation "LinkedIn Auto Connect" terminée',
      time: "Il y a 6 heures",
      value: "156 leads",
    },
    {
      id: 4,
      type: "campaign",
      description: 'Campagne email lancée: "Q1 Follow-up"',
      time: "Il y a 1 jour",
      value: "500 emails",
    },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <AnimatedCard className="mb-8" hover={false}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Analytics & Reportes
              </h1>
              <p className="text-gray-300 text-lg">
                Métricas y análisis detallados de tu rendimiento
              </p>
            </motion.div>
            <motion.div 
              className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  showInfo(`Periodo cambiado a: ${e.target.options[e.target.selectedIndex].text}`);
                }}
                className="px-4 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                whileFocus={{ scale: 1.02 }}
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </motion.select>
              <motion.button 
                onClick={() => showInfo("Exportando reporte...")}
                className="bg-white/10 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </motion.button>
            </motion.div>
          </div>
        </AnimatedCard>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
              details={stat.details}
              onClick={() => showInfo(`Análisis detallado de ${stat.title}`)}
            />
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.5}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Rendimiento de Leads
                </h3>
                <div className="flex space-x-2">
                  <motion.button 
                    className="px-3 py-1 bg-europbots-secondary/20 text-europbots-secondary rounded-lg text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Leads
                  </motion.button>
                  <motion.button 
                    onClick={() => showInfo("Vista de conversiones activada")}
                    className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Conversiones
                  </motion.button>
                </div>
              </div>

              {/* Placeholder for chart */}
              <motion.div 
                className="h-64 bg-white/5 rounded-lg flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  </motion.div>
                  <motion.p 
                    className="text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Gráfico de rendimiento
                  </motion.p>
                  <motion.p 
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Integración con librería de gráficos
                  </motion.p>
                </div>
              </motion.div>
            </AnimatedCard>
          </div>

          {/* Top Sources */}
          <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.6}>
            <h3 className="text-lg font-semibold text-white mb-6">
              Fuentes Principales
            </h3>
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {topSources.map((source, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.span 
                      className="text-2xl"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {source.icon}
                    </motion.span>
                    <div>
                      <p className="font-medium text-white">{source.source}</p>
                      <p className="text-sm text-gray-400">
                        {source.leads} leads
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.p 
                      className="text-sm font-medium text-green-400"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {source.conversion}%
                    </motion.p>
                    <p className="text-xs text-gray-400">conversión</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedCard>
        </motion.div>

        {/* Bottom Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Recent Activity */}
          <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.7}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Actividad Reciente
              </h3>
              <motion.button 
                onClick={() => showInfo("Mostrando toda la actividad")}
                className="text-europbots-secondary hover:text-europbots-secondary/80 font-medium text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver todo
              </motion.button>
            </div>
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <motion.div 
                    className="bg-europbots-secondary/20 p-2 rounded-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Eye className="w-4 h-4 text-europbots-secondary" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                  <div className="text-right">
                    <motion.span 
                      className="text-sm font-medium text-green-400"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {activity.value}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedCard>

          {/* Quick Actions */}
          <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.8}>
            <h3 className="text-lg font-semibold text-white mb-6">
              Acciones Rápidas
            </h3>
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button 
                onClick={() => showInfo("Generando reporte mensual...")}
                className="w-full bg-europbots-secondary text-europbots-primary font-medium py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Generar Reporte Mensual
              </motion.button>
              <motion.button 
                onClick={() => showInfo("Configurando alertas personalizadas")}
                className="w-full bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                Configurar Alertas
              </motion.button>
              <motion.button 
                onClick={() => showInfo("Comparando períodos seleccionados")}
                className="w-full bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                Comparar Períodos
              </motion.button>
              <motion.button 
                onClick={() => showSuccess("Optimizando campañas automáticamente")}
                className="w-full bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                Optimizar Campañas
              </motion.button>
            </motion.div>
          </AnimatedCard>
        </motion.div>
      </main>
    </div>
  );
}
