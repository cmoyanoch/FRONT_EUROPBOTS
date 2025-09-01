"use client";

import FuturisticBackground from "@/components/futuristic-background";
import AnimatedCard from "@/components/ui/animated-card";
import { useToast } from "@/components/ui/toast-provider";
import { motion } from "framer-motion";
import {
    Bot,
    Edit,
    MessageSquare,
    Pause,
    Play,
    Plus,
    Search,
    Settings,
    Trash2,
    TrendingUp,
    Users,
} from "lucide-react";
import { useState } from "react";

export default function AutomationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const automations = [
    {
      id: 1,
      name: "LinkedIn Auto Connect",
      description: "Connecte automatiquement avec les leads LinkedIn",
      status: "active",
      type: "social",
      lastRun: "Il y a 2 heures",
      successRate: 95,
      icon: Users,
    },
    {
      id: 2,
      name: "Email Campaign Manager",
      description: "Gérez les campagnes email automatiquement",
      status: "paused",
      type: "email",
      lastRun: "Il y a 1 jour",
      successRate: 88,
      icon: MessageSquare,
    },
    {
      id: 3,
      name: "Lead Qualification Bot",
      description: "Qualifiez les leads automatiquement",
      status: "active",
      type: "ai",
      lastRun: "Il y a 30 minutes",
      successRate: 92,
      icon: Bot,
    },
    {
      id: 4,
      name: "Data Scraping Tool",
      description: "Extrayez les données des sites web",
      status: "stopped",
      type: "data",
      lastRun: "Il y a 3 jours",
      successRate: 78,
      icon: TrendingUp,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400";
      case "paused":
        return "text-yellow-400";
      case "stopped":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20";
      case "paused":
        return "bg-yellow-500/20";
      case "stopped":
        return "bg-red-500/20";
      default:
        return "bg-gray-500/20";
    }
  };

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch =
      automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || automation.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <AnimatedCard className="mb-8" hover={false}>
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                className="text-3xl lg:text-4xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Automatisations
              </motion.h1>
              <motion.p
                className="text-gray-300 text-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Gérez vos robots et automatisations
              </motion.p>
            </div>
            <motion.button
              onClick={() => showInfo("Création d'une nouvelle automatisation")}
              className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Nouvelle Automatisation</span>
            </motion.button>
          </div>
        </AnimatedCard>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.4}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Total Automatisations
                </p>
                <p className="text-2xl font-bold text-white mt-1">24</p>
              </div>
              <motion.div
                className="bg-blue-500/20 p-3 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Bot className="w-6 h-6 text-blue-400" />
              </motion.div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.5}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Actives</p>
                <p className="text-2xl font-bold text-white mt-1">18</p>
              </div>
              <motion.div
                className="bg-green-500/20 p-3 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Play className="w-6 h-6 text-green-400" />
              </motion.div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.6}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">En Pause</p>
                <p className="text-2xl font-bold text-white mt-1">4</p>
              </div>
              <motion.div
                className="bg-yellow-500/20 p-3 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Pause className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6" delay={0.7}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Taux de Réussite
                </p>
                <p className="text-2xl font-bold text-white mt-1">89%</p>
              </div>
              <motion.div
                className="bg-purple-500/20 p-3 rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </motion.div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Filters and Search */}
        <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 mb-8" delay={0.8}>
          <motion.div
            className="flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex-1">
              <div className="relative">
                <motion.div
                  animate={{ scale: searchTerm ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </motion.div>
                <motion.input
                  type="text"
                  placeholder="Rechercher des automatisations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <motion.select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                whileFocus={{ scale: 1.02 }}
              >
                <option value="all">Todos los tipos</option>
                <option value="social">Social Media</option>
                <option value="email">Email</option>
                <option value="ai">AI/ML</option>
                <option value="data">Data Scraping</option>
              </motion.select>
            </div>
          </motion.div>
        </AnimatedCard>

        {/* Automations Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          {filteredAutomations.map((automation, index) => {
            const Icon = automation.icon;
            return (
              <motion.div
                key={automation.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-europbots-secondary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-europbots-secondary/20 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-europbots-secondary" />
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBg(
                      automation.status
                    )} ${getStatusColor(automation.status)}`}
                  >
                    {automation.status === "active"
                      ? "Active"
                      : automation.status === "paused"
                      ? "En Pause"
                      : "Arrêtée"}
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
                    <span className="text-green-400">
                      {automation.successRate}%
                    </span>
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
                    {automation.status === "active" ? (
                      <motion.button
                        onClick={() => showWarning("Automatisation en pause", `${automation.name} a été mis en pause`)}
                        className="p-2 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Pause className="w-4 h-4 text-yellow-400" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => showSuccess("Automatisation activée", `${automation.name} a été activé`)}
                        className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play className="w-4 h-4 text-green-400" />
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => showError("Automatisation supprimée", `${automation.name} a été supprimé`)}
                      className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                                              <Trash2 className="text-red-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}
