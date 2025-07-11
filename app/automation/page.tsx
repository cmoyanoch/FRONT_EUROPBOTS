'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Play, Pause, Settings, MessageSquare, Users, Calendar, BarChart3 } from 'lucide-react'

export default function AutomationPage() {
  const [activeWorkflows, setActiveWorkflows] = useState([
    { id: 1, name: 'LinkedIn Search Export', status: 'active', step: 1, totalSteps: 6 },
    { id: 2, name: 'Profile Visitor', status: 'active', step: 2, totalSteps: 6 },
    { id: 3, name: 'Email Discovery', status: 'active', step: 3, totalSteps: 6 },
    { id: 4, name: 'Auto Connect', status: 'paused', step: 4, totalSteps: 6 },
    { id: 5, name: 'Message Sequence', status: 'active', step: 5, totalSteps: 6 },
    { id: 6, name: 'Performance Tracking', status: 'active', step: 6, totalSteps: 6 }
  ])

  const [templates, setTemplates] = useState([
    {
      industry: 'Cleaning Industry',
      messages: [
        {
          type: 'Connection Request',
          content: 'Bonjour [FirstName], je contacte les dirigeants du secteur du nettoyage utilisant des robots autonomes. Ravi de nous connecter!',
          status: 'active'
        },
        {
          type: 'Value Proposition',
          content: 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables de nettoyer de grands espaces (bureaux, centres commerciaux, sites industriels) sans supervision. Avez-vous déjà envisagé une telle solution pour optimiser vos opérations ou réduire les coûts RH?',
          status: 'active'
        },
        {
          type: 'Call to Action',
          content: 'Nos robots sont disponibles en leasing sans acompte. Je serais ravi de vous envoyer une courte vidéo de démo ou d\'organiser une visite de notre showroom à Paris si vous êtes curieux!',
          status: 'active'
        }
      ]
    }
  ])

  const getStepIcon = (step: number) => {
    const icons = [Users, MessageSquare, Calendar, BarChart3, Bot, Settings]
    return icons[step - 1] || Settings
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const toggleWorkflow = (id: number) => {
    setActiveWorkflows(prev => 
      prev.map(wf => 
        wf.id === id 
          ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' }
          : wf
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Automation Dashboard
          </h1>
          <p className="text-gray-600">
            Workflows automatizados de n8n para la prospección B2B
          </p>
        </div>

        {/* Workflow de n8n Integrado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              Proceso Automatizado Completo
            </CardTitle>
            <CardDescription>
              Workflow integrado de n8n para automatizar la prospección
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeWorkflows.map((workflow) => {
                const StepIcon = getStepIcon(workflow.step)
                return (
                  <div key={workflow.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-europbots-blue text-white rounded-full">
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-gray-500">
                          Paso {workflow.step} de {workflow.totalSteps}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                        {workflow.status === 'active' ? '✅ ACTIVO' : '⏸️ PAUSA'}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWorkflow(workflow.id)}
                      >
                        {workflow.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Templates Personalizados */}
          <Card>
            <CardHeader>
              <CardTitle>Templates Personalizados por Industria</CardTitle>
              <CardDescription>
                Mensajes optimizados para cada sector objetivo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {templates.map((template, index) => (
                <div key={index} className="space-y-4">
                  <div className="font-medium text-lg text-europbots-blue">
                    {template.industry}
                  </div>
                  {template.messages.map((message, msgIndex) => (
                    <div key={msgIndex} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{message.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                          {message.status === 'active' ? '✅ Activo' : '⏸️ Pausado'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Configuración de Automatización */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Automatización</CardTitle>
              <CardDescription>
                Ajustes y parámetros de los workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">Delay entre acciones</div>
                    <div className="text-sm text-gray-600">24-48h para simular comportamiento humano</div>
                  </div>
                  <span className="text-blue-600 font-medium">24-48h</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">Límite de mensajes</div>
                    <div className="text-sm text-gray-600">Máximo 3 mensajes por prospecto</div>
                  </div>
                  <span className="text-green-600 font-medium">3 max</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">Integración CRM</div>
                    <div className="text-sm text-gray-600">Sincronización automática con Axonaut</div>
                  </div>
                  <span className="text-purple-600 font-medium">✅ Activa</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <div className="font-medium">Rate Limiting</div>
                    <div className="text-sm text-gray-600">Límites de actividad para evitar bloqueos</div>
                  </div>
                  <span className="text-orange-600 font-medium">Configurado</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button className="w-full bg-europbots-blue hover:bg-europbots-blue-dark">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Workflows
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Logs de Actividad
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 