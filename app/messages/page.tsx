'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquare, Send, Clock, Check, User, Building, Calendar } from 'lucide-react'

export default function MessagesPage() {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      contact: 'Jean Dupont',
      company: 'Hotel Grand Paris',
      lastMessage: 'Merci pour la présentation. Quand pourrions-nous organiser une démo?',
      timestamp: '2024-01-15 14:30',
      status: 'active',
      unread: true,
      messages: [
        { id: 1, sender: 'them', content: 'Bonjour, je suis intéressé par vos robots de nettoyage.', timestamp: '2024-01-15 10:00' },
        { id: 2, sender: 'us', content: 'Bonjour Jean! Merci pour votre intérêt. Je vous envoie notre présentation.', timestamp: '2024-01-15 10:15' },
        { id: 3, sender: 'them', content: 'Merci pour la présentation. Quand pourrions-nous organiser une démo?', timestamp: '2024-01-15 14:30' }
      ]
    },
    {
      id: 2,
      contact: 'Maria Schmidt',
      company: 'Logistics Solutions GmbH',
      lastMessage: 'Perfect! I will review the proposal and get back to you.',
      timestamp: '2024-01-15 12:45',
      status: 'active',
      unread: false,
      messages: [
        { id: 1, sender: 'us', content: 'Hi Maria, here is our proposal for the cleaning robots.', timestamp: '2024-01-15 12:30' },
        { id: 2, sender: 'them', content: 'Perfect! I will review the proposal and get back to you.', timestamp: '2024-01-15 12:45' }
      ]
    },
    {
      id: 3,
      contact: 'David Wilson',
      company: 'CleanTech Services',
      lastMessage: 'Could you send me more information about the leasing options?',
      timestamp: '2024-01-15 11:20',
      status: 'pending',
      unread: true,
      messages: [
        { id: 1, sender: 'them', content: 'Could you send me more information about the leasing options?', timestamp: '2024-01-15 11:20' }
      ]
    }
  ])

  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'Connection Request - HoReCa',
      content: 'Bonjour [FirstName], je contacte les dirigeants du secteur HoReCa utilisant des robots autonomes. Ravi de nous connecter!',
      industry: 'HoReCa',
      type: 'connection'
    },
    {
      id: 2,
      name: 'Value Proposition - Cleaning',
      content: 'Merci pour la connexion! Chez Europbots, nous fournissons des robots capables de nettoyer de grands espaces sans supervision. Avez-vous déjà envisagé une telle solution?',
      industry: 'Cleaning Services',
      type: 'follow_up'
    },
    {
      id: 3,
      name: 'Demo Offer - General',
      content: 'Nos robots sont disponibles en leasing sans acompte. Je serais ravi de vous envoyer une courte vidéo de démo ou d\'organiser une visite de notre showroom.',
      industry: 'General',
      type: 'demo'
    }
  ])

  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '💬 Activa'
      case 'pending': return '⏳ Pendiente'
      case 'completed': return '✅ Completada'
      default: return '❓ Desconocida'
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const conversation = conversations.find(c => c.id === selectedConversation)
    if (!conversation) return

    const message = {
      id: conversation.messages.length + 1,
      sender: 'us' as const,
      content: newMessage,
      timestamp: new Date().toLocaleString()
    }

    setConversations(prev => 
      prev.map(c => 
        c.id === selectedConversation 
          ? { 
              ...c, 
              messages: [...c.messages, message],
              lastMessage: newMessage,
              timestamp: message.timestamp,
              unread: false
            }
          : c
      )
    )

    setNewMessage('')
  }

  const filteredConversations = conversations.filter(conv => 
    filterStatus === 'all' || conv.status === filterStatus
  )

  const currentConversation = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Gestión de Mensajes
          </h1>
          <p className="text-gray-600">
            Conversaciones y templates de mensajes automatizados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de conversaciones */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Conversaciones</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    Todas
                  </Button>
                  <Button
                    variant={filterStatus === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('active')}
                  >
                    Activas
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pendientes
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-europbots-blue text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium">{conversation.contact}</div>
                        {conversation.unread && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="text-sm opacity-75">{conversation.company}</div>
                      <div className="text-xs opacity-60 mt-1 truncate">
                        {conversation.lastMessage}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedConversation === conversation.id 
                            ? 'bg-white text-europbots-blue' 
                            : getStatusColor(conversation.status)
                        }`}>
                          {getStatusLabel(conversation.status)}
                        </span>
                        <span className="text-xs opacity-60">
                          {new Date(conversation.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              {currentConversation ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{currentConversation.contact}</CardTitle>
                        <CardDescription>{currentConversation.company}</CardDescription>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentConversation.status)}`}>
                        {getStatusLabel(currentConversation.status)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {currentConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'us' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'us'
                                ? 'bg-europbots-blue text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'us' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Escribe tu mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        rows={2}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <Button onClick={sendMessage} className="bg-europbots-blue hover:bg-europbots-blue-dark">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona una conversación para comenzar</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Templates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Templates de Mensajes</CardTitle>
            <CardDescription>
              Plantillas predefinidas para diferentes tipos de comunicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {template.industry}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {template.content}
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                    <Button size="sm" className="bg-europbots-blue hover:bg-europbots-blue-dark">
                      Usar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 