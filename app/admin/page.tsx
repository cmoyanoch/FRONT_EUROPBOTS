'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Users, 
  Shield, 
  Settings, 
  UserPlus, 
  UserX, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react'
import FuturisticBackground from '@/components/futuristic-background'
import Link from 'next/link'

interface User {
  id: string
  email: string
  full_name?: string
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
}

interface MenuPermission {
  id: string
  name: string
  path: string
  icon: string
  roles: string[]
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPermissions, setShowPermissions] = useState(false)

  // Permisos del menú por rol
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([
    { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: 'Home', roles: ['user', 'admin'] },
    { id: 'search', name: 'Recherche', path: '/search', icon: 'Search', roles: ['user', 'admin'] },
    { id: 'analytics', name: 'Analytics', path: '/analytics', icon: 'BarChart3', roles: ['admin'] },
    { id: 'automation', name: 'Automation', path: '/automation', icon: 'Bot', roles: ['admin'] },
    { id: 'leads', name: 'Leads', path: '/leads', icon: 'Users', roles: ['user', 'admin'] },
    { id: 'messages', name: 'Messages', path: '/messages', icon: 'MessageSquare', roles: ['user', 'admin'] },
    { id: 'config', name: 'Config', path: '/config', icon: 'Settings', roles: ['admin'] },
    { id: 'alerts', name: 'Alertas', path: '/alerts', icon: 'Bell', roles: ['user', 'admin'] },
  ])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !users.find(u => u.id === userId)?.is_active }),
      })

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_active: !user.is_active } : user
        ))
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const updateMenuPermission = (menuId: string, role: string, enabled: boolean) => {
    setMenuPermissions(prev => prev.map(menu => {
      if (menu.id === menuId) {
        if (enabled && !menu.roles.includes(role)) {
          return { ...menu, roles: [...menu.roles, role] }
        } else if (!enabled && menu.roles.includes(role)) {
          return { ...menu, roles: menu.roles.filter(r => r !== role) }
        }
      }
      return menu
    }))
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <FuturisticBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-europbots-secondary" />
            Panel de Administración
          </h1>
          <p className="text-gray-300">
            Gestiona usuarios, roles y permisos del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-europbots-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Usuarios</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Administradores</p>
                  <p className="text-2xl font-bold text-white">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Usuarios</p>
                  <p className="text-2xl font-bold text-white">{stats.users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Activos</p>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <EyeOff className="h-8 w-8 text-red-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Inactivos</p>
                  <p className="text-2xl font-bold text-white">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-europbots-primary/20 border-europbots-secondary/30 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 rounded-lg bg-europbots-primary/20 border border-europbots-secondary/30 text-white"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="user">Usuarios</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg bg-europbots-primary/20 border border-europbots-secondary/30 text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>

              <Button
                onClick={() => setShowPermissions(!showPermissions)}
                className="bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90 shadow-lg shadow-europbots-secondary/25"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showPermissions ? 'Ocultar' : 'Mostrar'} Permisos
              </Button>

              <Link href="/register">
                <Button className="bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90 shadow-lg shadow-europbots-secondary/25">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Gestión de Permisos */}
        {showPermissions && (
          <Card className="mb-8 bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-europbots-secondary" />
                Gestión de Permisos del Menú
              </CardTitle>
              <CardDescription className="text-gray-300">
                Configura qué opciones del menú puede ver cada rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-europbots-secondary/20">
                      <th className="text-left py-3 px-4 text-white font-medium">Opción del Menú</th>
                      <th className="text-center py-3 px-4 text-white font-medium">Usuarios</th>
                      <th className="text-center py-3 px-4 text-white font-medium">Administradores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuPermissions.map((menu) => (
                      <tr key={menu.id} className="border-b border-europbots-secondary/10">
                        <td className="py-3 px-4 text-gray-300">{menu.name}</td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            checked={menu.roles.includes('user')}
                            onCheckedChange={(checked) => updateMenuPermission(menu.id, 'user', checked as boolean)}
                            className="bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            checked={menu.roles.includes('admin')}
                            onCheckedChange={(checked) => updateMenuPermission(menu.id, 'admin', checked as boolean)}
                            className="bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Usuarios */}
        <Card className="bg-europbots-primary/20 backdrop-blur-md border-europbots-secondary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-europbots-secondary" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription className="text-gray-300">
              Administra usuarios y sus roles en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-europbots-secondary/20">
                    <th className="text-left py-3 px-4 text-white font-medium">Usuario</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Rol</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Estado</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Fecha de Creación</th>
                    <th className="text-center py-3 px-4 text-white font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-europbots-secondary/10">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'Sin nombre'}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as 'user' | 'admin')}
                          className="px-3 py-1 rounded bg-europbots-primary/20 border border-europbots-secondary/30 text-white text-sm"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user.id)}
                          className="text-gray-300 border-gray-400/30 hover:bg-white/10"
                        >
                          {user.is_active ? <UserX className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 