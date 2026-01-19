import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, Copy, Bot, Trash2, ArrowLeft, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AUTH = "1803-1989-1803-1989";

type Diagnostico = {
  id: number;
  apies: string;
  gestor_asociado: string;
  tipo_estacion: "Abanderada" | "ACA";
  created_at: string;
  conclucion_final: string | null;
  respuesta_ia: string | null;
};

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date;
  }
};

const FormulariosNecesidades = () => {
  const { toast } = useToast();
  const [data, setData] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIAId, setLoadingIAId] = useState<number | null>(null);


  const [filters, setFilters] = useState({
    gestor: "",
    apies: "",
    date: "",
    tipo_estacion: "",
  });

  const [dateOrder, setDateOrder] = useState<"newest" | "oldest">("newest");

  const [openIA, setOpenIA] = useState(false);
  const [openConclusion, setOpenConclusion] = useState(false);

  const [selectedText, setSelectedText] = useState("");
  const [currentId, setCurrentId] = useState<number | null>(null);

  const [newConclusion, setNewConclusion] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://dm-back-fn4l.onrender.com/diagnostico/simple",
        {
          method: "GET",
          headers: { Authorization: AUTH },
        }
      );
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los diagnósticos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = data
    .filter((d) => {
      return (
        (!filters.gestor ||
          d.gestor_asociado
            .toLowerCase()
            .includes(filters.gestor.toLowerCase())) &&
        (!filters.apies ||
          d.apies.toLowerCase().includes(filters.apies.toLowerCase())) &&
        (!filters.tipo_estacion ||
          d.tipo_estacion === filters.tipo_estacion) &&
        (!filters.date || d.created_at.includes(filters.date))
      );
    })
    .sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return dateOrder === "newest" ? db - da : da - db;
    });

  const openIAViewer = (text: string) => {
    setSelectedText(text);
    setCopied(false);
    setOpenIA(true);
  };

  const generateIA = async (id: number) => {
    try {
      setLoadingIAId(id);

      const res = await fetch(
        "https://dm-back-fn4l.onrender.com/diagnostico/ia/evaluar",
        {
          method: "POST",
          headers: {
            Authorization: AUTH,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const json = await res.json();

      setData((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, respuesta_ia: json.conclusion_ia } : d
        )
      );

      toast({
        title: "IA generada",
        description: "La devolución fue creada correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo generar la devolución IA",
        variant: "destructive",
      });
    } finally {
      setLoadingIAId(null);
    }
  };


  const openConclusionEditor = (id: number, text: string | null) => {
    setCurrentId(id);
    setNewConclusion(text || "");
    setOpenConclusion(true);
  };

  const saveConclusion = async () => {
    if (!currentId) return;

    try {
      await fetch(
        "https://dm-back-fn4l.onrender.com/diagnostico/conclusion",
        {
          method: "POST",
          headers: {
            Authorization: AUTH,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: currentId,
            conclucion_final: newConclusion,
          }),
        }
      );

      setData((prev) =>
        prev.map((d) =>
          d.id === currentId
            ? { ...d, conclucion_final: newConclusion }
            : d
        )
      );

      toast({
        title: "Guardado",
        description: "Conclusión guardada correctamente",
      });
      setOpenConclusion(false);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar la conclusión",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    const gestor = localStorage.getItem("name");

    try {
      const res = await fetch(
        "https://dm-back-fn4l.onrender.com/diagnostico/eliminar",
        {
          method: "POST",
          headers: {
            Authorization: AUTH,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gestor_asociado: gestor,
            id,
          }),
        }
      );

      const json = await res.json();

      if (json.error) {
        toast({
          title: "Sin permiso",
          description: "No tenés permiso para borrar este diagnóstico",
          variant: "destructive",
        });
        return;
      }

      setData((prev) => prev.filter((d) => d.id !== id));

      toast({
        title: "Eliminado",
        description: "Registro eliminado correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  let navigate = useNavigate()
  return (
    <div className="p-4 max-w-7xl mx-auto">

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
            onClick={() => navigate("/cuestionario-operadores")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Llenar formulario
          </Button>

        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Input
          placeholder="Gestor"
          onChange={(e) =>
            setFilters((f) => ({ ...f, gestor: e.target.value }))
          }
        />
        <Input
          placeholder="APIES"
          onChange={(e) =>
            setFilters((f) => ({ ...f, apies: e.target.value }))
          }
        />
        <Input
          type="date"
          onChange={(e) =>
            setFilters((f) => ({ ...f, date: e.target.value }))
          }
        />
        <Select
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, tipo_estacion: v }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo estación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Abanderada">Abanderada</SelectItem>
            <SelectItem value="ACA">ACA</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(v: any) => setDateOrder(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Orden fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más nuevo</SelectItem>
            <SelectItem value="oldest">Más antiguo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="border rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="font-medium">{d.apies}</div>
              <div className="text-sm text-muted-foreground">
                {d.gestor_asociado} · {d.tipo_estacion}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(d.created_at)}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() =>
                  openConclusionEditor(d.id, d.conclucion_final)
                }
              >
                {d.conclucion_final ? "C. Final" : "+ C. Final"}
              </Button>

              <Button
                variant="outline"
                disabled={loadingIAId === d.id}
                onClick={() =>
                  d.respuesta_ia
                    ? openIAViewer(d.respuesta_ia)
                    : generateIA(d.id)
                }
              >
                <Bot className="h-4 w-4 mr-2" />
                {loadingIAId === d.id
                  ? "Dame unos segundos…"
                  : d.respuesta_ia
                    ? "Devolución IA"
                    : "Crear devolución IA"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate(`/editar-cuestionario/${d.id}`)}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => handleDelete(d.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* IA Dialog */}
      <Dialog open={openIA} onOpenChange={setOpenIA}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Devolución IA</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto whitespace-pre-wrap p-4 bg-muted rounded-lg text-sm">
            {selectedText}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={handleCopy}>
              {copied ? <Check /> : <Copy />}
              Copiar
            </Button>
            <Button onClick={() => setOpenIA(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conclusión Dialog */}
      <Dialog open={openConclusion} onOpenChange={setOpenConclusion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conclusión Final</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={6}
            value={newConclusion}
            onChange={(e) => setNewConclusion(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConclusion(false)}>
              Cancelar
            </Button>
            <Button onClick={saveConclusion}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormulariosNecesidades;
