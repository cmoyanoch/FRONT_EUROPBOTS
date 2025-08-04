import FuturisticBackground from "@/components/futuristic-background";
import {
  ArrowRight,
  Bot,
  CheckCircle,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) redirect("/login");

  const features = [
    {
      icon: Bot,
      title: "Automatisation Intelligente",
      description:
        "Robots avancés qui optimisent vos processus métier automatiquement.",
    },
    {
      icon: Zap,
      title: "Haute Vitesse",
      description: "Exécutez des tâches complexes en secondes, pas en heures.",
    },
    {
      icon: Shield,
      title: "Sécurité Totale",
      description:
        "Protection des données de niveau entreprise avec chiffrement avancé.",
    },
    {
      icon: TrendingUp,
      title: "Analytics Avancés",
      description:
        "Métriques détaillées et rapports en temps réel pour prendre de meilleures décisions.",
    },
    {
      icon: Users,
      title: "Gestion des Leads",
      description:
        "Système complet pour capturer, qualifier et convertir les leads automatiquement.",
    },
    {
      icon: MessageSquare,
      title: "Communication Automatique",
      description:
        "Messages personnalisés et campagnes automatisées qui génèrent des résultats.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Utilisateurs Actifs" },
    { value: "500+", label: "Automatisations" },
    { value: "2M+", label: "Messages Envoyés" },
    { value: "99.9%", label: "Uptime Garanti" },
  ];

  return (
    <div className="min-h-screen relative">
      {/* Fondo Futurístico */}
      <FuturisticBackground />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <Image
                src="/images/logo-europbots.svg"
                alt="EUROPBOTS Logo"
                width={300}
                height={120}
                className="h-24 w-auto mx-auto mb-8"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white font-syncopate uppercase tracking-wide mb-6">
              Bienvenue sur{" "}
              <span className="text-europbots-secondary">EUROPBOTS</span>
            </h1>
            <p className="text-xl md:text-2xl text-europbots-secondary/90 font-red-hat leading-relaxed max-w-3xl mx-auto mb-8">
              La plateforme d'automatisation la plus avancée pour propulser
              votre entreprise au niveau supérieur
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="europbots-button px-8 py-4 rounded-lg font-bold font-red-hat text-lg hover:bg-europbots-secondary/90 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Explorer les Automatisations</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-europbots-secondary text-europbots-secondary px-8 py-4 rounded-lg font-bold font-red-hat text-lg hover:bg-europbots-secondary hover:text-europbots-primary transition-all duration-200">
                Voir la Démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-europbots-secondary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Descubre por qué EUROPBOTS es la elección preferida para empresas
              que buscan automatización inteligente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8 hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-europbots-secondary/20"
                >
                  <div className="bg-europbots-secondary/20 p-4 rounded-lg w-fit mb-6">
                    <Icon className="w-8 h-8 text-europbots-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-europbots-primary/80 to-europbots-dark/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para Transformar tu Negocio?
          </h2>
          <p className="text-xl text-europbots-secondary/90 mb-8">
            Únete a miles de empresas que ya están automatizando sus procesos
            con EUROPBOTS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-europbots-secondary text-europbots-primary font-bold py-4 px-8 rounded-lg hover:bg-europbots-secondary/90 transition-colors text-lg">
              Comenzar Ahora
            </button>
            <button className="border-2 border-europbots-secondary text-europbots-secondary font-bold py-4 px-8 rounded-lg hover:bg-europbots-secondary hover:text-europbots-primary transition-colors text-lg">
              Contactar Ventas
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                ¿Por qué elegir EUROPBOTS?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-europbots-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Implementación Rápida
                    </h3>
                    <p className="text-gray-300">
                      Configura tu primera automatización en menos de 30 minutos
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-europbots-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Soporte 24/7
                    </h3>
                    <p className="text-gray-300">
                      Equipo de expertos disponible para ayudarte en cualquier
                      momento
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-europbots-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Escalabilidad Ilimitada
                    </h3>
                    <p className="text-gray-300">
                      Crece sin límites con nuestra infraestructura cloud
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-europbots-secondary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      ROI Garantizado
                    </h3>
                    <p className="text-gray-300">
                      Ve resultados positivos en los primeros 30 días
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-europbots-primary/80 to-europbots-dark/80 backdrop-blur-sm rounded-xl p-8 text-white border border-europbots-secondary/20">
              <h3 className="text-2xl font-bold mb-6">Prueba Gratuita</h3>
              <p className="text-europbots-secondary/90 mb-6">
                Comienza con 14 días de prueba gratuita. Sin compromisos, sin
                tarjetas de crédito.
              </p>
              <button className="w-full bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
                Iniciar Prueba Gratuita
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
