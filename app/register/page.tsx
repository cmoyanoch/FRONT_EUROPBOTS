"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/toast-provider'
import AnimatedCard from '@/components/ui/animated-card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { showSuccess, showError, showWarning, showInfo } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Les mots de passe ne correspondent pas';
      setError(errorMsg);
      showError('Erreur de validation', errorMsg);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess('Inscription réussie!', 'Vous pouvez maintenant vous connecter avec votre compte.');
        setTimeout(() => router.push('/login?message=registration-success'), 1500);
      } else {
        const errorMsg = data.error || 'Erreur lors de l\'inscription';
        setError(errorMsg);
        showError('Erreur d\'inscription', errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Erreur de connexion';
      setError(errorMsg);
      showError('Erreur', errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <FuturisticBackground />
      <div className="w-full max-w-md relative z-10">
        <AnimatedCard className="bg-white/10 backdrop-blur-sm rounded-2xl border border-europbots-secondary/20 p-6 sm:p-8 shadow-2xl" delay={0.2}>
          {/* Logo */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/images/logo-europbots.svg"
                alt="EUROPBOTS Logo"
                width={200}
                height={80}
                className="h-12 sm:h-16 w-auto mx-auto mb-4 filter brightness-0 invert"
              />
            </motion.div>
            <motion.h1 
              className="text-xl sm:text-2xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Créer un Compte
            </motion.h1>
            <motion.p 
              className="text-gray-300 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Rejoignez EUROPBOTS aujourd'hui
            </motion.p>
          </motion.div>

          {/* Formulario */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Nom Complet
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  animate={{ scale: formData.fullName ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <User className="h-5 w-5 text-gray-400" />
                </motion.div>
                <motion.input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="Votre nom complet"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Adresse E-mail
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  animate={{ scale: formData.email ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail className="h-5 w-5 text-gray-400" />
                </motion.div>
                <motion.input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="votre@email.com"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  animate={{ scale: formData.phone ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Phone className="h-5 w-5 text-gray-400" />
                </motion.div>
                <motion.input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="+33 6 12 34 56 78"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de Passe
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  animate={{ scale: formData.password ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </motion.div>
                <motion.input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="eyeoff1"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye1"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmer le Mot de Passe
              </label>
              <div className="relative">
                <motion.div 
                  className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  animate={{ scale: formData.confirmPassword ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Lock className="h-5 w-5 text-gray-400" />
                </motion.div>
                <motion.input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-europbots-secondary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {showConfirmPassword ? (
                      <motion.div
                        key="eyeoff2"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye2"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-europbots-secondary text-europbots-primary font-bold py-3 px-4 rounded-lg hover:bg-europbots-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <motion.div 
                      className="h-4 w-4 border-b-2 border-europbots-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Création du compte...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="create"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Créer le Compte
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <p className="text-sm text-gray-300">
              Vous avez déjà un compte ?{' '}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link href="/login" className="text-europbots-secondary hover:text-europbots-secondary/80 font-medium transition-colors">
                  Connectez-vous ici
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </AnimatedCard>
      </div>
    </div>
  )
} 