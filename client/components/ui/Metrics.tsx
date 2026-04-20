import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, MoreHorizontal, RefreshCw } from "lucide-react";
import { useTrackSectorEntry } from "@/hooks/useTrackSectorEntry";

const BASE_URL = "https://dm-back-fn4l.onrender.com";

interface SectorSummary {
  key: string;
  label: string;
  description?: string;
  total_visits: number;
}

interface UserSectorMetricValue {
  count: number;
  last_visited_at: string | null;
}

interface UserMetricRow {
  dni: number | string;
  name: string;
  email: string;
  admin: boolean;
  gestor: boolean;
  status: boolean;
  total_visits: number;
  sectors: Record<string, UserSectorMetricValue>;
}

interface MetricsResponse {
  sectors: SectorSummary[];
  rows: UserMetricRow[];
  totals: {
    total_users: number;
    total_sector_visits: number;
    most_used_sector: {
      key: string;
      label: string;
      visits: number;
    } | null;
  };
}

function formatDate(value: string | null) {
  if (!value) return "Sin ingresos";
  return new Date(value).toLocaleString("es-AR");
}

export default function Metrics() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useTrackSectorEntry("admin_metrics");

  const fetchMetrics = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    setError("No hay token disponible.");
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError("");

    const response = await fetch(`${BASE_URL}/metrics/summary`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json().catch(() => ({}));

    console.log("STATUS metrics:", response.status);
    console.log("BODY metrics:", result);

    if (!response.ok) {
      throw new Error(
        result?.error ||
        result?.message ||
        `Error HTTP ${response.status}`
      );
    }

    setData(result);
  } catch (err: any) {
    console.error("Error fetching metrics:", err);
    setError(err.message || "Error al cargar métricas.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMetrics();
  }, []);

  const orderedRows = useMemo(() => {
    if (!data?.rows) return [];
    return [...data.rows].sort(
      (a, b) => b.total_visits - a.total_visits || a.name.localeCompare(b.name)
    );
  }, [data]);

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Métricas de uso
            </CardTitle>
            <CardDescription>
              Ingresos por usuario y por sector.
            </CardDescription>
          </div>

          <Button variant="outline" onClick={fetchMetrics} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
        </CardHeader>
      </Card>

      {loading ? (
        <Card className="border-border shadow-xl">
          <CardContent className="py-10 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-border shadow-xl">
          <CardContent className="py-6">
            <p className="text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.totals.total_users ?? 0}</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">Ingresos totales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data?.totals.total_sector_visits ?? 0}</p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">Sector más usado</CardTitle>
              </CardHeader>
              <CardContent>
                {data?.totals.most_used_sector ? (
                  <>
                    <p className="text-lg font-semibold">
                      {data.totals.most_used_sector.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.totals.most_used_sector.visits} ingresos
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">Sin datos todavía</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-xl">
            <CardHeader>
              <CardTitle>Detalle por usuario</CardTitle>
              <CardDescription>
                Cantidad de visitas por sector y total acumulado.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 pr-4 font-semibold">Usuario</th>
                      <th className="text-left py-3 pr-4 font-semibold">Email</th>

                      {data?.sectors.map((sector) => (
                        <th key={sector.key} className="text-left py-3 pr-4 font-semibold">
                          {sector.label}
                        </th>
                      ))}

                      <th className="text-left py-3 pr-4 font-semibold">Total</th>
                      <th className="text-left py-3 pr-4 font-semibold">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orderedRows.length > 0 ? (
                      orderedRows.map((row) => (
                        <tr key={row.dni} className="border-b border-border/60 align-top">
                          <td className="py-4 pr-4">
                            <div className="space-y-1">
                              <div className="font-medium text-foreground">{row.name}</div>
                              <div className="flex gap-2 flex-wrap">
                                {row.admin && (
                                  <Badge variant="outline">Admin</Badge>
                                )}
                                {row.gestor && (
                                  <Badge variant="outline" className="bg-neon-green/20 text-neon-green border-neon-green/30">
                                    Gestor
                                  </Badge>
                                )}
                                {!row.status && (
                                  <Badge variant="outline" className="text-muted-foreground">
                                    Inactivo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 pr-4 text-muted-foreground">{row.email}</td>

                          {data?.sectors.map((sector) => {
                            const metric = row.sectors?.[sector.key];
                            const count = metric?.count ?? 0;
                            const lastVisited = metric?.last_visited_at ?? null;

                            return (
                              <td key={`${row.dni}-${sector.key}`} className="py-4 pr-4">
                                <div className="space-y-1">
                                  <Badge variant="outline">
                                    {count}
                                  </Badge>
                                  <p
                                    className="text-[11px] text-muted-foreground"
                                    title={formatDate(lastVisited)}
                                  >
                                    {lastVisited ? "Último ingreso" : "Sin ingresos"}
                                  </p>
                                </div>
                              </td>
                            );
                          })}

                          <td className="py-4 pr-4">
                            <span className="font-semibold">{row.total_visits}</span>
                          </td>

                          <td className="py-4 pr-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                              title="Saber más próximamente"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={(data?.sectors.length ?? 0) + 4}
                          className="py-6 text-center text-muted-foreground"
                        >
                          No hay métricas registradas todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}