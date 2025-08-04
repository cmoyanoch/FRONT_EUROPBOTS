"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Edit,
  Eye,
  FileText,
  Link,
  MessageSquare,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  sector: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SECTORS = [
  "Technologie",
  "Finance",
  "Commerce",
  "Consulting",
  "Real Estate",
  "Santé",
  "Éducation",
  "Manufacturing",
  "Media",
  "Government",
];

const TEMPLATE_TYPES = ["visitor", "auto_connect", "messenger", "general"];

export default function MessagesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el CRUD
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  // Formulario
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    sector: "Technologie",
    type: "visitor",
  });

  // Cargar templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/message-templates");
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des templates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Crear template
  const createTemplate = async () => {
    try {
      const response = await fetch("/api/message-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsCreating(false);
        resetForm();
        loadTemplates();
      }
    } catch (error) {
      console.error("Erreur lors de la création du template:", error);
    }
  };

  // Actualizar template
  const updateTemplate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/message-templates/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setEditingId(null);
        resetForm();
        loadTemplates();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du template:", error);
    }
  };

  // Eliminar template
  const deleteTemplate = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/message-templates/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        loadTemplates();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du template:", error);
    }
  };

  // Editar template
  const editTemplate = (template: MessageTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      content: template.content,
      sector: template.sector,
      type: template.type,
    });
  };

  // Ver template
  const viewTemplate = (template: MessageTemplate) => {
    setViewingId(template.id);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      content: "",
      sector: "Technologie",
      type: "visitor",
    });
  };

  // Cancelar formulario
  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  // Filtrar templates
  const filteredTemplates = templates;

  // Calcular métricas
  const totalTemplates = templates.length;
  const activeTemplates = templates.filter((t) => t.is_active).length;
  const autoConnectTemplates = templates.filter(
    (t) => t.type === "auto_connect"
  ).length;
  const messengerTemplates = templates.filter(
    (t) => t.type === "messenger"
  ).length;

  return (
    <div className="min-h-screen relative">
      {/* Fondo cuadriculado futurista */}
      <div className="futuristic-bg fixed inset-0 -z-10">
        {/* Grid pattern */}
        <div className="energy-grid"></div>

        {/* Puntos verdes dispersos */}
        <div className="energy-dots">
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "10%",
              top: "15%",
              animationDelay: "0s",
              animationDuration: "3s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "25%",
              top: "8%",
              animationDelay: "0.5s",
              animationDuration: "2.5s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "45%",
              top: "22%",
              animationDelay: "1s",
              animationDuration: "3.5s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "65%",
              top: "12%",
              animationDelay: "1.5s",
              animationDuration: "2s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "85%",
              top: "18%",
              animationDelay: "2s",
              animationDuration: "3s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "15%",
              top: "35%",
              animationDelay: "0.3s",
              animationDuration: "2.8s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "35%",
              top: "45%",
              animationDelay: "0.8s",
              animationDuration: "3.2s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "55%",
              top: "38%",
              animationDelay: "1.2s",
              animationDuration: "2.3s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "75%",
              top: "42%",
              animationDelay: "1.7s",
              animationDuration: "2.7s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "90%",
              top: "55%",
              animationDelay: "0.2s",
              animationDuration: "3.1s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "5%",
              top: "65%",
              animationDelay: "0.6s",
              animationDuration: "2.9s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "20%",
              top: "75%",
              animationDelay: "1.1s",
              animationDuration: "2.4s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "40%",
              top: "68%",
              animationDelay: "1.4s",
              animationDuration: "3.3s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "60%",
              top: "78%",
              animationDelay: "0.9s",
              animationDuration: "2.6s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "80%",
              top: "72%",
              animationDelay: "1.8s",
              animationDuration: "2.1s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "95%",
              top: "85%",
              animationDelay: "0.4s",
              animationDuration: "3.4s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "12%",
              top: "88%",
              animationDelay: "1.3s",
              animationDuration: "2.8s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "30%",
              top: "92%",
              animationDelay: "0.7s",
              animationDuration: "2.2s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "50%",
              top: "88%",
              animationDelay: "1.6s",
              animationDuration: "3s",
            }}
          />
          <div
            className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse"
            style={{
              left: "70%",
              top: "95%",
              animationDelay: "0.1s",
              animationDuration: "2.5s",
            }}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Templates de Messages
              </h1>
              <p className="text-gray-300">
                Gérez et personnalisez vos templates de messages automatiques
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsCreating(true)}
                className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nouveau Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Total Templates
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {totalTemplates}
                </p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Actifs</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {activeTemplates}
                </p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  Auto Connect
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {autoConnectTemplates}
                </p>
              </div>
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Link className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Messenger</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {messengerTemplates}
                </p>
              </div>
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de creación/edición */}
        {isCreating && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Créer Nouveau Template
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <Input
                  type="text"
                  placeholder="Nom du template"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-4 pr-4 py-3 bg-white/10 border border-gray-400/30 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full pl-4 pr-4 py-3 bg-white/10 border border-gray-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {TEMPLATE_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                      style={{
                        backgroundColor: "#1f2937",
                        color: "#ffffff",
                      }}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secteur
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) =>
                    setFormData({ ...formData, sector: e.target.value })
                  }
                  className="w-full pl-4 pr-4 py-3 bg-white/10 border border-gray-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {SECTORS.map((sector) => (
                    <option
                      key={sector}
                      value={sector}
                      style={{
                        backgroundColor: "#1f2937",
                        color: "#ffffff",
                      }}
                    >
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenu
                </label>
                <Textarea
                  placeholder="Contenu du template..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full pl-4 pr-4 py-3 bg-white/10 border border-gray-400/30 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm min-h-[120px]"
                  rows={5}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={createTemplate}
                  className="bg-europbots-secondary text-europbots-primary font-bold py-3 px-6 rounded-lg hover:bg-europbots-secondary/90 transition-colors flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Créer</span>
                </button>
                <button
                  onClick={cancelForm}
                  className="bg-white/10 text-white font-medium py-3 px-4 rounded-lg hover:bg-white/20 transition-colors border border-europbots-secondary/20 flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Annuler</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de visualización */}
        {viewingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 border border-gray-700 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Voir Template
                </h3>
                <button
                  onClick={() => setViewingId(null)}
                  className="bg-gray-600 hover:bg-gray-500 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {templates.find((t) => t.id === viewingId) && (
                <div className="text-gray-300">
                  <p>
                    <strong className="text-white">Nom:</strong>{" "}
                    {templates.find((t) => t.id === viewingId)?.name}
                  </p>
                  <p>
                    <strong className="text-white">Secteur:</strong>{" "}
                    {templates.find((t) => t.id === viewingId)?.sector}
                  </p>
                  <p>
                    <strong className="text-white">Type:</strong>{" "}
                    {templates.find((t) => t.id === viewingId)?.type}
                  </p>
                  <p>
                    <strong className="text-white">Contenu:</strong>
                  </p>
                  <div className="bg-gray-700 p-3 rounded mt-2 text-gray-300">
                    {templates.find((t) => t.id === viewingId)?.content}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabla de Templates */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Secteur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-europbots-secondary/10">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <p className="text-gray-400">
                        Chargement des templates...
                      </p>
                    </td>
                  </tr>
                ) : filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <p className="text-gray-400">Aucun template trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-europbots-secondary/20 p-2 rounded-lg mr-3">
                            <FileText className="w-5 h-5 text-europbots-secondary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {template.name}
                            </div>
                            <div className="text-sm text-gray-300 line-clamp-2 mt-1">
                              {template.content.substring(0, 100)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.sector}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.type === "visitor"
                              ? "bg-purple-100 text-purple-800"
                              : template.type === "auto_connect"
                              ? "bg-green-100 text-green-800"
                              : template.type === "messenger"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {template.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => viewTemplate(template)}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-300" />
                          </button>
                          <button
                            onClick={() => editTemplate(template)}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-300" />
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
