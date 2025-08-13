import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  History as HistoryIcon,
  Download,
  Copy,
  MessageCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  User,
  Bot,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface HistoryItem {
  id: string;
  titulo: string;
  email: string;
  texto: string;
  created_at: string;
  updated_at: string;
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        setError("No se encontró el email del usuario. Por favor, inicia sesión.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("https://repomatic-turbo-meww.onrender.com/get-history-by-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "1803-1989-1803-1989",
          },
          body: JSON.stringify({ email: userEmail }),
        });
        
        if (!response.ok) {
          throw new Error("Error al obtener el historial de conversaciones.");
        }

        const data = await response.json();
        setHistoryItems(data);
      } catch (e: any) {
        setError(e.message);
        console.error("Error fetching history:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownloadItem = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadAllHistory = (historyItem: HistoryItem) => {
    handleDownloadItem(
      historyItem.texto,
      `${historyItem.titulo.replace(/\s+/g, "_")}_${new Date(historyItem.created_at).toLocaleDateString()}.txt`
    );
  };
  
  const handleDeleteConversation = (historyId: string) => {
    // Aquí puedes agregar la lógica para llamar a la API de eliminación
    setHistoryItems((prevItems) => prevItems.filter((item) => item.id !== historyId));

    if (selectedHistory?.id === historyId) {
      setSelectedHistory(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/chat-data-mentor-cursos"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <HistoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Histórico de Cursos guardados
              </h1>
              <p className="text-sm text-muted-foreground">
                Busca y administra tus cursos creados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - History List */}
          <div className="lg:col-span-1 lg:block">
            <Collapsible
              open={isLeftPanelOpen}
              onOpenChange={setIsLeftPanelOpen}
              className="lg:hidden mb-4"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between lg:hidden"
                >
                  <span className="flex items-center gap-2">
                    <HistoryIcon className="h-4 w-4" />
                    History ({historyItems.length})
                  </span>
                  {isLeftPanelOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="lg:hidden">
                <div className="mt-4">
                  <HistoryList
                    history={historyItems}
                    selectedHistory={selectedHistory}
                    onSelectHistory={setSelectedHistory}
                    onDownloadAll={handleDownloadAllHistory}
                    onDeleteConversation={handleDeleteConversation}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Desktop History List */}
            <div className="hidden lg:block">
              <HistoryList
                history={historyItems}
                selectedHistory={selectedHistory}
                onSelectHistory={setSelectedHistory}
                onDownloadAll={handleDownloadAllHistory}
                onDeleteConversation={handleDeleteConversation}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>

          {/* Right Panel - Conversation View */}
          <div className="lg:col-span-3">
            {selectedHistory ? (
              <ConversationView
                historyItem={selectedHistory}
                onCopyContent={handleCopyResponse}
                onDownloadItem={handleDownloadItem}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface HistoryListProps {
  history: HistoryItem[];
  selectedHistory: HistoryItem | null;
  onSelectHistory: (item: HistoryItem) => void;
  onDownloadAll: (item: HistoryItem) => void;
  onDeleteConversation: (historyId: string) => void;
  isLoading: boolean;
  error: string | null;
}

function HistoryList({
  history,
  selectedHistory,
  onSelectHistory,
  onDownloadAll,
  onDeleteConversation,
  isLoading,
  error
}: HistoryListProps) {

  if (isLoading) {
    return (
      <Card className="border-border shadow-xl h-full flex items-center justify-center">
        <CardContent className="text-center p-6">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border shadow-xl h-full flex items-center justify-center">
        <CardContent className="text-center p-6">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-border shadow-xl h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <HistoryIcon className="h-5 w-5 text-primary" />
          Histórico de guardados
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {history.length} cursos encontrados
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground mt-8">No se encontraron cursos guardados.</p>
            ) : (
              history.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                    selectedHistory?.id === item.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50"
                  }`}
                  onClick={() => onSelectHistory(item)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-foreground text-sm line-clamp-2">
                          {item.titulo}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/10 text-primary border-primary/20"
                        >
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {item.texto.split("user:").length + item.texto.split("bot:").length - 2} interacciones
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDownloadAll(item);
                            }}
                            className="h-7 px-2"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Estás seguro de que quieres eliminar "${item.titulo}"? Esta acción no se puede deshacer.`)) {
                                onDeleteConversation(item.id);
                              }
                            }}
                            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ConversationViewProps {
  historyItem: HistoryItem;
  onCopyContent: (content: string) => void;
  onDownloadItem: (content: string, filename: string) => void;
}

function ConversationView({
  historyItem,
  onCopyContent,
  onDownloadItem,
}: ConversationViewProps) {
  const formatConversationText = (text: string) => {
    // Reemplaza "user:" con un formato más visible (más saltos de línea y una línea separadora)
    let formattedText = text.replace(/user:/g, '\n\n---\n\n**USER:**\n\n');
    // Reemplaza "bot:" con un formato más visible (más saltos de línea y una línea separadora)
    formattedText = formattedText.replace(/bot:/g, '\n\n---\n\n**BOT:**\n\n');
    return formattedText.trim();
  };
  
  return (
    <Card className="border-border shadow-xl h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-foreground">{historyItem.titulo}</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {new Date(historyItem.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCopyContent(historyItem.texto)}
              className="h-8 px-2"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar todo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadItem(
                historyItem.texto,
                `${historyItem.titulo.replace(/\s+/g, "_")}_${new Date(historyItem.created_at).toLocaleDateString()}.txt`
              )}
              className="h-8 px-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar completo
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-auto">
        <ScrollArea className="h-full p-6">
          <div className="prose dark:prose-invert text-muted-foreground text-sm leading-relaxed">
            <ReactMarkdown>
              {formatConversationText(historyItem.texto)}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-border shadow-xl h-full flex items-center justify-center">
      <CardContent className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Selecciona una conversación
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Clica en una conversación de la lista para ver el chat completo
          y descargar los mensajes individuales.
        </p>
      </CardContent>
    </Card>
  );
}