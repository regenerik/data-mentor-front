import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Upload, Download, FileSpreadsheet } from "lucide-react";

interface FilterState {
  fecha_desde: string;
  fecha_hasta: string;
  apies: string;
  canal: string;
  topico: string;
  min_caracteres: string;
  sentimiento: string;
}

export default function NecesidadesApies() {
  const [filters, setFilters] = useState<FilterState>({
    fecha_desde: "",
    fecha_hasta: "",
    apies: "",
    canal: "",
    topico: "",
    min_caracteres: "",
    sentimiento: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [porcentaje, setPorcentaje] = useState(0);
  const [procesoId, setProcesoId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Consulta de progreso
  useEffect(() => {
    if (!isProcessing || !procesoId) return;

    const interval = setInterval(() => {
      fetch(`http://localhost:5000/progreso/${procesoId}`)
        .then((res) => res.json())
        .then((data) => {
          setPorcentaje(data.porcentaje);

          // Scroll al progreso si está avanzando
          if (data.porcentaje > 0 && progressRef.current) {
            progressRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          if (data.finalizado) {
            setIsCompleted(true);
            setIsProcessing(false);
            clearInterval(interval);

            // Scroll al botón de descarga, una vez montado
            setTimeout(() => {
              if (downloadButtonRef.current) {
                downloadButtonRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 300); // Delay para asegurarse que el botón exista
          }
        })
        .catch((err) => {
          console.error("Error fetching progress:", err);
          clearInterval(interval);
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [isProcessing, procesoId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Seleccioná un archivo Excel primero.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_id", "1"); // En el futuro reemplazarlo por una lectura de estado global del id del usuario. :D PORFI yo del futuro. No te olvides
    Object.entries(filters).forEach(([key, value]) => {
      formData.append(key, value);
    });

    setIsProcessing(true);
    setIsCompleted(false);
    setPorcentaje(0);

    fetch("http://localhost:5000/comentarios_necesidades_final", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Respuesta cruda del backend:", data); // AGREGADO
        if (
          data.comentarios_filtrados_a_procesar !== undefined &&
          data.proceso_id !== undefined
        ) {
          alert(
            `Se filtraron ${data.comentarios_filtrados_a_procesar} comentarios para procesar.\nProceso ID: ${data.proceso_id}`
          );
          setProcesoId(String(data.proceso_id));
        } else {
          alert("Respuesta inesperada del servidor.");
          setIsProcessing(false);
        }
      })
      .catch((err) => {
        console.error("Error al enviar archivo:", err);
        alert("Ocurrió un error al enviar el archivo.");
        setIsProcessing(false);
      });
  };

  const handleDownload = async () => {
    // if (!userId) {
    //   alert("Falta el userId para descargar el archivo.");
    //   return;
    // }

    try {
      const response = await fetch(`http://localhost:5000/comentarios_resultado/1`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Respuesta del servidor:", errorText);
        throw new Error("No se pudo descargar el archivo.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `comentarios_usuario_1.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error en la descarga:", error);
      alert("Error al descargar el archivo de necesidades.");
    }
  };

  const progressRef = useRef<HTMLDivElement | null>(null);
  const downloadButtonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Necesidades Apies
              </h1>
              <p className="text-sm text-muted-foreground">
                Análisis de necesidades de cliente de los feedback de estaciones
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">
              Subí y analizá los comentarios de las apies
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Subí tu archivo excel con comentarios, aplicá filtros opcionales, y recibí un nuevo excel con necesidades detectadas.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-foreground font-medium">
                Subí tu archivo Excel acá
              </Label>
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="pl-10 bg-background"
                />
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Filtros */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Filtros</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Filtros opcionales. Dejá en blanco si querés que analice todos los registros.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha-desde" className="text-foreground">
                    Fecha desde
                  </Label>
                  <Input
                    id="fecha-desde"
                    type="date"
                    value={filters.fecha_desde}
                    onChange={(e) => handleFilterChange("fecha_desde", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha-hasta" className="text-foreground">
                    Fecha hasta
                  </Label>
                  <Input
                    id="fecha-hasta"
                    type="date"
                    value={filters.fecha_hasta}
                    onChange={(e) => handleFilterChange("fecha_hasta", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Sentimiento</Label>
                  <Select
                    value={filters.sentimiento}
                    onValueChange={(value) => handleFilterChange("sentimiento", value)}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Seleccioná el sentimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positivo">Positivo</SelectItem>
                      <SelectItem value="negativo">Negativo</SelectItem>
                      <SelectItem value="neutro">Neutro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apies" className="text-foreground">
                    Numero de estación (apies)
                  </Label>
                  <Input
                    id="apies"
                    type="text"
                    placeholder="IDs de APIES separados por coma (Ej: 1234,5678)"
                    value={filters.apies}
                    onChange={(e) => handleFilterChange("apies", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canal" className="text-foreground">
                    Canal
                  </Label>
                  <Input
                    id="canal"
                    type="text"
                    placeholder="Tipos de canales separados por coma (Ej: APP,GOOGLE)"
                    value={filters.canal}
                    onChange={(e) => handleFilterChange("canal", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topico" className="text-foreground">
                    Tópico/s
                  </Label>
                  <Input
                    id="topico"
                    type="text"
                    placeholder="Tópicos separados por coma (Ej: EXPERIENCIA_GENERICA,ATENCION_AL_CLIENTE)"
                    value={filters.topico}
                    onChange={(e) => handleFilterChange("topico", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="min-caracteres" className="text-foreground">
                    Caracteres mínimos en el comentario
                  </Label>
                  <Input
                    id="min-caracteres"
                    type="number"
                    placeholder="Mínimo de caracteres del comentario"
                    value={filters.min_caracteres}
                    onChange={(e) =>
                      handleFilterChange("min_caracteres", e.target.value)
                    }
                    className="bg-background max-w-xs"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isProcessing}
              className="w-full"
            >
              {isProcessing ? "Processing..." : "Submit"}
            </Button>

            {/* Progreso */}
            {isProcessing && (
              <div ref={progressRef} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">Procesando el progreso</span>
                    <span className="text-muted-foreground">
                      {Math.round(porcentaje)}%
                    </span>
                  </div>
                  <Progress value={porcentaje} className="w-full" />
                </div>
              </div>
            )}

            {/* Botón de descarga */}
            {isCompleted && (
              <Button
                ref={downloadButtonRef}
                onClick={handleDownload}
                className="w-full"
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Resultado
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
