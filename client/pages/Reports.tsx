import React, { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";

type ReportVersion = {
  id: string | number;
  created_at: string; // "dd/mm/yyyy hh:mm:ss" (o ISO si después cambiás el backend)
  title: string;
  user_id?: string | number;
  report_url?: string;
  size_megabytes?: number;
  elapsed_time?: number;
};

type ReportGroup = {
  report_url: string;
  version_count?: number; // opcional si en el futuro traés top-N
  versions: ReportVersion[];
};

const API_OLD_BASE = "https://repomatic-old.onrender.com";
const API_KEY =
  (import.meta as any)?.env?.VITE_API_KEY ||
  localStorage.getItem("API_KEY") ||
  "1803-1989-1803-1989";

const ENDPOINTS = {
  LIST: `${API_OLD_BASE}/reportes_acumulados`,
  DOWNLOAD_VERSION: (id: string | number) =>
    `${API_OLD_BASE}/descargar_reporte/${id}`,
  DELETE_GROUP: `${API_OLD_BASE}/delete_report_group`,
  DELETE_VERSION: (id: string | number) =>
    `${API_OLD_BASE}/delete_individual_report/${id}`,
};

// -------- helpers de fecha ----------
const parseDateDMY = (dateStr: string) => {
  // soporta "dd/mm/yyyy hh:mm:ss"; si llega ISO, cae al Date nativo
  if (dateStr?.includes("T")) return new Date(dateStr);
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = (datePart || "").split("/").map(Number);
  const [h, m, s] = (timePart || "").split(":").map(Number);
  return new Date(year || 0, (month || 1) - 1, day || 1, h || 0, m || 0, s || 0);
};

const formatDateDMYHM = (dateStr: string) => {
  const d = parseDateDMY(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

// -------- subcomponente: tarjeta de grupo ----------
const ReportCard: React.FC<{
  group: ReportGroup;
  loadingDownloadIds: (string | number)[];
  onDownload: (id: string | number) => void;
  onDeleteGroup: (report_url: string) => void;
  onDeleteVersion: (id: string | number) => void;
}> = ({ group, loadingDownloadIds, onDownload, onDeleteGroup, onDeleteVersion }) => {
  const [expanded, setExpanded] = useState(false);

  const sorted = [...group.versions].sort(
    (a, b) => +parseDateDMY(b.created_at) - +parseDateDMY(a.created_at)
  );
  const visible = expanded ? sorted : sorted.slice(0, 3);
  const hasMore = sorted.length > 3;
  const title = sorted[0]?.title?.replace(/\+/g, " ") || "Sin título";

  const toggleExpand = () => setExpanded((e) => !e);

  return (
    <Card className="border-border shadow-xl overflow-hidden rounded-xl">
      <div className="flex items-start justify-between gap-4 p-4 border-b border-border">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate break-words">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {group.report_url.split("?")[1] || group.report_url}
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDeleteGroup(group.report_url)}
          title="Eliminar grupo de reportes"
          aria-label="Eliminar grupo de reportes"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-2">
        {visible.map((v) => (
          <div
            key={v.id}
            className="w-full min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border border-border rounded-lg"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate break-words">
                {v.title?.replace(/\+/g, " ")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateDMYHM(v.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(v.id)}
                disabled={loadingDownloadIds.includes(v.id)}
                aria-label="Descargar versión"
                title="Descargar versión"
              >
                {loadingDownloadIds.includes(v.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDeleteVersion(v.id)}
                aria-label="Eliminar versión"
                title="Eliminar versión"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {hasMore && (
          <button
            className="w-full text-sm text-primary hover:underline mt-1"
            onClick={toggleExpand}
          >
            {expanded ? "Mostrar menos ▲" : "Mostrar más ▼"}
          </button>
        )}
      </div>
    </Card>
  );
};

// -------- componente principal --------
export default function Reports() {
  const [reports, setReports] = useState<ReportGroup[] | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingDownloadIds, setLoadingDownloadIds] = useState<
    (string | number)[]
  >([]);
  const [reportsError, setReportsError] = useState("");

  const fetchReports = async () => {
    setLoadingReports(true);
    setReportsError("");
    try {
      const res = await fetch(ENDPOINTS.LIST, {
        headers: { Authorization: API_KEY },
      });
      if (!res.ok) throw new Error("No se pudo obtener la lista de reportes.");
      const data: ReportGroup[] = await res.json();
      setReports(data);
    } catch (e: any) {
      console.error(e);
      setReportsError(e?.message || "Error desconocido al obtener reportes.");
    } finally {
      setLoadingReports(false);
    }
  };

  const getFilenameFromDisposition = (disposition: string | null, fallback: string) => {
  if (!disposition) return fallback;

  // filename*=UTF-8''nombre%20con%20espacios.csv (RFC 5987)
  const starMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (starMatch && starMatch[1]) {
    try {
      return decodeURIComponent(starMatch[1]);
    } catch {
      // si falla el decode, seguimos
    }
  }

  // filename="nombre.csv"  o  filename=nombre.csv
  const simpleMatch = disposition.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (simpleMatch && simpleMatch[2]) {
    return simpleMatch[2];
  }

  return fallback;
};

const handleDownloadVersion = async (versionId: string | number) => {
  if (loadingDownloadIds.includes(versionId)) return;
  setLoadingDownloadIds((prev) => [...prev, versionId]);

  try {
    const res = await fetch(ENDPOINTS.DOWNLOAD_VERSION(versionId), {
      method: "GET",
      headers: {
        Authorization: API_KEY,
        Accept: "text/csv,application/octet-stream", // por las dudas
      },
    });

    if (!res.ok) throw new Error("Error descargando el archivo.");

    const blob = await res.blob();

    // Intentamos obtener el filename real del header
    const dispo = res.headers.get("Content-Disposition") || res.headers.get("content-disposition");
    const contentType = res.headers.get("Content-Type") || "application/octet-stream";

    // Si no viene filename, armamos uno por defecto según content-type
    let defaultExt = "csv";
    if (contentType.includes("pdf")) defaultExt = "pdf";
    else if (contentType.includes("zip")) defaultExt = "zip";

    const fallbackName = `reporte_${versionId}.${defaultExt}`;
    const filename = getFilenameFromDisposition(dispo, fallbackName);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename; // <- nombre correcto que te manda el server
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
    alert("No se pudo descargar el reporte.");
  } finally {
    setLoadingDownloadIds((prev) => prev.filter((id) => id !== versionId));
  }
};

  const handleDeleteGroup = async (report_url: string) => {
    if (!window.confirm("¿Eliminar este grupo de reportes?")) return;
    try {
      const res = await fetch(ENDPOINTS.DELETE_GROUP, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: API_KEY,
        },
        body: JSON.stringify({ report_url }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "No se pudo eliminar el grupo.");
      alert(body?.message || "Grupo eliminado correctamente.");
      fetchReports();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error eliminando grupo.");
    }
  };

  const handleDeleteVersion = async (versionId: string | number) => {
    if (!window.confirm("¿Eliminar esta versión del reporte?")) return;
    try {
      const res = await fetch(ENDPOINTS.DELETE_VERSION(versionId), {
        method: "DELETE",
        headers: { Authorization: API_KEY },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "No se pudo eliminar la versión.");
      alert(body?.message || "Versión eliminada correctamente.");
      fetchReports();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Error eliminando versión.");
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="border-border shadow-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Reportes</CardTitle>
          <CardDescription>Listados por grupo con sus versiones</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchReports}>
            {loadingReports ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar / Actualizar"
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {reportsError && (
          <p className="text-sm text-destructive mb-4">{reportsError}</p>
        )}

        {loadingReports && !reports && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loadingReports && (reports?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">
            La recuperación puede demorar hasta 2 minutos. Si pasado ese tiempo no hay nada, no hay reportes disponibles.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {(reports ?? []).map((group) => (
            <ReportCard
              key={group.report_url}
              group={group}
              loadingDownloadIds={loadingDownloadIds}
              onDownload={handleDownloadVersion}
              onDeleteGroup={handleDeleteGroup}
              onDeleteVersion={handleDeleteVersion}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
