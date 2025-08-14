import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { authActions } from "../store";
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
  Minimize,
  Expand,
  Paperclip,
  Link,
  Eraser,
  Copy,
  Sparkles,
  ListChecks,
  Mic,
  X,
  HelpCircle,
  Save,
  Loader2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ReactMarkdown from 'react-markdown';
import mammoth from 'mammoth';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  lessons: number;
  duration: string;
  level: "Principiante" | "Intermedio" | "Advanzado";
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
    level: "Advanzado",
    status: "Disponible",
  },
];

const predefinedOptions = {
  objetivo: [
    "Competencia a desarrollar",
    "Conocimientos específicos de producto",
    "Lograr un mindset centrado en el cliente",
    "Entrenamiento de la dotación",
    "Cultura en seguridad"
  ],
  audiencia: [
    "Vendedor de estación de servicio",
    "Jefe de estación de servicio",
    "Responsable comercial",
    "Distribuidor de Gas"
  ],
  duración: [
    "Micro-curso (5 min)",
    "Módulo (30 min)",
    "Módulo (1 hora)"
  ],
  formato: [
    "Teórico",
    "Práctico",
    "Mixto",
    "Gamificado",
    "Role-play"
  ],
  recursos: [
    "Manuales",
    "Material adjunto",
    "Bases de datos de clientes"
  ],
  dificultad: [
    "Básico",
    "Intermedio",
    "Avanzado"
  ],
  evaluación: [
    "Preguntas de selección múltiple",
    "Checklist de observación"
  ],
  tono: [
    "Institucional",
    "Motivacional",
    "Cercano",
    "Técnico"
  ]
};

const MAX_CHARACTERS = 4000;

type PredefinedSelections = {
  [key: string]: string | undefined;
};

export default function ChatDataMentorCursos() {
  const navigate = useNavigate();
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
  const [selectedPredefined, setSelectedPredefined] = useState<PredefinedSelections>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedFileContent, setAttachedFileContent] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (promptToSend: string, userMessageContent?: string) => {
    const combinedContent = attachedFiles.length > 0 ? `\n\nEl siguiente texto es adjunto por el usuario:\n\n'${attachedFileContent}'` : '';
    const selections = Object.entries(selectedPredefined)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value}`);

    let apiPrompt = promptToSend;
    if (selections.length > 0) {
      apiPrompt += `\n\n**Parámetros predefinidos:**\n- ${selections.join('\n- ')}`;
    }
    apiPrompt += combinedContent;

    if (!promptToSend && !combinedContent && selections.length === 0) return;

    const predefinedCount = selections.length;
    const fileCount = attachedFiles.length;

    let displayMessage = userMessageContent || promptToSend;

    if (predefinedCount > 0 || fileCount > 0) {
      const parts = [];
      if (promptToSend) parts.push(promptToSend);
      if (predefinedCount > 0) parts.push(`(+${predefinedCount} predefinidos)`);
      if (fileCount > 0) parts.push(`(+${fileCount} adjuntos)`);
      displayMessage = parts.join(' ');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: displayMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setAttachedFiles([]);
    setAttachedFileContent(null);
    setSelectedPredefined({});
    setIsTyping(true);

    try {
      const response = await fetch("https://repomatic-turbo-meww.onrender.com/chat_mentor_cursos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify({
          prompt: apiPrompt,
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

  const handlerLogOut = () => {
    authActions.logout();
    navigate("/");
  };


  // Lógica para verificar el token de sesión al cargar el componente
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No se encontró un token. Redirigiendo a login.");
        handlerLogOut();
        return;
      }

      try {
        const response = await fetch('https://repomatic-turbo-meww.onrender.com/check_token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.warn("Token expirado o inválido. Cerrando sesión automáticamente.");
          handlerLogOut();
        }
      } catch (error) {
        console.error("Error al verificar el token:", error);
        handlerLogOut();
      }
    };

    checkTokenValidity();
  }, [navigate]);

  const handleActionButtonClick = (action: 'specify' | 'simplify' | 'sources' | 'optimize' | 'multipleChoice' | 'narrative' | 'studentQuestions') => {
    let apiPrompt = '';
    let userMessageContent = '';

    switch (action) {
      case 'specify':
        apiPrompt = "El contenido anterior es una excelente base para un curso. Ahora necesito que elabores y desarrolles cada uno de los puntos en profundidad. Genera un contenido más específico y detallado, expandiendo la información de cada sección.";
        userMessageContent = 'Expandiendo contenido...';
        break;
      case 'simplify':
        apiPrompt = "La estructura del curso es muy extensa. Por favor, resume los contenidos y la información para que sea una versión más simple, concisa y con menos puntos a tratar, manteniendo los conceptos clave.";
        userMessageContent = 'Simplificando contenido...';
        break;
      case 'sources':
        apiPrompt = "Por favor, proporciona las fuentes exactas de información utilizadas para generar la respuesta anterior. Incluye el nombre del documento, número de página, sección o cualquier otra referencia precisa que me permita verificar el origen de cada punto relevante. Responde con un listado claro y detallado para cada fuente.";
        userMessageContent = 'Recuperando fuentes...';
        break;
      case 'optimize':
        apiPrompt = `El siguiente prompt fue escrito por un usuario: "${inputValue}". Tu tarea es optimizar este prompt para que sea más efectivo en la creación de un curso, haciéndolo más claro, detallado y preciso. Luego, proporciona la justificación de los cambios realizados.`;
        userMessageContent = 'Optimizando prompt...';
        break;
      case 'multipleChoice':
        apiPrompt = "Basado en el contenido del curso que acabas de generar, crea un examen de multiple-choice. El examen debe ser para un alumno y debe estar bien estructurado. Para cada pregunta, proporciona al menos 4 opciones y marca claramente cuál es la respuesta correcta.";
        userMessageContent = 'Generando examen multiple-choice a partir del contenido';
        break;
      case 'narrative':
        apiPrompt = "Transforma el curso que acabas de generar a un modo narrativo. Escribe como si tuvieras que dar una charla o conferencia sobre el tema, con un tono continuo y fluído. No obvies ningún punto del contenido original, pero adapta la estructura para que sea coherente como una narración.";
        userMessageContent = 'Transformando en modo narrativo...';
        break;
      case 'studentQuestions':
        apiPrompt = "A partir del curso que acabas de crear, genera una lista de al menos 10 posibles preguntas que los estudiantes podrían hacer y que no esten actualmente respondidas en el curso generado. Para cada pregunta, proporciona una respuesta clara y concisa. Organiza las preguntas y respuestas en un formato de lista fácil de leer.";
        userMessageContent = 'Generando posibles preguntas de alumnos...';
        break;
    }

    if (apiPrompt) {
      handleSendMessage(apiPrompt, userMessageContent);
    }
  };

  const handleCourseSelection = (course: Course) => {
    const prompt = `Crea un curso llamado "${course.title}" con la siguiente descripción: "${course.description}". El curso debe tener aproximadamente ${course.duration}, con un nivel de "${course.level}".`;
    handleSendMessage(prompt, prompt);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        type: "bot",
        content:
          "Bienvenido a los cursos de data mentor! Soy tu asistente de creación. Puedo ayudarte a crear cursos a partir de datos actuales y proveer un resultado personalizado. Que te gustaria crear el dia de hoy?",
        timestamp: new Date(),
      },
    ]);
    setThreadId(null);
    setAttachedFiles([]);
    setAttachedFileContent(null);
    setSelectedPredefined({});
  };

  const handleClearPredefined = () => {
    setSelectedPredefined({});
  };

  const handleCopyResponse = (content: string) => {
    navigator.clipboard.writeText(content);
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    const allContentPromises = filesArray.map(file => readFileContent(file));
    const contents = await Promise.all(allContentPromises);

    const totalContentLength = contents.reduce((acc, curr) => acc + curr.length, 0);

    if (totalContentLength > MAX_CHARACTERS) {
      console.warn("La suma de los archivos excede el límite recomendado. Por favor, adjunte archivos más cortos.");
      setAttachedFiles([]);
      setAttachedFileContent(null);
      return;
    }

    setAttachedFiles(filesArray);
    setAttachedFileContent(contents.join("\n\n"));
  };

  const handleRemoveFiles = () => {
    setAttachedFiles([]);
    setAttachedFileContent(null);
  };

  const handlePredefinedChange = (category: string, value: string) => {
    setSelectedPredefined(prev => {
      const newSelections = { ...prev };
      if (newSelections[category] === value) {
        delete newSelections[category];
      } else {
        newSelections[category] = value;
      }
      return newSelections;
    });
  };

  const handleRemovePredefined = (category: string) => {
    setSelectedPredefined(prev => {
      const newSelections = { ...prev };
      delete newSelections[category];
      return newSelections;
    });
  };

  const handleSaveInteraction = async () => {
    if (!saveTitle.trim()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    setIsSaving(true);
    const email = localStorage.getItem('email') || 'anonimo@example.com';
    const titulo = saveTitle;
    const texto = messages.map(msg => `${msg.type}: ${msg.content}`).join('\n');

    try {
      const response = await fetch("https://repomatic-turbo-meww.onrender.com/history-user-add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "1803-1989-1803-1989",
        },
        body: JSON.stringify({ email, titulo, texto }), // ⚠️ Propiedades corregidas
      });
      const data = await response.json();
      if (data.resultado === 'guardado') {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error("Error saving interaction:", error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveStatus(null);
        setShowSaveModal(false);
        setSaveTitle("");
      }, 3000);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        if (file.name.endsWith(".txt")) {
          const text = new TextDecoder().decode(arrayBuffer);
          resolve(text);
        } else if (file.name.endsWith(".docx")) {
          try {
            const { value } = await mammoth.extractRawText({ arrayBuffer });
            resolve(value);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error("Tipo de archivo no soportado. Por favor, usa .txt o .docx."));
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
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
    <div className="min-h-screen bg-background flex flex-col">
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

      <div className="container mx-auto px-4 py-6 max-w-7xl flex-1">
        <div className="grid lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-1 h-full flex flex-col">
            <Card className="border-border shadow-xl h-full flex flex-col">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="item-3">
                  <AccordionTrigger className="p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <CardTitle className="text-foreground">
                        Acceso a Histórico
                      </CardTitle>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardDescription className="p-4 text-muted-foreground">
                      Accede al histórico de charlas guardadas con data mentor para rescatar tus cursos generados.
                    </CardDescription>
                    <CardContent className="px-4 pb-4">
                      <Button onClick={() => window.location.href = '/history'} className="w-full">
                        Ir a histórico
                      </Button>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-foreground">
                        Cursos pre-definidos
                      </CardTitle>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardDescription className="p-4 text-muted-foreground">
                      Selecciona un curso para crear
                    </CardDescription>
                    <CardContent className="space-y-4 px-4 pb-4">
                      {sampleCourses.map((course) => (
                        <Card
                          key={course.id}
                          className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${selectedCourse?.id === course.id
                            ? "border-primary bg-primary/5"
                            : "border-border/50"
                            }`}
                          onClick={() => handleCourseSelection(course)}
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
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle className="text-foreground">
                        Parámetros pre-definidos
                      </CardTitle>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardDescription className="p-4 text-muted-foreground">
                      Añade contexto a tu solicitud
                    </CardDescription>
                    <CardContent className="space-y-4 px-4 pb-4">
                      {Object.entries(predefinedOptions).map(([category, options]) => (
                        <div key={category}>
                          <p className="text-xs font-semibold text-foreground mb-2 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {options.map(option => (
                              <Badge
                                key={option}
                                variant={selectedPredefined[category] === option ? "default" : "outline"}
                                className={`cursor-pointer transition-colors ${selectedPredefined[category] === option ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                                onClick={() => handlePredefinedChange(category, option)}
                              >
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5 text-primary" />
                      <CardTitle className="text-foreground">
                        Tutorial
                      </CardTitle>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardDescription className="p-4 text-muted-foreground">
                      El siguiente video explica rápidamente como utilizar todas las herramientas de Cursos Data Mentor.
                    </CardDescription>
                    <CardContent className="px-4 pb-4">
                      {/* Contenedor responsive 16:9, sin depender de plugin aspect-video */}
                      <div
                        className="relative w-full overflow-hidden rounded-md border border-border"
                        style={{ paddingTop: "56.25%" }} // 16:9
                      >
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src="https://www.youtube-nocookie.com/embed/AhtCC6o2Lt4?rel=0&modestbranding=1"
                          title="Tutorial Cursos Data Mentor"
                          frameBorder={0}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>

                      <div className="mt-2 text-right">
                        <a
                          href="https://www.youtube.com/watch?v=AhtCC6o2Lt4"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Ver en YouTube
                        </a>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          </div>

          <div className="lg:col-span-2 h-full flex flex-col">
            <Card className="border-border shadow-2xl h-full flex flex-col">
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
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                          } flex flex-col`}
                      >
                        <div className="prose dark:prose-invert text-sm leading-relaxed mb-2">
                          <ReactMarkdown
                            components={{
                              br: ({ node, ...props }) => <br {...props} />,
                              p: ({ node, ...props }) => <p {...props} className="mt-4 mb-2" />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {message.type === "bot" && (
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center space-x-2">
                              {message.id !== "1" && (
                                <>
                                  <div title="Elaborar más el contenido">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleActionButtonClick('specify')}
                                      aria-label="Elaborar más el contenido"
                                    >
                                      <Expand className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div title="Hacer el contenido más simple">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleActionButtonClick('simplify')}
                                      aria-label="Hacer el contenido más simple"
                                    >
                                      <Minimize className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div title="Pedir fuentes de información">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleActionButtonClick('sources')}
                                      aria-label="Pedir fuentes de información"
                                    >
                                      <Link className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div title="Generar Multiple-Choice">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleActionButtonClick('multipleChoice')}
                                      aria-label="Generar Multiple-Choice"
                                    >
                                      <ListChecks className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div title="Transformar a modo narrativo">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleActionButtonClick('narrative')}
                                      aria-label="Transformar a modo narrativo"
                                    >
                                      <Mic className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div title="Generar preguntas de alumnos">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleActionButtonClick('studentQuestions')}
                                      aria-label="Generar preguntas de alumnos"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              <div title="Copiar respuesta">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleCopyResponse(message.content)}
                                  aria-label="Copiar respuesta"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <div title="Descargar respuesta">
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
                            </div>
                          </div>
                        )}
                        {message.type === "user" && (
                          <div className="flex justify-end items-center mt-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        )}
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

              <div className="border-t border-border p-4 bg-card/50">
                {(Object.keys(selectedPredefined).length > 0 || attachedFiles.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-md bg-accent text-accent-foreground text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleRemoveFiles();
                        handleClearPredefined();
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      <Eraser className="h-3 w-3 mr-1" />
                      Limpiar todo
                    </Button>
                    {Object.entries(selectedPredefined).map(([category, value]) => (
                      <Badge key={category} className="h-6">
                        <span>{value}</span>
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => handleRemovePredefined(category)}
                        />
                      </Badge>
                    ))}
                    {attachedFiles.map((file, index) => (
                      <Badge key={index} className="h-6">
                        <span>{file.name}</span>
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => handleRemoveFiles()}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {messages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearChat}
                      title="Limpiar chat"
                      className="flex-shrink-0"
                    >
                      <Eraser className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSaveModal(true)}
                    title="Guardar interacción"
                    className="flex-shrink-0"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.docx"
                    className="hidden"
                    multiple
                  />
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      title="Adjuntar archivo (.txt, .docx)"
                      className="flex-shrink-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    {attachedFiles.length > 0 && (
                      <button
                        onClick={handleRemoveFiles}
                        className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center p-0.5"
                        title="Eliminar archivos adjuntos"
                      >
                        {attachedFiles.length}
                      </button>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        selectedCourse
                          ? `Ask about ${selectedCourse.title}...`
                          : "Contame que tipo de curso te gustaria crear..."
                      }
                      className="flex-1 bg-background pr-10"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage(inputValue.trim());
                        }
                      }}
                    />
                    <div
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      title="Optimizar prompt"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 text-muted-foreground hover:text-foreground"
                        onClick={() => handleActionButtonClick('optimize')}
                        disabled={!inputValue.trim() || isSaving || isTyping}
                        aria-label="Optimizar prompt"
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSendMessage(inputValue.trim())}
                    disabled={(!inputValue.trim() && attachedFiles.length === 0) || isSaving || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Guardar Interacción</CardTitle>
              <CardDescription>
                Ponle un título a esta conversación para guardarla en tu historial.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                placeholder="Título de la interacción"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowSaveModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveInteraction} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
              </div>
              {saveStatus === 'success' && (
                <div className="text-green-500 text-sm mt-2">
                  ✅ Conversación guardada con éxito.
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="text-red-500 text-sm mt-2">
                  ❌ No se pudo guardar la conversación.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}