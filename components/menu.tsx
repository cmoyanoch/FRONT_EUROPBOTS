'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Home, 
  Search, 
  BarChart3, 
  Bot, 
  Users, 
  MessageSquare, 
  Settings, 
  Bell,
  Menu as MenuIcon,
  X,
  LogOut,
  User
} from 'lucide-react'

interface MenuProps {
  user?: {
    id: string
    email: string
    full_name?: string
    role?: string
    avatar_url?: string
  } | null
  className?: string
}

export default function Menu({ user, className }: MenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()

  // Ocultar menú en login, register o si NO hay usuario autenticado
  if (!user || pathname === '/login' || pathname === '/register') return null;

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const isActive = (path: string) => pathname === path

  const menuItems = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/search', label: 'Búsqueda', icon: Search },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/automation', label: 'Automation', icon: Bot },
    { href: '/leads', label: 'Leads', icon: Users },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/config', label: 'Config', icon: Settings },
    { href: '/alerts', label: 'Alertas', icon: Bell },
  ]

  return (
    <nav className={`bg-white border-b border-gray-200 shadow-sm ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/images/europbots-logo.png" 
                alt="EUROPBOTS" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-europbots-blue">
                EUROPBOTS
              </span>
            </Link>

            {/* Menú de navegación - Desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-europbots-blue text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-europbots-blue'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Menú de usuario */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-700 hover:text-europbots-blue"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Menú de usuario */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} alt={user.full_name || user.email} />
                    <AvatarFallback className="bg-europbots-blue text-white text-sm">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {/* Dropdown del usuario */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex flex-col space-y-1">
                          {user.full_name && <p className="font-medium text-sm">{user.full_name}</p>}
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          {user.role && (
                            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                          )}
                        </div>
                      </div>
                      
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                      
                      {user.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      )}
                      
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          handleLogout()
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-europbots-blue hover:bg-europbots-blue-dark">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}

            {/* Botón de menú móvil */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-europbots-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-europbots-blue'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
} 