import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  FileSpreadsheet,
  ArrowRight,
  Brain,
  Zap,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sección principal */}
      <div className="relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-900 via-background to-cyber-800 opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl"></div>
        </div>

        {/* Encabezado */}
        <div className="relative z-10 container mx-auto px-4 pt-12 pb-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Análisis potenciado por IA
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
              Herramientas Data Mentor
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Plataforma avanzada para análisis de datos e insights de clientes,
              diseñada para operaciones en estaciones de servicio y gestión de feedback.
            </p>
          </div>

          {/* Grid de herramientas */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Tarjeta Chat Data Mentor */}
            <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
              {/* Efecto Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Chat Data Mentor
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Asistente conversacional inteligente para análisis de datos en tiempo real,
                  generación de insights y resolución de consultas mediante procesamiento
                  de lenguaje natural avanzado.
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-neon-green" />
                    Análisis en tiempo real
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4 text-neon-purple" />
                    Potenciado con IA
                  </div>
                </div>

                <Link to="/chat-data-mentor">
                  <Button className="w-full group/btn bg-primary/90 hover:bg-primary text-primary-foreground">
                    Iniciar conversación
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tarjeta Necesidades APIES */}
            <Card className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
              {/* Efecto Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 to-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <CardHeader className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Necesidades APIES
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Herramienta avanzada para procesar archivos Excel con comentarios
                  de estaciones de servicio. Clasificá, filtrá y extraé insights valiosos
                  con análisis de sentimientos y necesidades.
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-neon-blue rounded-full"></div>
                    Procesamiento y análisis de archivos Excel
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>
                    Filtros avanzados por fecha, sentimiento y estación
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-neon-purple rounded-full"></div>
                    Clasificación automática por tópicos
                  </div>
                </div>

                <Link to="/necesidades-apies">
                  <Button className="w-full group/btn bg-primary/90 hover:bg-primary text-primary-foreground">
                    Abrir herramienta
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sección de features */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-8">
              Potenciado por tecnología avanzada
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-6 rounded-xl border border-border/50 bg-card/50">
                <Brain className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  Inteligencia artificial
                </h3>
                <p className="text-sm text-muted-foreground">
                  Algoritmos de machine learning para interpretar datos con precisión
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border/50 bg-card/50">
                <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  Procesamiento en tiempo real
                </h3>
                <p className="text-sm text-muted-foreground">
                  Análisis instantáneo para obtener resultados al momento
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border/50 bg-card/50">
                <FileSpreadsheet className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  Integración de datos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Integración fluida con archivos Excel y filtros personalizados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
