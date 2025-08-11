import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  Send,
  GraduationCap,
  User,
  BookOpen,
  PlayCircle,
  FileText,
  Clock,
  ArrowDownToLine,
} from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  lessons: number;
  duration: string;
  level: "Principiante" | "Intermedio" | "Avanzado";
  status: "Disponible" | "En Progreso" | "Completo";
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

const sampleCourses: Course[] = [
  {
    id: "1",
    title: "Fundamentos de seguridad Laboral",
    description: "Aprende lo básico en cuestiones de seguridad laboral",
    modules: 3,
    lessons: 8,
    duration: "45 minutos",
    level: "Principiante",
    status: "Disponible",
  },
  {
    id: "2",
    title: "Salud e Higiene en gastronomia Full",
    description: "Punto a punto los procesos necesarios para cumplir todas las normas de seguridad e higiene",
    modules: 2,
    lessons: 6,
    duration: "1 hora",
    level: "Intermedio",
    status: "En Progreso",
  },
  {
    id: "3",
    title: "Planes de acción para emergencias",
    description: "Respuestas proactivas y responsables frente a situaciones de emergencia",
    modules: 4,
    lessons: 10,
    duration: "1 hora y 15 minutos",
    level: "Avanzado",
    status: "Disponible",
  },
];

export default function ChatDataMentorCursos() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Bienvenido a los cursos de data mentor! Soy tu asistente de creación. Puedo ayudarte a crear cursos a partir de datos actuales y proveer un resultado personalizado. Que te gustaria crear el dia de hoy?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (prompt?: string) => {
    const promptToSend = prompt || inputValue.trim();
    if (!promptToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: promptToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("https://repomatic-turbo-meww.onrender.com/chat_mentor_cursos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify({
          prompt: promptToSend,
          ...(threadId && { thread_id: threadId }),
          ...(selectedCourse && { course_context: selectedCourse }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setThreadId(data.thread_id);
        const botMessage: Message = {
          id: Date.now().toString() + "-bot",
          type: "bot",
          content: data.response || "No se obtuvo respuesta del asistente.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: Date.now().toString() + "-err",
        type: "bot",
        content: `⚠️ Error: ${error.message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCourseSelection = (course: Course) => {
    const prompt = `Crea un curso llamado "${course.title}" con la siguiente descripción: "${course.description}". El curso debe tener aproximadamente ${course.duration}, con un nivel de "${course.level}".`;
    handleSendMessage(prompt);
  };

  const handleDownload = (content: string, timestamp: Date) => {
    const dateStr = timestamp.toLocaleDateString('es-ES');
    const timeStr = timestamp.toLocaleTimeString('es-ES').replace(/:/g, '-');
    const fileName = `Respuesta_ChatMentor_${dateStr}_${timeStr}.doc`;

    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${fileName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1, h2, h3, h4, h5, h6 { color: #2c3e50; margin-top: 1em; }
            ul, ol { padding-left: 20px; }
            li { margin-bottom: 0.5em; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body>
          ${content.replace(/\n/g, '<br/>')}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "bg-neon-green/20 text-neon-green border-neon-green/30";
      case "Intermedio":
        return "bg-neon-blue/20 text-neon-blue border-neon-blue/30";
      case "Advanzado":
        return "bg-neon-purple/20 text-neon-purple border-neon-purple/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponible":
        return "bg-primary/20 text-primary border-primary/30";
      case "En Progreso":
        return "bg-neon-blue/20 text-neon-blue border-neon-blue/30";
      case "Completo":
        return "bg-neon-green/20 text-neon-green border-neon-green/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <a
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Chat Data Mentor Cursos
              </h1>
              <p className="text-sm text-muted-foreground">
                Asistente para crear cursos mediante análisis de datos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courses Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-border shadow-xl h-fit">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Cursos pre-definidos
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Selecciona un curso para crear
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleCourses.map((course) => (
                  <Card
                    key={course.id}
                    className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                      selectedCourse?.id === course.id
                        ? "border-primary bg-primary/5"
                        : "border-border/50"
                    }`}
                    onClick={() => handleCourseSelection(course)} // ⚠️ Llama a la nueva función
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground text-sm">
                          {course.title}
                        </h3>
                        <PlayCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">
                        {course.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getLevelColor(course.level)}`}
                        >
                          {course.level}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(course.status)}`}
                        >
                          {course.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {course.modules}m
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {course.lessons}l
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="border-border shadow-2xl h-[700px] flex flex-col">
              {/* Selected Course Context */}
              {selectedCourse && (
                <div className="border-b border-border p-4 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {selectedCourse.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Contexto de curso activo - Agrega algo respecto a lo que necesitas para crearlo
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCourse(null)}
                      className="ml-auto"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.type === "bot" && (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        } relative`}
                      >
                        {message.type === "bot" && (
                          <div 
                            className="absolute -right-10 top-1/2 -translate-y-1/2" 
                            title="Descargar respuesta" // ⚠️ Tooltip aquí
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="p-1 text-muted-foreground hover:text-foreground"
                              onClick={() => handleDownload(message.content, message.timestamp)}
                              aria-label="Descargar respuesta"
                            >
                              <ArrowDownToLine className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="prose dark:prose-invert text-sm leading-relaxed">
                          <ReactMarkdown
                            components={{
                              br: ({node, ...props}) => <br {...props} />,
                              p: ({node, ...props}) => <p {...props} className="mt-4 mb-2" />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        <span className="text-xs opacity-70 mt-2 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      {message.type === "user" && (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <div className="max-w-[80%] rounded-xl px-4 py-3 bg-muted">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-4 bg-card/50">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      selectedCourse
                        ? `Ask about ${selectedCourse.title}...`
                        : "Contame que tipo de curso te gustaria crear..."
                    }
                    className="flex-1 bg-background"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}