'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  // Verificar si hay un token en la URL (para resetear contraseña)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const resetToken = urlParams.get('token')
      if (resetToken) {
        setToken(resetToken)
      }
    }
  }, [])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Error al enviar el email de recuperación')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword 
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Redirigir al login con mensaje de éxito
        router.push('/login?message=password-reset-success')
      } else {
        setError(data.error || 'Error al restablecer la contraseña')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Si hay un token, mostrar formulario de nueva contraseña
  if (token) {
    return (
      <div className="min-h-screen relative">
        <FuturisticBackground />
        
        <main className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="bg-europbots-secondary/20 p-3 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-europbots-secondary" />
                </div>
                <h1 className="text-2xl font-bold text-white">Nueva Contraseña</h1>
              </div>
              <p className="text-gray-300">
                Ingresa tu nueva contraseña para completar el restablecimiento
              </p>
            </div>

            {/* Formulario de nueva contraseña */}
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* Nueva contraseña */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent"
                    placeholder="Ingresa tu nueva contraseña"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent"
                  placeholder="Confirma tu nueva contraseña"
                  required
                />
              </div>

              {/* Mostrar errores */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-europbots-secondary text-europbots-primary font-bold py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-europbots-primary"></div>
                    <span>Actualizando contraseña...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Actualizar Contraseña</span>
                  </>
                )}
              </button>
            </form>

            {/* Enlace de regreso */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-europbots-secondary hover:text-europbots-secondary/80 transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al login</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Formulario para solicitar reset
  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />
      
      <main className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-europbots-secondary/20 p-3 rounded-lg">
                <Mail className="w-8 h-8 text-europbots-secondary" />
              </div>
              <h1 className="text-2xl font-bold text-white">Recuperar Contraseña</h1>
            </div>
            <p className="text-gray-300">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          {/* Mensaje de éxito */}
          {isSuccess && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-medium text-green-300">Email enviado</h3>
                  <p className="text-green-200 text-sm">
                    Hemos enviado un enlace de recuperación a tu correo electrónico. 
                    Revisa tu bandeja de entrada y sigue las instrucciones.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleRequestReset} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Mostrar errores */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full bg-europbots-secondary text-europbots-primary font-bold py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-europbots-primary"></div>
                  <span>Enviando email...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Enviar Email de Recuperación</span>
                </>
              )}
            </button>
          </form>

          {/* Enlaces de navegación */}
          <div className="mt-6 text-center space-y-3">
            <Link 
              href="/login" 
              className="text-europbots-secondary hover:text-europbots-secondary/80 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al login</span>
            </Link>
            
            <div className="text-gray-400 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link 
                href="/register" 
                className="text-europbots-secondary hover:text-europbots-secondary/80 transition-colors"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 