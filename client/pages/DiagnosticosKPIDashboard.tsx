import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";
import {
    BarChart3,
    RefreshCw,
    Sparkles,
    FileText,
    Bot,
    CheckCircle2,
    Store,
    Users,
    TrendingUp,
    AlertTriangle,
    GraduationCap,
    ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AUTH = "1803-1989-1803-1989";
const BACKEND_URL = "https://dm-back-fn4l.onrender.com";

const PIE_COLORS = ["#111827", "#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0f766e", "#9333ea"];
const LINE_COLORS = {
    seguridad: "#f8fafc",
    experiencia: "#2563eb",
    conocimiento: "#16a34a",
    gestion: "#f59e0b",
    liderazgo: "#dc2626",
};

type ChartDatum = {
    name: string;
    value: number;
};

type LatestForm = {
    id: number;
    apies: string;
    gestor_asociado: string;
    tipo_estacion: string;
    created_at: string | null;
    has_ia: boolean;
    has_conclusion: boolean;
};

type MonthlyVolumeDatum = {
    month: string;
    label: string;
    formularios: number;
    con_ia: number;
    con_conclusion: number;
    completos: number;
};

type SectorTrendDatum = {
    month: string;
    label: string;
    seguridad: number;
    experiencia: number;
    conocimiento: number;
    gestion: number;
    liderazgo: number;
};

type KPIResponse = {
    summary: {
        total_forms: number;
        with_ia: number;
        with_conclusion: number;
        complete: number;
        completion_rate_ia: number;
        completion_rate_conclusion: number;
        completion_rate_complete: number;
        abanderada: number;
        aca: number;
        with_tienda: number;
        with_boxes: number;
        unique_gestores: number;
    };
    station_type_distribution: ChartDatum[];
    process_status_distribution: ChartDatum[];
    monthly_volume: MonthlyVolumeDatum[];
    sector_low_trends: SectorTrendDatum[];
    sector_average_scores: ChartDatum[];
    top_problem_fields: ChartDatum[];
    course_recommendation_counts: ChartDatum[];
    gestor_distribution: ChartDatum[];
    latest_forms: LatestForm[];
};

type TabKey = "overview" | "courses" | "trends";

function formatPct(value: number) {
    return `${value.toFixed(1)}%`;
}

function formatDate(date: string | null) {
    if (!date) return "-";
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
}

function safeTopItem(items: ChartDatum[]) {
    return items && items.length > 0 ? items[0] : null;
}

function KPIStatCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="rounded-3xl border shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                        {subtitle ? <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p> : null}
                    </div>
                    <div className="rounded-2xl bg-black p-3 text-white">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function ChartCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>
            <CardContent className="h-[340px]">{children}</CardContent>
        </Card>
    );
}

export default function DiagnosticosKPIDashboard() {
    const [data, setData] = useState<KPIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>("overview");
    const [error, setError] = useState("");

    const fetchKPIs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${BACKEND_URL}/diagnostico/kpis`, {
                method: "GET",
                headers: {
                    Authorization: AUTH,
                },
            });

            if (!response.ok) {
                throw new Error("No se pudo obtener el dashboard");
            }

            const json = await response.json();
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKPIs();
    }, []);
    const navigate = useNavigate();
    const insights = useMemo(() => {
        if (!data) return [];

        const topCourse = safeTopItem(data.course_recommendation_counts);
        const topProblem = safeTopItem(data.top_problem_fields);
        const topStation = safeTopItem(data.station_type_distribution);
        const topGestor = safeTopItem(data.gestor_distribution);

        const items = [
            `Se analizaron ${data.summary.total_forms} formularios en total.`,
            `El ${formatPct(data.summary.completion_rate_ia)} ya tiene devolución IA.`,
            `El ${formatPct(data.summary.completion_rate_complete)} está completo con IA + conclusión.`,
            topCourse ? `El curso más recomendado históricamente es "${topCourse.name}".` : "",
            topProblem ? `La brecha más repetida es "${topProblem.name}".` : "",
            topStation ? `Predomina el tipo de estación "${topStation.name}".` : "",
            topGestor ? `El gestor con más formularios cargados es "${topGestor.name}".` : "",
        ];

        return items.filter(Boolean);
    }, [data]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <Card className="rounded-3xl">
                        <CardContent className="flex min-h-[260px] items-center justify-center gap-3">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>Cargando dashboard de diagnósticos...</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl">
                    <Card className="rounded-3xl border-red-200">
                        <CardContent className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                            <div className="text-lg font-semibold">No pude cargar el dashboard</div>
                            <div className="text-sm text-muted-foreground">{error || "Sin datos"}</div>
                            <Button onClick={fetchKPIs}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reintentar
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <Card className="rounded-3xl border shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-4">

                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/formularios-necesidades")}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    
                                </Button>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                                    <BarChart3 className="h-7 w-7" />

                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Dashboard de Diagnósticos YPF</h1>
                                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                                        Un tablero serio, presentable y bastante menos deprimente que mirar registros crudos.
                                        Resume formularios, devoluciones IA, conclusiones, cursos recomendados y tendencias por sector.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">

                                <Button
                                    variant={activeTab === "overview" ? "default" : "outline"}
                                    onClick={() => setActiveTab("overview")}
                                >
                                    Resumen
                                </Button>
                                <Button
                                    variant={activeTab === "courses" ? "default" : "outline"}
                                    onClick={() => setActiveTab("courses")}
                                >
                                    Cursos
                                </Button>
                                <Button
                                    variant={activeTab === "trends" ? "default" : "outline"}
                                    onClick={() => setActiveTab("trends")}
                                >
                                    Tendencias
                                </Button>
                                <Button variant="outline" onClick={fetchKPIs}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Actualizar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KPIStatCard
                        title="Formularios"
                        value={String(data.summary.total_forms)}
                        subtitle="Total histórico analizado"
                        icon={<FileText className="h-5 w-5" />}
                    />
                    <KPIStatCard
                        title="Con devolución IA"
                        value={String(data.summary.with_ia)}
                        subtitle={formatPct(data.summary.completion_rate_ia)}
                        icon={<Bot className="h-5 w-5" />}
                    />
                    <KPIStatCard
                        title="Con conclusión final"
                        value={String(data.summary.with_conclusion)}
                        subtitle={formatPct(data.summary.completion_rate_conclusion)}
                        icon={<CheckCircle2 className="h-5 w-5" />}
                    />
                    <KPIStatCard
                        title="Completos"
                        value={String(data.summary.complete)}
                        subtitle={formatPct(data.summary.completion_rate_complete)}
                        icon={<Sparkles className="h-5 w-5" />}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KPIStatCard
                        title="Abanderada"
                        value={String(data.summary.abanderada)}
                        subtitle="Cantidad histórica"
                        icon={<Store className="h-5 w-5" />}
                    />
                    <KPIStatCard
                        title="ACA"
                        value={String(data.summary.aca)}
                        subtitle="Cantidad histórica"
                        icon={<Store className="h-5 w-5" />}
                    />
                    <KPIStatCard
                        title="Con Tienda"
                        value={String(data.summary.with_tienda)}
                        subtitle="Dotación con tienda activa"
                        icon={<Users className="h-5 w-5" />}
                    />
                    <KPIStatCard
                        title="Gestores únicos"
                        value={String(data.summary.unique_gestores)}
                        subtitle="Con actividad registrada"
                        icon={<Users className="h-5 w-5" />}
                    />
                </div>

                {activeTab === "overview" && (
                    <>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <ChartCard
                                title="Estado del proceso"
                                description="Cuántos quedaron solo como formulario, con IA, con conclusión o completos."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.process_status_distribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            label
                                        >
                                            {data.process_status_distribution.map((_, index) => (
                                                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard
                                title="Tipo de estación"
                                description="Distribución histórica por tipo de estación."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.station_type_distribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={110}
                                            label
                                        >
                                            {data.station_type_distribution.map((_, index) => (
                                                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <ChartCard
                                title="Evolución mensual"
                                description="Volumen de formularios y avance del proceso a lo largo del tiempo."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.monthly_volume}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="label" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="formularios" stroke="#111827" strokeWidth={3} />
                                        <Line type="monotone" dataKey="con_ia" stroke="#2563eb" strokeWidth={2} />
                                        <Line type="monotone" dataKey="con_conclusion" stroke="#16a34a" strokeWidth={2} />
                                        <Line type="monotone" dataKey="completos" stroke="#f59e0b" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <Card className="rounded-3xl border shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Lecturas rápidas</CardTitle>
                                    <CardDescription>
                                        Resumen ejecutivo para no tener que adivinar mirando barras.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {insights.map((item, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700"
                                        >
                                            {item}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="rounded-3xl border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Últimos formularios</CardTitle>
                                <CardDescription>
                                    Vista rápida de lo más reciente con estado de IA y conclusión.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.latest_forms.map((form) => (
                                    <div
                                        key={form.id}
                                        className="flex flex-col gap-3 rounded-2xl border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <div className="font-semibold">{form.apies || `Formulario #${form.id}`}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {form.gestor_asociado || "Sin gestor"} · {form.tipo_estacion || "Sin tipo"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{formatDate(form.created_at)}</div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${form.has_ia ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"}`}>
                                                {form.has_ia ? "Con IA" : "Sin IA"}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${form.has_conclusion ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-700"}`}>
                                                {form.has_conclusion ? "Con conclusión" : "Sin conclusión"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </>
                )}

                {activeTab === "courses" && (
                    <>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <ChartCard
                                title="Cursos más recomendados"
                                description="Conteo histórico detectado dentro de respuestas IA y conclusiones."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.course_recommendation_counts} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" width={260} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#111827" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard
                                title="Brechas más repetidas"
                                description="Campos numéricos que más veces aparecieron por debajo de 4."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.top_problem_fields} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" width={220} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#dc2626" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <ChartCard
                                title="Promedio general por sector"
                                description="Puntaje promedio histórico de los bloques numéricos."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.sector_average_scores}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" hide />
                                        <YAxis domain={[0, 5]} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* <Card className="rounded-3xl border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Qué mirar acá</CardTitle>
                  <CardDescription>
                    Un atajo mental para entender si el operador está recomendando bien o delirando solo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="rounded-2xl border bg-slate-50 p-4">
                    Si ves cursos demasiado genéricos arriba y faltan cursos estructurales, el problema suele ser del prompt, no del gráfico.
                  </div>
                  <div className="rounded-2xl border bg-slate-50 p-4">
                    Si una brecha aparece muchísimo y no tiene correlato en cursos recomendados, conviene ajustar la lógica de prioridad del agente.
                  </div>
                  <div className="rounded-2xl border bg-slate-50 p-4">
                    Este bloque es ideal para mostrar qué está pasando históricamente sin leer respuesta por respuesta como un condenado.
                  </div>
                </CardContent>
              </Card> */}
                        </div>
                    </>
                )}

                {activeTab === "trends" && (
                    <>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <ChartCard
                                title="Problemáticas por sector a lo largo del tiempo"
                                description="Porcentaje mensual de respuestas bajas (&lt; 4) en cada bloque."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.sector_low_trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="label" />
                                        <YAxis unit="%" />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="seguridad" stroke={LINE_COLORS.seguridad} strokeWidth={2.5} />
                                        <Line type="monotone" dataKey="experiencia" stroke={LINE_COLORS.experiencia} strokeWidth={2.5} />
                                        <Line type="monotone" dataKey="conocimiento" stroke={LINE_COLORS.conocimiento} strokeWidth={2.5} />
                                        <Line type="monotone" dataKey="gestion" stroke={LINE_COLORS.gestion} strokeWidth={2.5} />
                                        <Line type="monotone" dataKey="liderazgo" stroke={LINE_COLORS.liderazgo} strokeWidth={2.5} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard
                                title="Gestores con más formularios"
                                description="Top de carga histórica por gestor asociado."
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.gestor_distribution} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis type="category" dataKey="name" width={220} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#16a34a" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        <Card className="rounded-3xl border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Lectura de tendencias</CardTitle>
                                <CardDescription>
                                    Si un bloque sube, hay más señales de problema. Si baja, la cosa mejora. Milagros no hace, pero orienta.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                                    <div className="mb-2 flex items-center gap-2 font-semibold">
                                        <TrendingUp className="h-4 w-4" />
                                        Seguridad
                                    </div>
                                    Mirá si suben los problemas de seguridad o preparación ante emergencias. Eso suele ameritar acción rápida.
                                </div>

                                <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                                    <div className="mb-2 flex items-center gap-2 font-semibold">
                                        <Users className="h-4 w-4" />
                                        Experiencia
                                    </div>
                                    Si experiencia se dispara, después no te sorprendas si el operador empieza recomendando cursos de comunicación a todo lo que respira.
                                </div>

                                <div className="rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                                    <div className="mb-2 flex items-center gap-2 font-semibold">
                                        <GraduationCap className="h-4 w-4" />
                                        Conocimiento / gestión / liderazgo
                                    </div>
                                    Estos tres bloques sirven mucho para ver si las necesidades son operativas, comerciales o de conducción del equipo.
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}