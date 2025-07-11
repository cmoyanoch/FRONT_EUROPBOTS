'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Rocket, Filter, MapPin, Building, Users, Briefcase } from 'lucide-react'

export default function SearchPage() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const sectors = [
    'HoReCa (Hoteles/Restaurantes)',
    'Logistics & Warehousing',
    'Cleaning Services',
    'Healthcare Institutions',
    'Commercial Real Estate',
    'Events & Exhibitions',
    'Construction',
    'Casinos & Entertainment',
    'Car Dealerships',
    'Large Retail Chains'
  ]

  const roles = [
    'C-Level (CEO, COO, CTO, CMO)',
    'VP/Director Level',
    'Operations Manager',
    'Facilities Manager',
    'Procurement Manager',
    'Innovation Manager',
    'General Manager'
  ]

  const countries = [
    'Francia',
    'Alemania',
    'Reino Unido',
    'España',
    'Italia',
    'Países Bajos',
    'Bélgica',
    'Otros países UE'
  ]

  const companySizes = [
    '11-50 empleados',
    '51-200 empleados',
    '201-500 empleados',
    '501-1000 empleados',
    '1000+ empleados'
  ]

  const handleSectorChange = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    )
  }

  const handleRoleChange = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    )
  }

  const handleSizeChange = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
  }

  const handleSearch = async () => {
    setIsSearching(true)
    
    // Simular búsqueda
    setTimeout(() => {
      setIsSearching(false)
      // Aquí se integraría con PhantomBuster
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Búsqueda Inteligente de Perfiles
          </h1>
          <p className="text-gray-600">
            Encuentra prospectos cualificados en LinkedIn usando filtros avanzados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de filtros */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros de Búsqueda
                </CardTitle>
                <CardDescription>
                  Selecciona los criterios para encontrar prospectos ideales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sectores */}
                <div>
                  <Label className="text-sm font-medium flex items-center mb-3">
                    <Building className="w-4 h-4 mr-2" />
                    Sector Objetivo
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sectors.map((sector) => (
                      <div key={sector} className="flex items-center space-x-2">
                        <Checkbox
                          id={sector}
                          checked={selectedSectors.includes(sector)}
                          onCheckedChange={() => handleSectorChange(sector)}
                        />
                        <Label htmlFor={sector} className="text-sm cursor-pointer">
                          {sector}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <Label className="text-sm font-medium flex items-center mb-3">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Nivel Jerárquico
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {roles.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={role}
                          checked={selectedRoles.includes(role)}
                          onCheckedChange={() => handleRoleChange(role)}
                        />
                        <Label htmlFor={role} className="text-sm cursor-pointer">
                          {role}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Países */}
                <div>
                  <Label className="text-sm font-medium flex items-center mb-3">
                    <MapPin className="w-4 h-4 mr-2" />
                    Región Europea
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {countries.map((country) => (
                      <div key={country} className="flex items-center space-x-2">
                        <Checkbox
                          id={country}
                          checked={selectedCountries.includes(country)}
                          onCheckedChange={() => handleCountryChange(country)}
                        />
                        <Label htmlFor={country} className="text-sm cursor-pointer">
                          {country}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tamaño de empresa */}
                <div>
                  <Label className="text-sm font-medium flex items-center mb-3">
                    <Users className="w-4 h-4 mr-2" />
                    Tamaño de Empresa
                  </Label>
                  <div className="space-y-2">
                    {companySizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={size}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={() => handleSizeChange(size)}
                        />
                        <Label htmlFor={size} className="text-sm cursor-pointer">
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen de filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Búsqueda</CardTitle>
                <CardDescription>
                  Configuración actual de filtros seleccionados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-900">Sectores</div>
                    <div className="text-blue-700">{selectedSectors.length} seleccionados</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-900">Roles</div>
                    <div className="text-green-700">{selectedRoles.length} seleccionados</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-medium text-purple-900">Países</div>
                    <div className="text-purple-700">{selectedCountries.length} seleccionados</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="font-medium text-orange-900">Tamaños</div>
                    <div className="text-orange-700">{selectedSizes.length} seleccionados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón de ejecución */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || (!selectedSectors.length && !selectedRoles.length && !selectedCountries.length && !selectedSizes.length)}
                  className="w-full bg-europbots-blue hover:bg-europbots-blue-dark text-white py-3 text-lg"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Ejecutando búsqueda...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5 mr-2" />
                      🚀 Lanzar Búsqueda PhantomBuster
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  La búsqueda se ejecutará usando PhantomBuster y se filtrará según los criterios de EUROPBOTS
                </p>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Proceso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Exportación de búsqueda:</strong> Se exportarán perfiles de LinkedIn según los filtros
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Filtrado automático:</strong> Los resultados se filtrarán según los criterios de EUROPBOTS
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Integración CRM:</strong> Los leads cualificados se sincronizarán con Axonaut
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 