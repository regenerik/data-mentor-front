import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  Bug,
  RotateCcw,
  Copy,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const API_BASE = "https://dm-back-fn4l.onrender.com";

interface Report {
  id: number;
  user: string;
  user_dni: string | null;
  question: string;
  failed_answer: string;
  sql_query: string | null;
  resolved: boolean;
  solution: string | null;
  created_at: string;
  modified_at: string;
}

interface AIResponse {
  nueva_instruccion: string;
  motivo_explicacion: string;
}

export default function ErroresReportados() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved">("all");

  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/get_reports_of_data_mentor`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `1803-1989-1803-1989`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data: Report[] = await response.json();
      setReports(data);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error de carga",
        description: `No se pudieron cargar los reportes: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const filteredReports = sortedReports.filter((report) => {
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "pending" && !report.resolved) ||
      (statusFilter === "resolved" && report.resolved);
    const searchMatch = report.user.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleToggleExpand = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleResolveWithAI = async (reportId: number) => {
    setLoadingAI(reportId);
    setAiResponse(null);
    try {
      toast({
        title: "Enviando a la IA...",
        description: "La IA está trabajando en una solución. Esto puede tomar unos segundos.",
      });

      const response = await fetch(`${API_BASE}/fix_instructions_by_error`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify({ id: reportId }),
      });

      const result: AIResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.motivo_explicacion || "Error desconocido al contactar a la IA.");
      }

      setAiResponse(result);
      toast({
        title: "Solución recibida 🎉",
        description: "La IA ha propuesto una solución. Puedes verla a continuación.",
      });
    } catch (error: any) {
      console.error("Error calling AI for fix:", error);
      toast({
        title: "Error al resolver",
        description: `Hubo un problema: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoadingAI(null);
    }
  };

  const handleCopyInstructions = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse.nueva_instruccion);
      toast({
        title: "Instrucciones copiadas ✅",
        description: "La nueva instrucción ha sido copiada al portapapeles.",
      });
    }
  };

  const handleToggleStatus = async (report: Report) => {
    try {
        toast({
            title: "Cambiando estado...",
            description: `Cambiando el estado del reporte ID: ${report.id}.`,
        });

        const response = await fetch(`${API_BASE}/switch_error_status`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "1803-1989-1803-1989",
            },
            body: JSON.stringify({ id: report.id }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al cambiar el estado del reporte.");
        }

        toast({
            title: "Estado actualizado 🎉",
            description: `El reporte ahora está marcado como ${report.resolved ? "Pendiente" : "Resuelto"}.`,
        });
        fetchReports();
    } catch (error: any) {
        console.error("Error toggling report status:", error);
        toast({
            title: "Error al cambiar estado",
            description: `Hubo un problema: ${error.message}`,
            variant: "destructive",
        });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Reportes de errores de Data Mentor
          </CardTitle>
          <CardDescription>
            Revisa y gestiona los errores reportados por los usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
              >
                Pendientes
              </Button>
              <Button
                variant={statusFilter === "resolved" ? "default" : "outline"}
                onClick={() => setStatusFilter("resolved")}
              >
                Resueltos
              </Button>
            </div>
            <div className="relative w-full">
              <Input
                placeholder="Buscar por email de usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                handleClearSearch();
                setStatusFilter("all");
              }}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {aiResponse && (
        <div className="space-y-6">
          <Card className="border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-neon-green" />
                  Respuesta de la IA
                </CardTitle>
                <CardDescription>
                  Después de leerlo bien y estar seguro, podés pegar y reemplazar en la sección "Instrucciones IA" el contenido recibido.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAiResponse(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Nueva Instrucción</h3>
                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground max-h-48 overflow-y-auto">
                    {aiResponse.nueva_instruccion}
                  </pre>
                  <Button variant="outline" size="sm" onClick={handleCopyInstructions}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar al portapapeles
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Motivo de la mejora</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {aiResponse.motivo_explicacion}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <Card
                key={report.id}
                className="flex flex-col border-border shadow-md"
              >
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <Badge
                      className={`text-xs cursor-pointer ${
                        report.resolved
                          ? "bg-neon-green/20 text-neon-green"
                          : "bg-orange-500/20 text-orange-500"
                      }`}
                      onClick={() => handleToggleStatus(report)}
                    >
                      {report.resolved ? "Resuelto" : "Pendiente"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-semibold truncate">
                    {report.user}
                  </CardTitle>
                  <CardDescription>
                    {report.question.slice(0, 50)}...
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {expandedCard === report.id && (
                    <div className="mt-4 space-y-4 text-sm bg-muted p-4 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">Pregunta completa:</p>
                        <p>{report.question}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">Respuesta fallida:</p>
                        <p className="text-destructive-foreground">
                          {report.failed_answer}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">SQL utilizado:</p>
                        <pre className="whitespace-pre-wrap rounded-md bg-background p-2 text-muted-foreground">
                          {report.sql_query || "N/A"}
                        </pre>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleExpand(report.id)}
                    >
                      {expandedCard === report.id ? "Ocultar detalles" : "Mostrar detalles"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolveWithAI(report.id)}
                      disabled={loadingAI === report.id}
                    >
                      {loadingAI === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        "Resolver con IA"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground col-span-full py-10">
              <Bug className="mx-auto h-12 w-12 mb-4 text-primary" />
              <p>No se encontraron reportes de errores.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}