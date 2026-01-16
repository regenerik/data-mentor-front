import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authActions } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Bot, User, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Importación corregida de remarkGfm
import remarkGfm from "remark-gfm";

// Toast
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const API_BASE = "https://dm-back-fn4l.onrender.com";

interface Trace {
  mode?: string;
  sql?: string;
  rows?: number;
  router_ms?: number;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: string;
}

export default function ChatDataMentor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("dm_messages");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "1",
            type: "bot",
            content: "¡Hola! Soy tu Mentor de Datos. ¿En qué puedo ayudarte hoy?",
            timestamp: new Date().toISOString(),
          },
        ];
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(() =>
    localStorage.getItem("dm_thread_id")
  );
  const [trace, setTrace] = useState<Trace | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportToSubmit, setReportToSubmit] = useState<Message | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem("dm_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (threadId) localStorage.setItem("dm_thread_id", threadId);
  }, [threadId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    const handlerLogOut = () => {
      authActions.logout();
      navigate("/expired-token");
    };

    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");
      if (!token) return handlerLogOut();

      try {
        const resp = await fetch(`${API_BASE}/check_token`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) handlerLogOut();
      } catch {
        handlerLogOut();
      }
    };

    checkTokenValidity();
    const adminStatus = localStorage.getItem("admin") === "true";
    setIsAdmin(adminStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const nowISO = new Date().toISOString();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: nowISO,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setTrace(null);

    try {
      const response = await fetch(`${API_BASE}/chat_mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `1803-1989-1803-1989`,
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          ...(threadId && { thread_id: threadId }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setThreadId(data.thread_id ?? threadId);
        setTrace(data.trace ?? null);

        const botMessage: Message = {
          id: `${Date.now()}-bot`,
          type: "bot",
          content: data.response || "No se obtuvo respuesta del asistente.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: `${Date.now()}-err`,
        type: "bot",
        content: `⚠️ Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReportError = (botMessage: Message) => {
    setReportToSubmit(botMessage);
    setShowReportModal(true);
  };

  const confirmReportSubmit = async () => {
    if (!reportToSubmit) return;

    const userEmail = localStorage.getItem("email") || "desconocido";
    const previousMessage = messages[messages.indexOf(reportToSubmit) - 1];

    if (!previousMessage || previousMessage.type !== "user") {
      toast({
        title: "Error al reportar",
        description: "No se encontró la pregunta anterior.",
        variant: "destructive",
      });
      setShowReportModal(false);
      return;
    }

    const reportData = {
      user: userEmail,
      question: previousMessage.content,
      failed_answer: reportToSubmit.content,
      sql_query: trace?.sql || "No disponible",
    };


    try {
      const response = await fetch(`${API_BASE}/report_to_data_mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        toast({
          title: "¡Reporte enviado! 🎉",
          description: "El error ha sido enviado a los administradores para su revisión.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido al enviar el reporte.");
      }
    } catch (error: any) {
      toast({
        title: "Error al reportar",
        description: `Hubo un problema al enviar el reporte: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setShowReportModal(false);
      setReportToSubmit(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Mentor de Datos
              </h1>
              <p className="text-sm text-muted-foreground">
                Asistente de análisis de datos con IA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Messages */}
          <ScrollArea className="h-[400px] p-6">
            <div className="space-y-6">
              {messages.map((message) => {
                const timeLabel = new Date(message.timestamp).toLocaleTimeString();
                const isUser = message.type === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } flex flex-col`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs opacity-70">{timeLabel}</span>
                        {!isUser && !isTyping && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 ml-2 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleReportError(message)}
                            title="Reportar error"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing dots */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="max-w-[80%] rounded-xl px-4 py-3 bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Trace panel (visible solo para admins) */}
          {isAdmin && trace && (
            <div className="border-t border-border px-4 py-2 text-xs bg-card/70">
              <details>
                <summary className="cursor-pointer select-none">
                  Traza (modo: <b>{trace.mode ?? "-"}</b>, filas: <b>{trace.rows ?? 0}</b>)
                </summary>
                <div className="mt-2 space-y-1">
                  {trace.router_ms !== undefined && (
                    <div>Router: {trace.router_ms} ms</div>
                  )}
                  {trace.sql && (
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-2 text-muted-foreground">
                      {trace.sql}
                    </pre>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-4 bg-card/50">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pregúntame lo que quieras sobre tus datos..."
                className="flex-1 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Enter = enviar • Shift+Enter = salto de línea
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para reportar error */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
            <DialogTitle className="text-2xl font-bold text-yellow-500">
              Confirmar Reporte de Error
            </DialogTitle>
            <DialogDescription className="text-lg">
              ¿Estás seguro de que quieres reportar esta respuesta como un error?
            </DialogDescription>
            <DialogDescription className="text-sm text-muted-foreground">
              Esta acción ayudará a mejorar la calidad del asistente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancelar
            </Button>
            <Button variant="default" onClick={confirmReportSubmit}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}