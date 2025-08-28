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
    RotateCcw,
    Bug
} from "lucide-react";

const API_BASE = "https://repomatic-turbo-meww.onrender.com";

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

export default function ErroresReportados() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [searchTerm, setSearchTerm] = useState("");
    const [modalMessage, setModalMessage] = useState(""); // TODO: Integrar con el sistema de Toast

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/get_reports_of_data_mentor`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "1803-1989-1803-1989",
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch reports");
            }
            const data: Report[] = await response.json();
            setReports(data);
        } catch (error: any) {
            console.error("Error fetching reports:", error);
            setModalMessage(`Error al cargar los reportes: ${error.message}`);
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

    const filteredReports = sortedReports.filter((report) =>
        report.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        // Implementar la lógica para llamar a la IA
        alert(`Resolviendo el reporte ID: ${reportId} con IA...`);
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
                                variant="outline"
                                onClick={handleSortToggle}
                                className="w-full sm:w-auto"
                            >
                                Fecha
                                {sortOrder === "desc" ? (
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                ) : (
                                    <ChevronUp className="h-4 w-4 ml-2" />
                                )}
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
                            onClick={handleClearSearch}
                            className="w-full sm:w-auto"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {modalMessage && (
                <div className="p-4 bg-red-500/10 text-destructive border border-destructive rounded-md">
                    {modalMessage}
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
                                            className={`text-xs ${report.resolved
                                                    ? "bg-neon-green/20 text-neon-green"
                                                    : "bg-orange-500/20 text-orange-500"
                                                }`}
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
                                        >
                                            Resolver con IA
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