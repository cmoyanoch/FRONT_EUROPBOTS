'use client'

import { useState } from 'react'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Zap,
  Globe,
  Mail,
  Key,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [isSavingWebhook, setIsSavingWebhook] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'integrations', name: 'Integraciones', icon: Zap },
    { id: 'api', name: 'API', icon: Key }
  ]

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('Por favor, ingresa una URL válida para el webhook')
      return
    }

    setIsSavingWebhook(true)
    try {
      // Aquí iría la llamada a la API para guardar el webhook
      const response = await fetch('/api/config/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
      })

      if (response.ok) {
        setWebhookStatus('success')
        setTimeout(() => setWebhookStatus('idle'), 3000)
      } else {
        throw new Error('Error al guardar el webhook')
      }
    } catch (error) {
      console.error('Error saving webhook:', error)
      setWebhookStatus('error')
      setTimeout(() => setWebhookStatus('idle'), 3000)
    } finally {
      setIsSavingWebhook(false)
    }
  }

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      alert('Por favor, ingresa una URL válida para el webhook')
      return
    }

    setIsTestingConnection(true)
    try {
      const response = await fetch('/api/config/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl: webhookUrl.trim() }),
      })

      if (response.ok) {
        alert('Conexión exitosa! El webhook está funcionando correctamente.')
      } else {
        throw new Error('Error al probar la conexión')
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
      alert('Error al probar la conexión. Verifica que la URL sea correcta.')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleCopyWebhookUrl = () => {
    if (webhookUrl.trim()) {
      navigator.clipboard.writeText(webhookUrl.trim())
      alert('URL copiada al portapapeles')
    } else {
      alert('No hay URL para copiar')
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
            <input
              type="text"
              defaultValue="Juan Pérez"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="juan.perez@empresa.com"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
            <input
              type="tel"
              defaultValue="+34 600 123 456"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Empresa</label>
            <input
              type="text"
              defaultValue="Tech Solutions S.L."
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preferencias</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Idioma</p>
              <p className="text-sm text-gray-300">Selecciona el idioma de la interfaz</p>
            </div>
            <select className="px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm">
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Zona Horaria</p>
              <p className="text-sm text-gray-300">Configura tu zona horaria local</p>
            </div>
            <select className="px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm">
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="Europe/London">London (GMT+0)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cambiar Contraseña</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña Actual</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-3 pr-10 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nueva Contraseña</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              placeholder="••••••••"
            />
          </div>
          <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
            Cambiar Contraseña
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Autenticación de Dos Factores</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">2FA</p>
            <p className="text-sm text-gray-300">Añade una capa extra de seguridad</p>
          </div>
          <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
            Configurar 2FA
          </button>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notificaciones por Email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Nuevos Leads</p>
              <p className="text-sm text-gray-300">Recibe notificaciones cuando se generen nuevos leads</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Conversiones</p>
              <p className="text-sm text-gray-300">Notificaciones de conversiones exitosas</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Errores de Automatización</p>
              <p className="text-sm text-gray-300">Alertas cuando las automatizaciones fallen</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Reportes Semanales</p>
              <p className="text-sm text-gray-300">Resumen semanal de actividad</p>
            </div>
            <input type="checkbox" className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2" />
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notificaciones Push</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Notificaciones en Tiempo Real</p>
              <p className="text-sm text-gray-300">Recibe alertas instantáneas en el navegador</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-europbots-secondary bg-white/10 border-europbots-secondary/20 rounded focus:ring-europbots-secondary focus:ring-2" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Integraciones Conectadas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">LinkedIn</p>
                <p className="text-sm text-gray-300">Conectado • Última sincronización: Hace 2 horas</p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm font-medium">Desconectar</button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Gmail</p>
                <p className="text-sm text-gray-300">Conectado • Última sincronización: Hace 1 día</p>
              </div>
            </div>
            <button className="text-red-400 hover:text-red-300 text-sm font-medium">Desconectar</button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">CRM HubSpot</p>
                <p className="text-sm text-gray-300">No conectado</p>
              </div>
            </div>
            <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors text-sm">
              Conectar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderApiTab = () => (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">API Key Principal</p>
              <button className="text-europbots-secondary hover:text-europbots-secondary/80 text-sm font-medium">
                Regenerar
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="password"
                defaultValue="sk_live_1234567890abcdef"
                className="flex-1 px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                readOnly
              />
              <button className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Webhook del Bot de Búsqueda</h3>
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">URL del Webhook</p>
              <button 
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="text-europbots-secondary hover:text-europbots-secondary/80 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="https://tu-bot.com/webhook/search"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
              />
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSaveWebhook}
                  disabled={isSavingWebhook}
                  className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingWebhook ? 'Guardando...' : 'Guardar Webhook'}</span>
                </button>
                <button 
                  onClick={handleCopyWebhookUrl}
                  className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Copiar URL
                </button>
              </div>
            </div>
            {webhookStatus === 'success' && (
              <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-300">
                  ✅ Webhook guardado exitosamente
                </p>
              </div>
            )}
            {webhookStatus === 'error' && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-300">
                  ❌ Error al guardar el webhook. Inténtalo de nuevo.
                </p>
              </div>
            )}
            <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Nota:</strong> Esta URL recibirá notificaciones automáticas cuando se complete una búsqueda de leads.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Documentación API</h3>
        <p className="text-gray-300 mb-4">
          Consulta nuestra documentación completa para integrar EUROPBOTS en tus aplicaciones.
        </p>
        <button className="bg-europbots-secondary text-europbots-primary font-bold py-2 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors">
          Ver Documentación
        </button>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab()
      case 'security': return renderSecurityTab()
      case 'notifications': return renderNotificationsTab()
      case 'integrations': return renderIntegrationsTab()
      case 'api': return renderApiTab()
      default: return renderProfileTab()
    }
  }

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
                Configuración
              </h1>
              <p className="text-gray-300">
                Gestiona tu cuenta y preferencias
              </p>
            </div>
            <button className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2">
              <Save className="w-5 h-5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-2 mb-8">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-europbots-secondary text-europbots-primary'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </main>
    </div>
  )
} 