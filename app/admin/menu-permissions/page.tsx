'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Settings, 
  Users, 
  Search, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface MenuOption {
  id: string
  name: string
  label: string
  href: string
  icon: string
  badge?: string
  order_index: number
}

interface Permission {
  menu_option_id: string
  name: string
  label: string
  can_access: boolean
}

interface RolePermissions {
  role: string
  permissions: Permission[]
}

interface MenuPermissionsData {
  menuOptions: MenuOption[]
  permissions: RolePermissions[]
}

export default function MenuPermissionsPage() {
  const [data, setData] = useState<MenuPermissionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    fetchMenuPermissions()
  }, [])

  const fetchMenuPermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/menu-permissions')
      
      if (!response.ok) {
        throw new Error('Error al cargar los permisos')
      }
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error al cargar los permisos del menú' })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (role: string, menuOptionId: string, checked: boolean) => {
    if (!data) return

    setData(prevData => {
      if (!prevData) return prevData

      const updatedPermissions = prevData.permissions.map(rolePerm => {
        if (rolePerm.role === role) {
          const updatedRolePermissions = rolePerm.permissions.map(perm => {
            if (perm.menu_option_id === menuOptionId) {
              return { ...perm, can_access: checked }
            }
            return perm
          })
          return { ...rolePerm, permissions: updatedRolePermissions }
        }
        return rolePerm
      })

      return { ...prevData, permissions: updatedPermissions }
    })
  }

  const savePermissions = async (role: string) => {
    if (!data) return

    try {
      setSaving(true)
      const rolePermissions = data.permissions.find(p => p.role === role)
      
      if (!rolePermissions) {
        throw new Error('Rol no encontrado')
      }

      const response = await fetch('/api/admin/menu-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          permissions: rolePermissions.permissions
        })
      })

      if (!response.ok) {
        throw new Error('Error al guardar los permisos')
      }

      const result = await response.json()
      setMessage({ type: 'success', text: result.message || 'Permisos guardados correctamente' })
      
      // Recargar datos para asegurar sincronización
      setTimeout(() => {
        fetchMenuPermissions()
      }, 1000)

    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error al guardar los permisos' })
    } finally {
      setSaving(false)
    }
  }

  const saveAllPermissions = async () => {
    if (!data) return

    try {
      setSaving(true)
      
      // Guardar permisos para cada rol
      for (const rolePerm of data.permissions) {
        const response = await fetch('/api/admin/menu-permissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: rolePerm.role,
            permissions: rolePerm.permissions
          })
        })

        if (!response.ok) {
          throw new Error(`Error al guardar permisos para ${rolePerm.role}`)
        }
      }

      setMessage({ type: 'success', text: 'Todos los permisos guardados correctamente' })
      
      // Recargar datos
      setTimeout(() => {
        fetchMenuPermissions()
      }, 1000)

    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'Error al guardar todos los permisos' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-europbots-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-europbots-secondary" />
              <span className="text-white">Cargando permisos del menú...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-europbots-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-white">Error al cargar los datos</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-europbots-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
                <Settings className="h-8 w-8 text-europbots-secondary" />
                <span>Gestión de Permisos del Menú</span>
              </h1>
              <p className="text-gray-300 mt-2">
                Configura qué opciones del menú puede ver cada rol
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={fetchMenuPermissions}
                variant="outline"
                className="border-europbots-secondary/30 text-europbots-secondary hover:bg-europbots-secondary/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar
              </Button>
              <Button
                onClick={saveAllPermissions}
                disabled={saving}
                className="bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Todo'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tabla de permisos */}
        <Card className="bg-europbots-primary/50 border-europbots-secondary/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="h-5 w-5 text-europbots-secondary" />
              <span>Permisos por Rol</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-europbots-secondary/20">
                    <th className="text-left py-3 px-4 text-europbots-secondary font-medium">
                      Opción del Menú
                    </th>
                    {data.permissions.map(rolePerm => (
                      <th key={rolePerm.role} className="text-center py-3 px-4 text-europbots-secondary font-medium">
                        {rolePerm.role === 'user' ? 'Usuarios' : 'Administradores'}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.menuOptions.map(option => (
                    <tr key={option.id} className="border-b border-europbots-secondary/10 hover:bg-europbots-secondary/5">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{option.label}</span>
                            {option.badge && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-europbots-secondary text-europbots-primary">
                                {option.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{option.href}</p>
                      </td>
                      {data.permissions.map(rolePerm => {
                        const permission = rolePerm.permissions.find(p => p.menu_option_id === option.id)
                        return (
                          <td key={`${option.id}-${rolePerm.role}`} className="text-center py-4 px-4">
                            <Checkbox
                              checked={permission?.can_access || false}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(rolePerm.role, option.id, checked as boolean)
                              }
                              className="h-5 w-5 rounded focus:ring-europbots-secondary bg-europbots-primary/20 border-europbots-secondary/30 text-europbots-secondary"
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Botones de guardado por rol */}
            <div className="mt-6 flex justify-end space-x-3">
              {data.permissions.map(rolePerm => (
                <Button
                  key={rolePerm.role}
                  onClick={() => savePermissions(rolePerm.role)}
                  disabled={saving}
                  variant="outline"
                  className="border-europbots-secondary/30 text-europbots-secondary hover:bg-europbots-secondary/10"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar {rolePerm.role === 'user' ? 'Usuarios' : 'Administradores'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 