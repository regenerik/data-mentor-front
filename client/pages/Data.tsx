import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, Upload, AlertTriangle, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "https://repomatic-turbo-meww.onrender.com";
const RESTAURAR_PASSWORD_UNICO = "1803-1989-1803-1989"; // Este debería ser un valor seguro, idealmente en una variable de entorno.

export default function Data() {
  const [loading, setLoading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = async () => {
    setShowDownloadModal(false);
    setLoading(true);
    toast({
      title: "Iniciando descarga ⏳",
      description: "El servidor está preparando el archivo. Esto puede llevar unos minutos.",
    });

    try {
      const response = await fetch(`${API_BASE}/get_buckup`, {
        method: "GET",
        headers: {
          Authorization: "1803-1989-1803-1989",
        },
      });

      if (!response.ok) {
        throw new Error("Error al descargar el backup.");
      }

      const blob = await response.blob();
      const filename = response.headers.get("Content-Disposition")?.split("filename=")[1] || "backup.json";
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Descarga exitosa 🎉",
        description: "El backup ha sido descargado.",
      });
    } catch (error: any) {
      console.error("Error downloading backup:", error);
      toast({
        title: "Error de descarga",
        description: `Hubo un problema: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestoreClick = () => {
    if (!selectedFile) {
      toast({
        title: "Selecciona un archivo",
        description: "Por favor, elige un archivo JSON antes de restaurar.",
        variant: "destructive",
      });
      return;
    }
    setShowRestoreModal(true);
  };

  const handleRestoreDB = async () => {
  if (!selectedFile) return;

  setShowRestoreModal(false);
  setLoading(true);
  toast({
    title: "Iniciando restauración ⏳",
    description: "El servidor está restaurando la base de datos. No cierres la página.",
  });

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    // --- CAMBIO AQUÍ: AÑADIMOS EL PASSWORD AL FORM DATA ---
    formData.append("password", password);

    const response = await fetch(`${API_BASE}/restaurar_db`, {
      method: "POST",
      headers: {
        Authorization: "1803-1989-1803-1989",
        // NOTA: No incluyas 'Content-Type' cuando usas FormData, el navegador lo configura automáticamente.
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Error al restaurar la base de datos.");
    }

    toast({
      title: "Restauración exitosa 🎉",
      description: "La base de datos ha sido restaurada con éxito.",
    });
    setPassword("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (error: any) {
    console.error("Error restoring database:", error);
    toast({
      title: "Error de restauración",
      description: `Hubo un problema: ${error.message}`,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Descarga de Backup
          </CardTitle>
          <CardDescription >
            Crea un archivo de copia de seguridad con todos los datos de las tablas
            principales: Usuarios, Formularios, Históricos, Errores reportados e Instrucciones IA.
            <CardDescription className="text-destructive font-semibold">
                (Por motivos de seguridad, este buck-up no incluirá reportes ni tablas de ningun tipo.)
            </CardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowDownloadModal(true)}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Descargar Backup
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-destructive" />
            Restauración de Base de Datos
          </CardTitle>
          <CardDescription className="text-destructive font-semibold">
            ¡ADVERTENCIA! Al restaurar, se eliminarán todos los datos existentes
            y se reemplazarán por el contenido del archivo JSON. Esta acción es
            irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backup-file">Seleccionar archivo de restauración</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleRestoreClick}
            disabled={loading || !selectedFile}
            className="w-full md:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Restaurar Base de Datos
          </Button>
        </CardContent>
      </Card>

      {/* Modal de confirmación para descargar */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <Download className="h-12 w-12 text-primary mb-2" />
            <DialogTitle className="text-2xl font-bold text-primary">
              Confirmar Descarga
            </DialogTitle>
            <DialogDescription className="text-lg">
              ¿Estás seguro de que deseas iniciar la descarga del backup? Esto
              puede llevar unos minutos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDownloadModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDownloadBackup}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para restaurar */}
      <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
            <DialogTitle className="text-2xl font-bold text-destructive">
              ¡Advertencia de Restauración!
            </DialogTitle>
            <DialogDescription className="text-lg">
              Estás a punto de restaurar la base de datos.
            </DialogDescription>
            <DialogDescription className="text-sm text-muted-foreground">
              Esta acción es irreversible y eliminará todos los datos que no estén
              en el archivo JSON. Por favor, introduce la contraseña única de
              confirmación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="restore-password">Contraseña de confirmación</Label>
            <Input
              id="restore-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña única"
            />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRestoreModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRestoreDB}>
              <Upload className="h-4 w-4 mr-2" />
              Restaurar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}