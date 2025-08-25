import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface FormData {
  apies: string;
  curso: string;
  fecha: string;
  gestor: string;
  duracionHoras: string;
  ausentes: string;
  presentes: string;
  resultadosLogros: string;
  compromiso: string;
  participacionActividades: string;
  concentracion: string;
  cansancio: string;
  interesTemas: string;
  recomendaciones: Record<string, string[]>;
  otrosAspectos: string;
  firmaFile: File | null;
  nombreFirma: string;
  emailGestor: string;
  jornada: string;
  dotacion_real_estacion: string;
  dotacion_en_campus: string;
  objetivo?: string;
  contenidoDesarrollado?: string;
}

interface CourseContent {
  objetivo: string;
  contenido: string;
}

const Form = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Static data
  const objetivosContenido: Record<string, CourseContent> = {
    'WOW Tienda': {
      objetivo: 'Optimizar las oportunidades de venta y fidelización en tienda y playa. Con este enfoque integral, el equipo podrá mejorar el servicio y maximizar el mix de productos, aumentando las ventas y asegurando la satisfacción del cliente en cada visita.',
      contenido: '• Gestión de la experiencia del cliente en cada etapa del ciclo de servicio.\n• Estrategias para maximizar rentabilidad y promover ventas.\n• Técnicas de comunicación y atención efectiva.\n• Elaboración de café, alimentos y prácticas de seguridad en tienda.\n• Dominio de productos de playa (lubricantes y combustibles).\n• Verificación de normas de seguridad y cumplimiento.'
    },
    'WOW Playa': {
      objetivo: 'Optimizar las oportunidades de venta y fidelización en tienda y playa. Con este enfoque integral, el equipo podrá mejorar el servicio y maximizar el mix de productos, aumentando las ventas y asegurando la satisfacción del cliente en cada visita.',
      contenido: '• Gestión de la experiencia del cliente en cada etapa del ciclo de servicio.\n• Estrategias para maximizar rentabilidad y promover ventas.\n• Técnicas de comunicación y atención efectiva.\n• Elaboración de café, alimentos y prácticas de seguridad en tienda.\n• Dominio de productos de playa (lubricantes y combustibles).\n• Verificación de normas de seguridad y cumplimiento.'
    },
    'PEC 1.0': {
      objetivo: 'Transforma la manera en que tu equipo de venta se relaciona con los clientes y genera una conexión única. En este programa, tus vendedores aprenderán a crear experiencias memorables desde el primer momento, logrando que cada cliente se sienta atendido y valorado. Descubrirán el nuevo modelo de relacionamiento y los pilares de la experiencia del cliente (CX), habilidades que los harán destacar en el mercado y fidelizarán a cada visitante.',
      contenido: '• Los pilares esenciales de CX para maximizar la satisfacción.\n• Herramientas de gestión para un desempeño impecable.\n• Creación de experiencias guiadas que fidelizan a los clientes.\n• Modelos de relacionamiento que crean conexiones duraderas.'
    },
    'PEC 2.0': {
      objetivo: 'Transformar tu dotación y consolidar un equipo que sea referente en servicio al cliente. Este programa les brinda a tus vendedores las técnicas y estrategias para aplicar el modelo de conexión emocional, haciendo que cada miembro de tu equipo sea un embajador de la experiencia del cliente, capaz de influir y cautivar a cada visitante.',
      contenido: '• Técnicas avanzadas para generar conexión emocional con el cliente.\n• Herramientas prácticas para crear experiencias únicas en cada interacción.\n• Ejecución y monitoreo de un ciclo de servicio que fideliza.\n• Estrategias para potenciar la motivación y el compromiso del equipo.\n• Casos de éxito en la aplicación de modelos de relacionamiento efectivo.'
    },
    'PEM Full': {
      objetivo: 'Proveer al ingresarte, de las herramientas básicas y fundamentales para que pueda desempeñarse en una Estación de servicios como vendedor de Tienda.',
      contenido: 'Instancia presencial del módulo técnico/comercial destinado a aspirantes a trabajar en los sectores de Tienda FULL de una Estación de Servicios. Organizado en tres ejes temáticos (Modelo de Negocio; Gestion del Full; Operación Full) Los contenidos incluidos son: Concepto FULL. Sectores de tienda. Tareas en cada sector. El rol del vendedor.'
    },
    'PEM Retail': {
      objetivo: 'Proveer al ingresante, de las herramientas básicas y fundamentales para que pueda desempeñarse en una Estación de servicios como vendedor de Playa.',
      contenido: 'Propósito YPF. Cadena de valor.  La Red de Retail, La Estación de servicio. Sectores y aspectos clave, Pilares de la Red. Rol del vendedor, Perfil del Vendedor, Funciones. Composición del Lubricante, lectura de un envase, viscosidad., los acuerdos, diferencias entre productos y los tips, compactibilidad con el catalizado, identificar a  los vehículos por su Tecnología,importancia del nivel de aceite del motor, Seguridad en Playa, comunicación efectiva con el Cliente. Combustible nafta, las normas euro y su evolución, Combustible diesel, Calidad y trazabilidad de los combustibles, Venta y mix de combustibles.  CDS Playa. Brindar al ingresante sin experiencia los conocimientos básicos necesarios para desempeñarse en una Estación de la Red YPF bajo los estándares de seguridad que exige la Compañía.'
    }
  };

  const gestoresEmail: Record<string, string> = {
    'Jose L. Gallucci': 'jose.l.gallucci@ypf.com',
    'Mauricio Cuevas': 'mauricio.cuevas@ypf.com',
    'John Martinez': 'john.martinez@ypf.com',
    'Georgina M. Cutili': 'georgina.m.cutili@ypf.com',
    'Octavio Torres': 'octavio.torres@ypf.com',
    'Fernanda M. Rodriguez': 'fernanda.m.rodriguez@ypf.com',
    'Pablo J. Raggio': 'pablo.j.raggio@ypf.com',
    'Noelia Otarula': 'noelia.otarula@ypf.com',
    'Dante Merluccio': 'dante.merluccio@ypf.com',
    'Flavia Camuzzi': 'flavia.camuzzi@ypf.com'
  };

  const recomendacionesMapping: Record<string, string[]> = {
    'WOW Playa': [
      'Ciclo de servicio: combustibles líquidos (líquido y GNC)',
      'Programa cultura Experiencia del cliente v2.0',
      'Nuestros productos combustibles / lubricantes'
    ],
    'WOW Tienda': [
      'Ciclo de servicios Tienda',
      'Programa cultura Experiencia del cliente v2.0',
      'Elaboración de café'
    ],
    'PEC 2.0': [
      'Programa cultura Experiencia del cliente v2.0',
      'e-Class La voz que escuchamos'
    ],
    'PEC 1.0': [
      'Programa cultura Experiencia del cliente v2.0',
      'e-Class La voz que escuchamos'
    ]
  };

  // Form state
  const initialFormData: FormData = {
    apies: '',
    curso: '',
    fecha: '',
    gestor: '',
    duracionHoras: '',
    ausentes: '',
    presentes: '',
    resultadosLogros: '',
    compromiso: '',
    participacionActividades: '',
    concentracion: '',
    cansancio: '',
    interesTemas: '',
    recomendaciones: {},
    otrosAspectos: '',
    firmaFile: null,
    nombreFirma: '',
    emailGestor: '',
    jornada: '',
    dotacion_real_estacion: '',
    dotacion_en_campus: ''
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [recommendationsOptions, setRecommendationsOptions] = useState<Record<string, string[]>>({});

  // Update objective, content and recommendations when course changes
  useEffect(() => {
    if (!formData.curso) return;
    
    const courseData = objetivosContenido[formData.curso];
    if (!courseData) return;

    const { objetivo, contenido } = courseData;

    // Exclude new courses from recommendations
    const excludedRecommendations = ['PEM Full', 'PEM Retail'];
    const recs = Object.fromEntries(
      Object.entries(recomendacionesMapping).filter(
        ([key]) =>
          key !== formData.curso &&
          !excludedRecommendations.includes(key) &&
          !(formData.curso === 'PEC 2.0' && key === 'PEC 1.0')
      )
    );

    setFormData(prev => ({
      ...prev,
      objetivo,
      contenidoDesarrollado: contenido,
      recomendaciones: {}
    }));
    setRecommendationsOptions(recs);
  }, [formData.curso]);

  // Update emailGestor when gestor changes
  useEffect(() => {
    if (!formData.gestor) return;
    setFormData(prev => ({ 
      ...prev, 
      emailGestor: gestoresEmail[formData.gestor] || ''
    }));
  }, [formData.gestor]);

  const handleChange = (name: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecommendationChange = (curso: string) => {
    setFormData(prev => {
      const recs = { ...prev.recomendaciones };
      if (recs[curso]) {
        delete recs[curso];
      } else {
        recs[curso] = recomendacionesMapping[curso] || [];
      }
      return { ...prev, recomendaciones: recs };
    });
  };

  const validateForm = () => {
    const required = [
      'apies', 'curso', 'fecha', 'gestor', 'duracionHoras',
      'ausentes', 'presentes', 'resultadosLogros',
      'compromiso', 'participacionActividades', 'concentracion', 'cansancio', 'interesTemas'
    ];
    return required.every(f => !!formData[f as keyof FormData]) && formData.resultadosLogros.length >= 20;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Completa todos los campos y asegura al menos 20 caracteres en 'Resultados y logros'.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('https://repomatic-turbo-meww.onrender.com/form_gestores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '1803-1989-1803-1989'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Formulario enviado correctamente."
        });
        setFormData(initialFormData);
        setRecommendationsOptions({});
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error enviando formulario:', error);
      toast({
        title: "Error",
        description: "Error al enviar el formulario. Inténtalo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/forms")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Formulario para Gestores
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Datos principales del curso y gestor
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apies">APIES</Label>
                <Input
                  id="apies"
                  value={formData.apies}
                  onChange={(e) => handleChange('apies', e.target.value)}
                  placeholder="Ingrese APIES"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="curso">Nombre del Curso</Label>
                <Select value={formData.curso} onValueChange={(value) => handleChange('curso', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(objetivosContenido).map(curso => (
                      <SelectItem key={curso} value={curso}>{curso}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleChange('fecha', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gestor">Gestor Regional</Label>
                <Select value={formData.gestor} onValueChange={(value) => handleChange('gestor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un gestor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gestoresEmail).map(gestor => (
                      <SelectItem key={gestor} value={gestor}>{gestor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracionHoras">Duración en Horas</Label>
                <Input
                  id="duracionHoras"
                  type="number"
                  value={formData.duracionHoras}
                  onChange={(e) => handleChange('duracionHoras', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jornada">Jornada</Label>
                <Select value={formData.jornada} onValueChange={(value) => handleChange('jornada', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mañana">Mañana</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Completa">Completa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ausentes">Ausentes</Label>
                <Input
                  id="ausentes"
                  type="number"
                  min="0"
                  value={formData.ausentes}
                  onChange={(e) => handleChange('ausentes', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentes">Asistentes</Label>
                <Input
                  id="presentes"
                  type="number"
                  min="0"
                  value={formData.presentes}
                  onChange={(e) => handleChange('presentes', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dotacion_real_estacion">Dotación real de estación</Label>
                <Input
                  id="dotacion_real_estacion"
                  type="number"
                  value={formData.dotacion_real_estacion}
                  onChange={(e) => handleChange('dotacion_real_estacion', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dotacion_en_campus">Dotación en Campus</Label>
                <Input
                  id="dotacion_en_campus"
                  type="number"
                  value={formData.dotacion_en_campus}
                  onChange={(e) => handleChange('dotacion_en_campus', e.target.value)}
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Content */}
          {formData.curso && (
            <Card>
              <CardHeader>
                <CardTitle>Contenido del Curso</CardTitle>
                <CardDescription>
                  Objetivos y contenido desarrollado para {formData.curso}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Objetivos del Curso</Label>
                  <Textarea
                    value={formData.objetivo || ''}
                    readOnly
                    rows={3}
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contenido Desarrollado</Label>
                  <Textarea
                    value={formData.contenidoDesarrollado || ''}
                    readOnly
                    rows={4}
                    className="bg-muted whitespace-pre-line"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results and Evaluation */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados y Evaluación</CardTitle>
              <CardDescription>
                Evaluación del desarrollo del curso y participación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resultadosLogros">Resultados y logros</Label>
                <Textarea
                  id="resultadosLogros"
                  value={formData.resultadosLogros}
                  onChange={(e) => handleChange('resultadosLogros', e.target.value)}
                  placeholder="Comentarios respecto del dictado, participación e involucramiento de los participantes (mínimo 20 caracteres)"
                  rows={4}
                  required
                />
                <div className="text-xs text-muted-foreground">
                  {formData.resultadosLogros.length}/20 caracteres mínimos
                </div>
              </div>

              <Separator />

              {/* Evaluation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ['Nivel de compromiso en el curso', 'compromiso'],
                  ['Nivel de participación en las actividades sugeridas', 'participacionActividades'],
                  ['Nivel de concentración durante el curso', 'concentracion'],
                  ['Nivel de cansancio', 'cansancio'],
                  ['Interés en los temas', 'interesTemas']
                ].map(([label, name]) => (
                  <div key={name} className="space-y-3">
                    <Label className="text-sm font-medium">{label}</Label>
                    <RadioGroup
                      value={formData[name as keyof FormData] as string}
                      onValueChange={(value) => handleChange(name as keyof FormData, value)}
                      className="flex flex-row gap-6"
                    >
                      {['alto', 'medio', 'bajo'].map(option => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${name}-${option}`} />
                          <Label 
                            htmlFor={`${name}-${option}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="otrosAspectos">Otros aspectos a destacar</Label>
                <Textarea
                  id="otrosAspectos"
                  value={formData.otrosAspectos}
                  onChange={(e) => handleChange('otrosAspectos', e.target.value)}
                  placeholder="Completar de ser necesario con los detalles de las observaciones marcadas en el punto anterior"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {Object.keys(recommendationsOptions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
                <CardDescription>
                  Selecciona los cursos recomendados para complementar la formación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.keys(recommendationsOptions).map(curso => (
                  <div key={curso} className="space-y-2 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`rec-${curso}`}
                        checked={!!formData.recomendaciones[curso]}
                        onCheckedChange={() => handleRecommendationChange(curso)}
                      />
                      <Label 
                        htmlFor={`rec-${curso}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {curso}
                      </Label>
                    </div>
                    <ul className="ml-6 space-y-1">
                      {recomendacionesMapping[curso]?.map((rec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Signature */}
          <Card>
            <CardHeader>
              <CardTitle>Firma</CardTitle>
              <CardDescription>
                Nombre que aparecerá como firma en el PDF resultante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="nombreFirma">Nombre para la firma</Label>
                <Input
                  id="nombreFirma"
                  value={formData.nombreFirma}
                  onChange={(e) => handleChange('nombreFirma', e.target.value)}
                  placeholder="Escribe tu nombre"
                  className="italic"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              size="lg"
              disabled={loading || !validateForm()}
              className="min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar formulario
                </>
              )}
            </Button>
          </div>

          {/* Validation Warning */}
          {!validateForm() && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm text-amber-800">
                Completa todos los campos requeridos para enviar el formulario
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Form;