import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Edit,
  Save,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const API_BASE = "https://repomatic-turbo-meww.onrender.com";

interface InstructionsVersion {
  id: number;
  user: string;
  instructions: string;
  created_at: string;
}

export default function Instructions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [instructions, setInstructions] = useState<InstructionsVersion[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showUseModal, setShowUseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<InstructionsVersion | null>(null);

  useEffect(() => {
    fetchInstructions();
    const email = localStorage.getItem("email");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const fetchInstructions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/get_instructions`, {
        method: "GET",
        headers: {
          Authorization: "1803-1989-1803-1989",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener las instrucciones.");
      }

      const data: InstructionsVersion[] = await response.json();
      setInstructions(data);
      if (data.length > 0) {
        setCurrentText(data[0].instructions);
        setOriginalText(data[0].instructions);
      } else {
        setCurrentText("No hay instrucciones disponibles. Puedes agregar una nueva.");
        setOriginalText("No hay instrucciones disponibles. Puedes agregar una nueva.");
      }
    } catch (error: any) {
      console.error("Error fetching instructions:", error);
      toast({
        title: "Error de conexión",
        description: `No se pudieron cargar las instrucciones: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (currentText === originalText) {
      toast({
        title: "Sin cambios",
        description: "El texto no ha sido modificado.",
      });
      return;
    }
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    setShowSaveModal(false);
    try {
      const response = await fetch(`${API_BASE}/set_instructions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify({ instructions: currentText, user: userEmail }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar las instrucciones.");
      }

      toast({
        title: "Instrucciones guardadas 🎉",
        description: "Las nuevas instrucciones se han guardado exitosamente.",
      });
      fetchInstructions(); // Refresca la lista
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving instructions:", error);
      toast({
        title: "Error al guardar",
        description: `Hubo un problema: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUse = (version: InstructionsVersion) => {
    setSelectedVersion(version);
    setShowUseModal(true);
  };

  const confirmUse = async () => {
    if (!selectedVersion) return;
    setShowUseModal(false);

    try {
      const response = await fetch(`${API_BASE}/set_instructions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify({
          instructions: selectedVersion.instructions,
          user: userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al usar la versión.");
      }

      toast({
        title: "Versión aplicada 🎉",
        description: "La versión seleccionada ahora está en uso.",
      });
      fetchInstructions();
    } catch (error: any) {
      console.error("Error using instructions version:", error);
      toast({
        title: "Error al usar",
        description: `Hubo un problema: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (version: InstructionsVersion) => {
    setSelectedVersion(version);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedVersion) return;
    setShowDeleteModal(false);

    try {
      const response = await fetch(`${API_BASE}/delete_instructions`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify({ id: selectedVersion.id }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la versión.");
      }

      toast({
        title: "Versión eliminada",
        description: "El registro de instrucciones ha sido eliminado.",
      });
      fetchInstructions();
    } catch (error: any) {
      console.error("Error deleting instructions version:", error);
      toast({
        title: "Error al eliminar",
        description: `Hubo un problema: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleRead = (version: InstructionsVersion) => {
    setModalContent(version.instructions);
    setShowReadModal(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(modalContent);
    toast({
      title: "Copiado",
      description: "Instrucciones copiadas al portapapeles.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Instrucciones para Data Mentor
          </CardTitle>
          <CardDescription>
            Estas instrucciones guían a la IA de Data Mentor sobre cómo interactuar con tus datos.
            Piensa bien antes de hacer cambios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setCurrentText(originalText);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={currentText === originalText}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
              <Textarea
                rows={10}
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                readOnly={!isEditing}
                className="bg-card text-foreground border-border min-h-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Historial de versiones
          </CardTitle>
          <CardDescription>
            Visualiza, utiliza o elimina versiones anteriores de las instrucciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {instructions.length > 0 ? (
                instructions.map((version, index) => (
                  <div
                    key={version.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-lg gap-2"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          Versión del {new Date(version.created_at).toLocaleDateString()}
                        </span>
                        {index === 0 && <Badge variant="default">Actual</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Por: {version.user}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleRead(version)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleUse(version)}>
                        <Check className="h-4 w-4 mr-1" />
                        Usar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(version)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground col-span-full py-10">
                  No hay versiones anteriores de las instrucciones.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación para guardar */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <Save className="h-12 w-12 text-blue-500 mb-2" />
            <DialogTitle>Confirmar Guardado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas guardar estos cambios como la nueva versión de las instrucciones?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmSave}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para usar */}
      <Dialog open={showUseModal} onOpenChange={setShowUseModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <Check className="h-12 w-12 text-green-500 mb-2" />
            <DialogTitle>Confirmar Uso de Versión</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres usar esta versión de las instrucciones? Se convertirá en la versión actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUseModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmUse}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <Trash2 className="h-12 w-12 text-destructive mb-2" />
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este registro de instrucciones? Esta acción es irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para visualizar instrucciones */}
      <Dialog open={showReadModal} onOpenChange={setShowReadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contenido de la versión</DialogTitle>
            <DialogDescription>
              Copia el contenido o revísalo en detalle.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-md overflow-y-auto max-h-[400px]">
            <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
              {modalContent}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={() => setShowReadModal(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}