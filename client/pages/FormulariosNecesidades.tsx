import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Download, Trash2, Plus, ArrowLeft, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type NecesidadForm = {
  id: string | number;
  provincia: string;
  localidad: string;
  apies: string;
  empleados_total: number;
  gestor: string;
  email_gestor: string;
  experiencia_cliente: string;
  liderazgo: string;
  comentarios: string;
  seguridad_operativa: string;
  respuesta_ia: string;
  created_at: string;
};

const FormulariosNecesidades = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [forms, setForms] = useState<NecesidadForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gestor: "",
    apies: "",
    date: ""
  });
  const [dateOrder, setDateOrder] = useState<"newest" | "oldest">("newest");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIA, setSelectedIA] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://dm-back-fn4l.onrender.com/get_necesidades_form", {
        headers: {
          Authorization: "1803-1989-1803-1989"
        }
      });
      
      if (!response.ok) {
        throw new Error("Error fetching forms");
      }
      
      const data = await response.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch forms",
        variant: "destructive"
      });
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDownload = async (id: string | number) => {
    try {
      const response = await fetch(`https://dm-back-fn4l.onrender.com/get_necesidades_form_pdf/${id}`, {
        headers: { Authorization: "1803-1989-1803-1989" }
      });
      
      if (!response.ok) throw new Error("Error downloading PDF");
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `necesidades_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const handleDownloadAll = async () => {
    try {
      const res = await fetch(
        'https://dm-back-fn4l.onrender.com/download_necesidades_excel',
        {
          method: 'GET',
          headers: {
            'Authorization': '1803-1989-1803-1989'
          }
        }
      );
      if (!res.ok) throw new Error('Error downloading Excel');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Formularios_Necesidades.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Excel file downloaded successfully"
      });
    } catch (e) {
      console.error('Download error:', e);
      toast({
        title: "Error",
        description: "Failed to download Excel file",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (id: string | number) => {
    setFormToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const deleteFormById = async () => {
    if (!formToDelete) return;

    try {
      let email = localStorage.getItem("email")
      console.log("DATOS A ELIMINAR: ",{ id: formToDelete , email:email.trim()})
      const response = await fetch("https://dm-back-fn4l.onrender.com/delete_especific_necesidades_form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989"
        },

        body: JSON.stringify({ id: formToDelete , email:email.trim()})
      });

      if (!response.ok) throw new Error("Error deleting form");

      setForms(prevForms => prevForms.filter(form => form.id !== formToDelete));
      toast({
        title: "Success",
        description: "Form deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive"
      });
    } finally {
      setDeleteConfirmOpen(false);
      setFormToDelete(null);
    }
  };

  const handleViewIA = (iaResponse: string) => {
    setSelectedIA(iaResponse);
    setOpenModal(true);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedIA).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive"
      });
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  const filteredAndSortedForms = forms
    .filter(form => {
      const matchesGestor = !filters.gestor || form.gestor.toLowerCase().includes(filters.gestor.toLowerCase());
      const matchesApies = !filters.apies || form.apies.toLowerCase().includes(filters.apies.toLowerCase());
      const matchesDate = !filters.date || form.created_at.includes(filters.date);

      return matchesGestor && matchesApies && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const clearFilters = () => {
    setFilters({ gestor: "", apies: "", date: "" });
    setDateOrder("newest");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Title with Back Arrow */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 p-2"
              aria-label="Volver al dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Formularios de Necesidades</h1>
          </div>

          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar todos
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 mb-6 border">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Filtrar por gestor"
              value={filters.gestor}
              onChange={(e) => setFilters(prev => ({ ...prev, gestor: e.target.value }))}
            />
            <Input
              placeholder="Filtrar por apies"
              value={filters.apies}
              onChange={(e) => setFilters(prev => ({ ...prev, apies: e.target.value }))}
            />
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            />
            <Select value={dateOrder} onValueChange={(value: "newest" | "oldest") => setDateOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más nuevo</SelectItem>
                <SelectItem value="oldest">Más antiguo</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        {/* Forms List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Cargando formularios...</div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            {filteredAndSortedForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron formularios
              </div>
            ) : (
              <>
                {/* Desktop Header */}
                <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
                  <div>Dia/Hora</div>
                  <div>Gestor</div>
                  <div>Apies</div>
                  <div>Localidad</div>
                  <div>Respuesta IA</div>
                  <div>Acciones</div>
                </div>

                {/* Forms List */}
                <div className="divide-y">
                  {filteredAndSortedForms.map((form) => (
                    <div 
                      key={form.id} 
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      {/* Mobile Layout */}
                      <div className="md:hidden space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1 flex-1">
                            <div className="font-medium">{form.gestor}</div>
                            <div className="text-sm text-muted-foreground">{form.apies}</div>
                            <div className="text-xs text-muted-foreground">
                              {form.localidad}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(form.created_at)}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4 flex-wrap justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewIA(form.respuesta_ia)}
                              aria-label={`View IA response ${form.id}`}
                              title="Ver respuesta IA"
                              className="text-primary hover:text-primary"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownload(form.id)}
                              aria-label={`Download form ${form.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClick(form.id)}
                              aria-label={`Delete form ${form.id}`}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                        <div className="text-sm">{formatDate(form.created_at)}</div>
                        <div className="font-medium">{form.gestor}</div>
                        <div className="text-sm">{form.apies}</div>
                        <div className="text-sm">{form.localidad}</div>
                        <div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewIA(form.respuesta_ia)}
                            aria-label={`View IA response ${form.id}`}
                            title="Ver respuesta IA"
                            className="text-primary hover:text-primary"
                          >
                            Ver IA
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(form.id)}
                            aria-label={`Download form ${form.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(form.id)}
                            aria-label={`Delete form ${form.id}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El formulario será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteFormById}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* IA Response Dialog */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent className="
            w-full 
            max-w-4xl 
            max-h-[90vh] 
            my-8 
            flex 
            flex-col 
            p-0
            border-none
          ">
            {/* HEADER (Fijo) */}
            <DialogHeader className="shrink-0 px-4 sm:px-6 py-4 border-b border-border text-left space-y-0">
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground">
                Evaluación automática de la estación
              </DialogTitle>
            </DialogHeader>

            {/* BODY (Scrollable) */}
            <div className="
              flex-1 
              overflow-y-auto 
              px-4 
              sm:px-6 
              py-4
            ">
              <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 text-foreground p-4 rounded-lg">
                {selectedIA}
              </div>
            </div>

            {/* FOOTER (Fijo) */}
            <DialogFooter className="shrink-0 px-4 sm:px-6 py-3 border-t border-border flex flex-col sm:flex-row gap-3 justify-end items-center">
              
              {/* Botón de Copiar */}
              <Button
                variant="secondary"
                onClick={handleCopy}
                className={`w-full sm:w-auto transition-colors duration-300 ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copiar todo
                  </>
                )}
              </Button>

              {/* Botón de Aceptar */}
              <Button 
                onClick={() => setOpenModal(false)}
                className="w-full sm:w-auto"
              >
                Aceptar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FormulariosNecesidades;
