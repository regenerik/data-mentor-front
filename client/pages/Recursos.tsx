import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FilePlus, Download, UploadCloud, X, Loader2, ListTodo , ArrowLeft, Bot} from "lucide-react";

// Types
type JobListItem = { job_description_id: number; titulo: string };
type JobListResponse = { ok: boolean; list_jobs: JobListItem[] };

type UploadAck = { job_description_id: number; paquete: string; ok: boolean };

type CvListResponse = {
  curriculos: any[];
  next_50: string | null;
  prev_50: string | null;
  user_email: string;
  current_url: string;
  job_description_id: number;
};

type BatchStatus = "queued" | "uploading" | "success" | "error" | "skipped-too-large";

type Batch = {
  index: number;
  files: File[];
  status: BatchStatus;
  error?: string;
  ack?: UploadAck;
  plannedOrder?: number;
};

const MAX_BATCH_MB = 10;
const AUTH_HEADER = "1803-1989-1803-1989";
const API_BASE_URL = "https://dm-back-fn4l.onrender.com";

export default function Recursos({ userEmail }: { userEmail?: string }) {
  const persistedEmail = userEmail || localStorage.getItem("email") || "";

  // Form fields
  const [email, setEmail] = useState<string>(persistedEmail);
  const [title, setTitle] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");

  // Jobs
  const [jobList, setJobList] = useState<JobListItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Files and batches
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const cancelRef = useRef(false);
  const [jobIdForUpload, setJobIdForUpload] = useState<number | undefined>(undefined);

  // Progress
  const [progress, setProgress] = useState({ total: 0, done: 0, error: 0, skipped: 0 });

  // CV results page
  const [cvPage, setCvPage] = useState<CvListResponse | undefined>(undefined);
  const [loadingPage, setLoadingPage] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const [errorGlobal, setErrorGlobal] = useState<string | undefined>(undefined);

  const bytesToMB = (b: number) => b / (1024 * 1024);

  useEffect(() => {
    if (!userEmail && email) localStorage.setItem("email", email);
  }, [email, userEmail]);

  // load jobs on mount / when email changes
  // Ahora también se llama después de una subida exitosa
  useEffect(() => {
    if (email) fetchJobList(email);
  }, [email, jobIdForUpload]); // <-- Agregamos jobIdForUpload a las dependencias

  async function fetchJobList(emailParam: string) {
    setLoadingJobs(true);
    setErrorGlobal(undefined);

    try {
      const res = await fetch(`${API_BASE_URL}/get_my_job_descriptions`, {
        method: "POST",
        headers: {
          Authorization: AUTH_HEADER,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailParam }),
      });

      if (!res.ok) {
        setErrorGlobal(res.status === 401 || res.status === 403
          ? "Authorization failed fetching job descriptions."
          : `Failed to load jobs: ${res.status}`);
        setJobList([]);
        return;
      }

      const json = (await res.json()) as JobListResponse;
      if (!json?.ok) {
        setErrorGlobal("Server returned ok:false when fetching jobs.");
        setJobList([]);
        return;
      }

      setJobList(json.list_jobs || []);
      if (json.list_jobs?.length) {
        setSelectedJobId(json.list_jobs[0].job_description_id);
      }
    } catch (err: any) {
      setErrorGlobal(`Network error fetching jobs: ${err?.message || err}`);
      setJobList([]);
    } finally {
      setLoadingJobs(false);
    }
  }

  // File selection
  function handleFileSelection(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return ["pdf", "doc", "docx", "txt"].includes(ext);
    });
    setAllFiles((prev) => [...prev, ...arr]);
  }

  // Build batches strictly by size
  function buildBatches(files: File[]): Batch[] {
    const result: Batch[] = [];
    let currentFiles: File[] = [];
    let currentSize = 0;

    const pushCurrent = () => {
      if (currentFiles.length > 0) {
        result.push({ index: 0, files: currentFiles, status: "queued" });
        currentFiles = [];
        currentSize = 0;
      }
    };

    for (const f of files) {
      const sizeMB = bytesToMB(f.size);
      if (sizeMB > MAX_BATCH_MB) {
        pushCurrent();
        result.push({
          index: 0,
          files: [f],
          status: "skipped-too-large",
          error: `File ${f.name} exceeds ${MAX_BATCH_MB} MB`,
        });
        continue;
      }
      if (currentSize + sizeMB > MAX_BATCH_MB) pushCurrent();
      currentFiles.push(f);
      currentSize += sizeMB;
    }
    pushCurrent();

    result.forEach((b, idx) => (b.index = idx + 1));

    let order = 1;
    for (const b of result) {
      if (b.status !== "skipped-too-large") {
        b.plannedOrder = order++;
      }
    }
    return result;
  }

  // Prepare batches when file list changes
  useEffect(() => {
    const newBatches = buildBatches(allFiles);
    const skipped = newBatches.filter((b) => b.status === "skipped-too-large").length;
    setBatches(newBatches);
    setProgress({ total: newBatches.filter(b => b.status !== "skipped-too-large").length, done: 0, error: 0, skipped });
  }, [allFiles]);

  async function handleSend() {
    setErrorGlobal(undefined);
    cancelRef.current = false;

    if (!email) return setErrorGlobal("Email is required.");
    if (!title) return setErrorGlobal("Title is required.");
    if (!jobDescription) return setErrorGlobal("Job description text is required.");
    if (allFiles.length === 0) return setErrorGlobal("Select at least one CV file to upload.");

    const uploadable = batches.filter((b) => b.status !== "skipped-too-large");
    const uploadTotal = uploadable.length;

    if (uploadTotal === 0) {
      setErrorGlobal("No uploadable batches (all files exceed the per-batch limit).");
      return;
    }

    setIsUploading(true);
    setJobIdForUpload(undefined);

    let done = 0, errCount = 0;
    let capturedJobId: number | undefined = undefined;
    let nextPackageNumber = 2;

    for (const batch of batches) {
      if (cancelRef.current) break;

      if (batch.status === "skipped-too-large") {
        continue;
      }

      const paquete = capturedJobId
        ? `${nextPackageNumber}/${uploadTotal}`
        : `1/${uploadTotal}`;

      setBatches((prev) => prev.map((b) => (b.index === batch.index ? { ...b, status: "uploading" } : b)));

      const fd = new FormData();
      fd.append("email", email);
      fd.append("job_description", jobDescription);
      fd.append("titulo", title);
      fd.append("paquete", paquete);
      for (const f of batch.files) fd.append("archivos", f);
      if (capturedJobId) fd.append("job_description_id", String(capturedJobId));

      try {
        const res = await fetch(`${API_BASE_URL}/upload_cvs`, {
          method: "POST",
          headers: { Authorization: AUTH_HEADER } as any,
          body: fd,
        });

        if (!res.ok) {
          const errMsg = `Upload failed with status ${res.status}`;
          errCount += 1;
          setBatches((prev) => prev.map((b) => (b.index === batch.index ? { ...b, status: "error", error: errMsg } : b)));
          setProgress((p) => ({ ...p, error: p.error + 1 }));
          continue;
        }

        const json = (await res.json()) as UploadAck | null;
        if (!json || (json as any).ok === false) {
          const errMsg = `Server returned ok:false for batch ${paquete}`;
          errCount += 1;
          setBatches((prev) => prev.map((b) => (b.index === batch.index ? { ...b, status: "error", error: errMsg, ack: json || undefined } : b)));
          setProgress((p) => ({ ...p, error: p.error + 1 }));
          continue;
        }

        setBatches((prev) => prev.map((b) => (b.index === batch.index ? { ...b, status: "success", ack: json } : b)));
        done += 1;
        setProgress((p) => ({ ...p, done: p.done + 1 }));

        if (!capturedJobId && typeof (json as any).job_description_id !== "undefined") {
          capturedJobId = (json as any).job_description_id as number;
          setJobIdForUpload(capturedJobId);
        }

        if (capturedJobId) {
          nextPackageNumber += 1;
        }
      } catch (err: any) {
        const errMsg = `Network error: ${err?.message || err}`;
        errCount += 1;
        setBatches((prev) => prev.map((b) => (b.index === batch.index ? { ...b, status: "error", error: errMsg } : b)));
        setProgress((p) => ({ ...p, error: p.error + 1 }));
      }
    }

    setIsUploading(false);

    if (capturedJobId) {
      await fetchCvList(email, capturedJobId);
    } else {
      setErrorGlobal("No batch completed successfully; nothing to list.");
    }
  }

  function handleCancelRemaining() {
    cancelRef.current = true;
  }

  async function fetchCvList(emailParam: string, jobId: number, url?: string) {
    setLoadingPage(true);
    setErrorGlobal(undefined);

    try {
      let res: Response;
      if (url) {
        const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
        res = await fetch(fullUrl, { method: "GET", headers: { Authorization: AUTH_HEADER } });
      } else {
        res = await fetch(`${API_BASE_URL}/get_cv_list/`, {
          method: "POST",
          headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailParam, job_description_id: jobId }),
        });
      }

      if (!res.ok) {
        setErrorGlobal(`Failed to load CVs: ${res.status}`);
        setCvPage(undefined);
        return;
      }

      const json = (await res.json()) as CvListResponse;
      setCvPage(json);
    } catch (err: any) {
      setErrorGlobal(`Network error loading CVs: ${err?.message || err}`);
      setCvPage(undefined);
    } finally {
      setLoadingPage(false);
    }
  }

  async function handleDownloadExcel() {
    setErrorGlobal(undefined);
    if (!selectedJobId) return setErrorGlobal("Select a job to download its results.");

    setDownloadingExcel(true);
    try {
      const res = await fetch(`${API_BASE_URL}/download_my_job_description`, {
        method: "POST",
        headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
        body: JSON.stringify({ job_description_id: selectedJobId }),
      });

      if (!res.ok) {
        setErrorGlobal(`Download failed: ${res.status}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `job_${selectedJobId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorGlobal(`Network error downloading Excel: ${err?.message || err}`);
    } finally {
      setDownloadingExcel(false);
    }
  }

  async function handleNext() {
    if (!cvPage?.next_50) return;
    await fetchCvList(email, cvPage.job_description_id, cvPage.next_50);
  }

  async function handlePrev() {
    if (!cvPage?.prev_50) return;
    await fetchCvList(email, cvPage.job_description_id, cvPage.prev_50);
  }

  // Función para manejar el cambio en el Select y cargar la lista de CVs
  async function handleSelectJob(jobId: number) {
    setSelectedJobId(jobId);
    await fetchCvList(email, jobId);
  }

  // UI helpers
  const uploadableTotal = batches.filter(b => b.status !== "skipped-too-large").length;
  const percent = uploadableTotal === 0
    ? 0
    : Math.round(((progress.done + progress.error) / uploadableTotal) * 100);

  return (
    <div className="min-h-screen bg-background px-4 md:px-6 pt-0 pb-4 md:pb-6">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 mb-4">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Selección de CV's
              </h1>
              <p className="text-sm text-muted-foreground">
                Sube una lista de currículos y obtiene una lista ordenada con los mejores candidatos
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* --- Card 1: Creación de Job y Subida de CVs --- */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePlus className="h-5 w-5 text-primary" /> Crear y Analizar
              </CardTitle>
              <CardDescription>
                Ingresa una descripción de puesto, sube currículos y analízalos con IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titulo</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="recursos-title" aria-label="Titulo" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción del puesto</label>
                <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} data-testid="recursos-jd-text" aria-label="Descripción del puesto" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email de usuario</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} data-testid="recursos-email" aria-label="Email" />
              </div>

              {/* Upload section moved here */}
              <div>
                <label className="text-sm font-medium">Subir Currículos</label>
                <div className="mt-2">
                  <input data-testid="recursos-file-input" aria-label="Seleccionar archivos" id="recursos-file" type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileSelection(e.target.files)} className="block w-full text-sm text-muted-foreground" />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Archivos seleccionados: {allFiles.length}</div>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <Button onClick={handleSend} data-testid="recursos-send" disabled={isUploading || !email || !title || !jobDescription || allFiles.length === 0}>
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="mr-2" />}Enviar
                </Button>
                <Button variant="secondary" onClick={() => { setAllFiles([]); setBatches([]); setProgress({ total: 0, done: 0, error: 0, skipped: 0 }); setErrorGlobal(undefined); }}>
                  <X className="mr-2" />Limpiar
                </Button>
                <Button variant="outline" onClick={handleCancelRemaining} data-testid="recursos-cancel" disabled={!isUploading}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Card (remains separate for visibility) */}
          {isUploading && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Progreso de la Carga</CardTitle>
                <CardDescription>
                  Estado de los paquetes enviados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full bg-muted/20 rounded h-2 overflow-hidden" data-testid="recursos-progress-bar">
                  <div className="h-2 bg-primary" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Lotes subibles: {progress.done + progress.error}/{uploadableTotal} — Enviados: {progress.done} — Errores: {progress.error} — Omitidos (tamaño): {progress.skipped}
                </div>
                <div className="mt-3">
                  <h4 className="font-semibold">Lotes</h4>
                  <ul className="mt-2 space-y-2">
                    {batches.map((b) => (
                      <li key={b.index} data-testid={`recursos-batch-row-${b.index}`} className="p-2 border border-border/50 rounded flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {b.status === "skipped-too-large"
                              ? `Omitido (tamaño) — planificado ${b.plannedOrder ? `${b.plannedOrder}/` : ""}${batches.filter(x => x.status !== "skipped-too-large").length}`
                              : `Lote planificado ${b.plannedOrder}/${batches.filter(x => x.status !== "skipped-too-large").length}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Archivos: {b.files.length} {b.status === 'skipped-too-large' && <span className="text-xs text-destructive">(omitido: {b.error})</span>}
                          </div>
                        </div>
                        <div>
                          <Badge>{b.status}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {errorGlobal && (
            <div className="p-3 mt-6 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm">{errorGlobal}</div>
          )}
        </div>

        {/* --- Card 2: Recuperar Resultados y Jobs Existentes --- */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" /> Ver y Descargar Resultados
              </CardTitle>
              <CardDescription>
                Selecciona un trabajo para ver los resultados del análisis o descargar el reporte en Excel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 md:items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">Jobs Existentes</label>
                  <div className="mt-2">
                    <Select onValueChange={(val) => handleSelectJob(Number(val))} value={selectedJobId ? String(selectedJobId) : undefined}>
                      <SelectTrigger aria-label="Existing jobs" data-testid="recursos-job-select">
                        <SelectValue placeholder={loadingJobs ? "Cargando..." : "Selecciona un job"} />
                      </SelectTrigger>
                      <SelectContent>
                        {jobList.map((j) => (
                          <SelectItem key={j.job_description_id} value={String(j.job_description_id)}>{j.titulo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadExcel} data-testid="recursos-download-excel" aria-label="Download Excel" disabled={!selectedJobId || downloadingExcel}>
                    {downloadingExcel ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="mr-2" />}Descargar Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Card (se queda donde está, pero ahora bajo el card de "Recuperar") */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
              <CardDescription>Lista de currículos para el job seleccionado.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPage ? (
                <div className="p-3 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
              ) : !cvPage ? (
                <div className="p-3 text-sm text-muted-foreground">No hay resultados todavía.</div>
              ) : (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                      <thead>
                        <tr>
                          <th className="pb-2 text-center">Archivo</th>
                          <th className="pb-2 text-center">Puntaje</th>
                          <th className="pb-2 text-center">Validez</th>
                          <th className="pb-2 text-center">Recomendado</th>
                          <th className="pb-2 text-center">Fecha</th>
                          <th className="pb-2 text-center">Formato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cvPage.curriculos.map((c, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 text-center">{c.file_name || c.nombre || c.original_name || c.filename || JSON.stringify(c).slice(0, 40)}</td>
                            <td className="py-2 text-center">{c.puntaje ?? c.score ?? "-"}</td>
                            <td className="py-2 text-center">{String(c.validez ?? c.valid ?? "-")}</td>
                            <td className="py-2 text-center">{String(c.recomendado ?? c.recommended ?? "-")}</td>
                            <td className="py-2 text-center">
                              {c.created_date ? new Date(c.created_date).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-2">{c.formato_original ?? c.format ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handlePrev} data-testid="recursos-prev" disabled={!cvPage.prev_50 || loadingPage}>Anterior</Button>
                    <Button onClick={handleNext} data-testid="recursos-next" disabled={!cvPage.next_50 || loadingPage}>Siguiente</Button>
                    <div className="ml-auto text-sm text-muted-foreground">Mostrando {cvPage.curriculos.length} items</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}