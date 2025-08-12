"use client";

import FuturisticBackground from "@/components/futuristic-background";
import { ToastNotification, useNotification } from "@/components/ui/notification";
import {
  Edit,
  Eye,
  FileText,
  Plus,
  Save,
  Trash2,
  X
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

interface Sector {
  name: string;
  code: string;
  description: string | null;
  order_index: number;
}

const TEMPLATE_TYPES = ["LinkedIn Autoconnect", "LinkedIn Message Sender"];

export default function MessagesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para el CRUD
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Estados para validación
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sistema de notificaciones
  const { notification, showNotification, hideNotification } = useNotification();

  // Formulario
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    sector: "",
    type: "",
  });

  // Función de validación
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "Le nom du template est requis";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Le nom doit contenir au moins 3 caractères";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Le nom ne peut pas dépasser 100 caractères";
    }

    // Validar contenido
    if (!formData.content.trim()) {
      newErrors.content = "Le contenu du message est requis";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "Le contenu doit contenir au moins 10 caractères";
    } else {
      const maxLength = formData.type === "LinkedIn Autoconnect" ? 300 :
                       formData.type === "LinkedIn Message Sender" ? 8000 : 2000;
      if (formData.content.trim().length > maxLength) {
        newErrors.content = `Le contenu ne peut pas dépasser ${maxLength} caractères`;
      }
    }

    // Validar sector
    if (!formData.sector) {
      newErrors.sector = "Veuillez sélectionner un secteur";
    }

    // Validar tipo
    if (!formData.type) {
      newErrors.type = "Veuillez sélectionner un type de template";
    }

    // Validar que no exista ya un template del mismo tipo en el mismo sector
    if (formData.sector && formData.type && checkTemplateTypeExists(formData.type, formData.sector)) {
      newErrors.type = `Un template de type "${formData.type}" existe déjà pour le secteur "${formData.sector}". Vous ne pouvez créer qu'un seul template par type par secteur.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cargar sectores
  const loadSectors = async () => {
    try {
      const response = await fetch("/api/search/filters");
      const data = await response.json();
      if (data.success && data.sectors) {
        setSectors(data.sectors);
      }
    } catch (error) {
      console.error("Error loading sectors:", error);
      showNotification("Erreur lors du chargement des secteurs", "error");
    }
  };

  // Cargar templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/message-templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      showNotification("Erreur lors du chargement des templates", "error");
    } finally {
      setLoading(false);
    }
  };

  // Verificar si ya existe un template del tipo seleccionado en el mismo sector
  const checkTemplateTypeExists = (type: string, sector: string) => {
    return templates.some(template => template.type === type && template.sector === sector);
  };

  // Crear template
  const createTemplate = async () => {
    if (!validateForm()) {
      showNotification("Veuillez corriger les erreurs dans le formulaire", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/message-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        await loadTemplates();
        resetForm();
        setIsCreating(false);
        showNotification("Template créé avec succès", "success");
      } else {
        showNotification(data.message || "Erreur lors de la création du template", "error");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      showNotification("Erreur lors de la création du template", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar template
  const updateTemplate = async () => {
    if (!editingId) return;

    if (!validateForm()) {
      showNotification("Veuillez corriger les erreurs dans le formulaire", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/message-templates/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        await loadTemplates();
        resetForm();
        setEditingId(null);
        showNotification("Template mis à jour avec succès", "success");
      } else {
        showNotification(data.message || "Erreur lors de la mise à jour du template", "error");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      showNotification("Erreur lors de la mise à jour du template", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar template
  const deleteTemplate = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) return;
    try {
      const response = await fetch(`/api/message-templates/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await loadTemplates();
        showNotification("Template supprimé avec succès", "success");
      } else {
        showNotification(data.message || "Erreur lors de la suppression du template", "error");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      showNotification("Erreur lors de la suppression du template", "error");
    }
  };

  // Editar template
  const editTemplate = (template: MessageTemplate) => {
    setFormData({
      name: template.name,
      content: template.content,
      sector: template.sector,
      type: template.type,
    });
    setEditingId(template.id);
    setErrors({});
  };

  // Ver template
  const viewTemplate = (template: MessageTemplate) => {
    setFormData({
      name: template.name,
      content: template.content,
      sector: template.sector,
      type: template.type,
    });
    setViewingId(template.id);
    setErrors({});
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      content: "",
      sector: "",
      type: "",
    });
    setErrors({});
  };

  // Cancelar formulario
  const cancelForm = () => {
    resetForm();
    setIsCreating(false);
    setEditingId(null);
    setViewingId(null);
  };

  // Función para cambiar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Cargar templates y sectores al montar el componente
  useEffect(() => {
    loadTemplates();
    loadSectors();
  }, []);

  // Filtrar templates
  const filteredTemplates = templates;

  // Lógica de paginación
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen relative">
      <FuturisticBackground />

      {/* Componente de notificación */}
      <ToastNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header con título y botón */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Modèles de messages
            </h1>
                                      <p className="text-gray-300">
              Gérez vos modèles de messages pour les campagnes LinkedIn
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Vous pouvez créer 2 templates par secteur (1 LinkedIn Autoconnect + 1 LinkedIn Message Sender par secteur).
            </p>
          </div>
                    <button
            onClick={() => setIsCreating(true)}
            className="font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 bg-europbots-secondary text-europbots-primary hover:bg-europbots-secondary/90"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau Template</span>
          </button>
        </div>

        {/* Modal de Crear/Editar */}
        {(isCreating || editingId || viewingId) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 p-8 max-w-2xl w-full mx-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {isCreating
                    ? "Créer Nouveau Template"
                    : editingId
                    ? "Modifier Template"
                    : "Voir Template"}
                </h2>
                <button
                  onClick={cancelForm}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-300" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isCreating) createTemplate();
                  else if (editingId) updateTemplate();
                }}
                className="space-y-6"
              >
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du Template *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: "" });
                      }
                    }}
                    disabled={!!viewingId}
                    className={`w-full pl-4 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm disabled:opacity-50 ${
                      errors.name ? 'border-red-500' : 'border-gray-400/30'
                    }`}
                    placeholder="Entrez le nom du template..."
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secteur *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => {
                      setFormData({ ...formData, sector: e.target.value, type: "" });
                      if (errors.sector) {
                        setErrors({ ...errors, sector: "" });
                      }
                      if (errors.type) {
                        setErrors({ ...errors, type: "" });
                      }
                    }}
                    disabled={!!viewingId}
                    className={`w-full pl-4 pr-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm disabled:opacity-50 ${
                      errors.sector ? 'border-red-500' : 'border-gray-400/30'
                    }`}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <option value="" disabled style={{ backgroundColor: "#1f2937", color: "#9ca3af" }}>
                      Sélectionnez un secteur...
                    </option>
                    {sectors.map((sector) => (
                      <option
                        key={sector.code}
                        value={sector.name}
                        style={{ backgroundColor: "#1f2937", color: "#ffffff" }}
                      >
                        {sector.name}
                      </option>
                    ))}
                  </select>
                  {errors.sector && (
                    <p className="mt-1 text-sm text-red-400">{errors.sector}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                      if (errors.type) {
                        setErrors({ ...errors, type: "" });
                      }
                    }}
                    disabled={!!viewingId || !formData.sector}
                    className={`w-full pl-4 pr-4 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm disabled:opacity-50 ${
                      errors.type ? 'border-red-500' : 'border-gray-400/30'
                    }`}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <option value="" disabled style={{ backgroundColor: "#1f2937", color: "#9ca3af" }}>
                      {!formData.sector ? "Sélectionnez d'abord un secteur..." : "Sélectionnez un type de template..."}
                    </option>
                    {TEMPLATE_TYPES.map((type) => {
                      const isTypeUsed = formData.sector ? checkTemplateTypeExists(type, formData.sector) : false;
                      return (
                        <option
                          key={type}
                          value={type}
                          disabled={isTypeUsed}
                          style={{
                            backgroundColor: "#1f2937",
                            color: isTypeUsed ? "#6b7280" : "#ffffff",
                          }}
                        >
                          {type} {isTypeUsed ? "(Déjà utilisé pour ce secteur)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-400">{errors.type}</p>
                  )}
                </div>

                {/* Contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contenu du Message *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => {
                      const newContent = e.target.value;
                      // Aplicar límite de caracteres según el tipo seleccionado
                      const maxLength = formData.type === "LinkedIn Autoconnect" ? 300 :
                                      formData.type === "LinkedIn Message Sender" ? 8000 : 2000;
                      if (newContent.length > maxLength) {
                        return; // No permitir más caracteres del límite establecido
                      }
                      setFormData({ ...formData, content: newContent });
                      if (errors.content) {
                        setErrors({ ...errors, content: "" });
                      }
                    }}
                    disabled={!!viewingId}
                    rows={6}
                                        placeholder={formData.type === "LinkedIn Message Sender"
                      ? "Hey #firstName#, let's chat!\n\nBest regards,"
                      : formData.type === "LinkedIn Autoconnect"
                      ? "Hey #firstName#, let's connect!\n\nBest regards"
                      : "Entrez le contenu de votre message..."}
                    maxLength={formData.type === "LinkedIn Autoconnect" ? 300 :
                             formData.type === "LinkedIn Message Sender" ? 8000 : 2000}
                    className={`w-full pl-4 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-europbots-secondary focus:border-transparent backdrop-blur-sm resize-none disabled:opacity-50 ${
                      errors.content ? 'border-red-500' : 'border-gray-400/30'
                    }`}

                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-400">{errors.content}</p>
                  )}
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-400">
                      {formData.content.length}/{formData.type === "LinkedIn Autoconnect" ? 300 :
                       formData.type === "LinkedIn Message Sender" ? 8000 : 2000} caractères
                    </p>
                  </div>
                </div>

                {/* Botones */}
                {!viewingId && (
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelForm}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-europbots-secondary text-black font-semibold rounded-lg hover:bg-europbots-secondary/80 transition-colors flex items-center disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          {isCreating ? "Création..." : "Sauvegarde..."}
                        </>
                      ) : isCreating ? (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Créer
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Tabla de Templates */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-europbots-secondary/20 overflow-hidden w-full">
          <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="bg-white/5">
                <tr>
                  <th className="w-2/5 px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Modèle
                  </th>
                  <th className="w-1/5 px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Secteur
                  </th>
                  <th className="w-1/5 px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="w-1/5 px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
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
                  currentTemplates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="w-2/5 px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-europbots-secondary/20 p-2 rounded-lg mr-3 flex-shrink-0">
                            <FileText className="w-5 h-5 text-europbots-secondary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white truncate">
                              {template.name}
                            </div>
                            <div className="text-sm text-gray-300 truncate mt-1">
                              {template.content.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="w-1/5 px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate">
                          {template.sector}
                        </span>
                      </td>
                      <td className="w-1/5 px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium truncate ${
                            template.type === "LinkedIn Autoconnect"
                              ? "bg-green-100 text-green-800"
                              : template.type === "LinkedIn Message Sender"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {template.type}
                        </span>
                      </td>
                      <td className="w-1/5 px-6 py-4 text-right text-sm font-medium">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-4 py-2 text-white">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
