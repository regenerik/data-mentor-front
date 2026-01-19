import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// --- Interfaces ---
interface RankingItem { id: string; label: string; }

interface FormState {
    // SECCIÓN 1
    provinciaLocalidad: string; apies: string; tipoEstacion: string; empleadosTotal: string;
    playaPersonal: string; tiendaPersonal: string; boxesPersonal: string;
    aniosOperacion: string; capacitacionesAnio: string; soloAprendizaje: string; detalleOtrasCap: string;
    gestorAsociado: string;

    // SECCIÓN 2
    nivelSeguridad: string; preparacionEmergencia: string; mejorasSeguridad: string[];
    nivelBromatologia: string; mejorasBromatologia: string[];
    frecuenciaAccidentes: string; situacionesAccidentes: string[];
    otroSeguridadPlaya: string;
    otroSeguridadTienda: string;
    otroSeguridadBoxes: string;
    otroBromatologia: string;
    otroAccidentes: string;

    // SECCIÓN 3
    nivelPilares: string; efectividadComunicacion: string; actitudEmpatica: string;
    autonomiaReclamos: string; adaptacionEstilo: string; aspectosAtencion: string[];
    otroAspectosAtencion: string;

    // SECCIÓN 4
    conocePlaya: string; conoceTienda: string; conoceBoxes: string; conoceDigital: string;
    rankingTemas: RankingItem[];

    // SECCIÓN 5
    dominioGestion: string; capacidadAnalisis: string; usoHerramientasDig: string;
    rankingDesafios: RankingItem[];

    // SECCIÓN 6
    liderazgoEfectivo: string; frecuenciaFeedback: string; habilidadesOrg: string;
    estiloLiderazgo: string; rankingFortalecerLider: RankingItem[];
    interesCapacitacion: string; temasPrioritarios: string[]; sugerenciasFinales: string;
    otroTemaPrioritario: string;
}

// --- Componente de Item Arrastrable ---
const SortableItem = ({ id, label, index, total }: { id: string; label: string; index: number; total: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    return (
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
            className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-lg border border-slate-700 mb-2">
            <button {...attributes} {...listeners} className="cursor-grab text-slate-500"><GripVertical size={18} /></button>
            <div className="flex-1 text-sm text-slate-200">{label}</div>
            <div className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
                Puntos: {total - index}
            </div>
        </div>
    );
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

export default function EditarCuestionario() {

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();



    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { toast } = useToast();
    const [form, setForm] = useState<FormState>({
        provinciaLocalidad: "", apies: "", tipoEstacion: "", empleadosTotal: "",
        playaPersonal: "", tiendaPersonal: "", boxesPersonal: "",
        aniosOperacion: "", capacitacionesAnio: "", soloAprendizaje: "", detalleOtrasCap: "",
        nivelSeguridad: "3", preparacionEmergencia: "3", mejorasSeguridad: [],
        gestorAsociado: "",
        otroSeguridadPlaya: "",
        otroSeguridadTienda: "",
        otroSeguridadBoxes: "",
        otroBromatologia: "",
        otroAccidentes: "",
        nivelBromatologia: "3", mejorasBromatologia: [], frecuenciaAccidentes: "",
        situacionesAccidentes: [], nivelPilares: "3", efectividadComunicacion: "3",
        actitudEmpatica: "3", autonomiaReclamos: "3", adaptacionEstilo: "3", aspectosAtencion: [], otroAspectosAtencion: "",
        conocePlaya: "3", conoceTienda: "3", conoceBoxes: "3", conoceDigital: "3",
        rankingTemas: [
            { id: "t1", label: "Productos y promociones en Playa" },
            { id: "t2", label: "Productos y promociones en Tienda" },
            { id: "t3", label: "Servicios y asesoramiento en Boxes" },
            { id: "t4", label: "CDS Playa" }, { id: "t5", label: "CDS Tienda" },
            { id: "t6", label: "CDS Boxes" }, { id: "t7", label: "App YPF / Serviclub / YPF Ruta" }
        ],
        dominioGestion: "3", capacidadAnalisis: "3", usoHerramientasDig: "3",
        rankingDesafios: [
            { id: "d1", label: "Organización del personal" }, { id: "d2", label: "Control operativo" },
            { id: "d3", label: "Comunicación interna" }, { id: "d4", label: "Reputación digital" }
        ],
        liderazgoEfectivo: "3", frecuenciaFeedback: "", habilidadesOrg: "3", estiloLiderazgo: "",
        rankingFortalecerLider: [
            { id: "l1", label: "Comunicación y escucha" }, { id: "l2", label: "Motivación y reconocimiento" },
            { id: "l3", label: "Organización del trabajo" }, { id: "l4", label: "Gestión del Tiempo" },
            { id: "l5", label: "Seguimiento de resultados" }, { id: "l6", label: "Desarrollo del equipo" }
        ],
        interesCapacitacion: "3", temasPrioritarios: [], otroTemaPrioritario: "", sugerenciasFinales: ""
    });

    useEffect(() => {
        if (!id) return;

        const fetchDiagnostico = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    `https://dm-back-fn4l.onrender.com/diagnostico/${id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: "1803-1989-1803-1989",
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("Error obteniendo diagnóstico");
                }

                const data = await res.json();

                // 🔥 Mapeo directo backend → estado local
                setForm({
                    provinciaLocalidad: data.provincia_localidad ?? "",
                    apies: data.apies ?? "",
                    tipoEstacion: data.tipo_estacion ?? "",
                    empleadosTotal: data.empleados_total ?? "",

                    playaPersonal: data.playa_personal ?? "",
                    tiendaPersonal: data.tienda_personal ?? "",
                    boxesPersonal: data.boxes_personal ?? "",

                    aniosOperacion: data.anios_operacion ?? "",
                    capacitacionesAnio: data.capacitaciones_anio ?? "",
                    soloAprendizaje: data.solo_aprendizaje ?? "",
                    detalleOtrasCap: data.detalle_otras_cap ?? "",
                    gestorAsociado: data.gestor_asociado ?? "",

                    nivelSeguridad: data.nivel_seguridad ?? "3",
                    preparacionEmergencia: data.preparacion_emergencia ?? "3",
                    mejorasSeguridad: data.mejoras_seguridad ?? [],

                    nivelBromatologia: data.nivel_bromatologia ?? "3",
                    mejorasBromatologia: data.mejoras_bromatologia ?? [],

                    frecuenciaAccidentes: data.frecuencia_accidentes ?? "",
                    situacionesAccidentes: data.situaciones_accidentes ?? [],

                    otroSeguridadPlaya: data.otro_seguridad_playa ?? "",
                    otroSeguridadTienda: data.otro_seguridad_tienda ?? "",
                    otroSeguridadBoxes: data.otro_seguridad_boxes ?? "",
                    otroBromatologia: data.otro_bromatologia ?? "",
                    otroAccidentes: data.otro_accidentes ?? "",

                    nivelPilares: data.nivel_pilares ?? "3",
                    efectividadComunicacion: data.efectividad_comunicacion ?? "3",
                    actitudEmpatica: data.actitud_empatica ?? "3",
                    autonomiaReclamos: data.autonomia_reclamos ?? "3",
                    adaptacionEstilo: data.adaptacion_estilo ?? "3",

                    aspectosAtencion: data.aspectos_atencion ?? [],
                    otroAspectosAtencion: data.otro_aspectos_atencion ?? "",

                    conocePlaya: data.conoce_playa ?? "3",
                    conoceTienda: data.conoce_tienda ?? "3",
                    conoceBoxes: data.conoce_boxes ?? "3",
                    conoceDigital: data.conoce_digital ?? "3",

                    rankingTemas: data.ranking_temas ?? [],
                    dominioGestion: data.dominio_gestion ?? "3",
                    capacidadAnalisis: data.capacidad_analisis ?? "3",
                    usoHerramientasDig: data.uso_herramientas_dig ?? "3",

                    rankingDesafios: data.ranking_desafios ?? [],

                    liderazgoEfectivo: data.liderazgo_efectivo ?? "3",
                    frecuenciaFeedback: data.frecuencia_feedback ?? "",
                    habilidadesOrg: data.habilidades_org ?? "3",
                    estiloLiderazgo: data.estilo_liderazgo ?? "",

                    rankingFortalecerLider: data.ranking_fortalecer_lider ?? [],

                    interesCapacitacion: data.interes_capacitacion ?? "3",
                    temasPrioritarios: data.temas_prioritarios ?? [],
                    otroTemaPrioritario: data.otro_tema_prioritario ?? "",
                    sugerenciasFinales: data.sugerencias_finales ?? "",
                });
            } catch (err) {
                toast({
                    title: "Error",
                    description: "No se pudo cargar el diagnóstico.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDiagnostico();
    }, [id]);



    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const handleInp = (f: keyof FormState, v: any) => setForm(prev => ({ ...prev, [f]: v }));
    const handleChk = (listF: keyof FormState, v: string) => {
        const list = form[listF] as string[];
        handleInp(listF, list.includes(v) ? list.filter(i => i !== v) : [...list, v]);
    };

    const handleDnd = (e: DragEndEvent, f: keyof FormState) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
            const list = form[f] as RankingItem[];
            const oldI = list.findIndex(i => i.id === active.id);
            const newI = list.findIndex(i => i.id === over.id);
            handleInp(f, arrayMove(list, oldI, newI));
        }
    };

    const buildPayload = () => ({
        provincia_localidad: form.provinciaLocalidad,
        apies: form.apies,
        tipo_estacion: form.tipoEstacion,
        empleados_total: form.empleadosTotal,

        playa_personal: form.playaPersonal,
        tienda_personal: form.tiendaPersonal,
        boxes_personal: form.boxesPersonal,

        anios_operacion: form.aniosOperacion,
        capacitaciones_anio: form.capacitacionesAnio,
        solo_aprendizaje: form.soloAprendizaje,
        detalle_otras_cap: form.detalleOtrasCap,
        gestor_asociado: form.gestorAsociado,

        nivel_seguridad: form.nivelSeguridad,
        preparacion_emergencia: form.preparacionEmergencia,
        mejoras_seguridad: form.mejorasSeguridad,

        nivel_bromatologia: form.nivelBromatologia,
        mejoras_bromatologia: form.mejorasBromatologia,

        frecuencia_accidentes: form.frecuenciaAccidentes,
        situaciones_accidentes: form.situacionesAccidentes,

        otro_seguridad_playa: form.otroSeguridadPlaya,
        otro_seguridad_tienda: form.otroSeguridadTienda,
        otro_seguridad_boxes: form.otroSeguridadBoxes,
        otro_bromatologia: form.otroBromatologia,
        otro_accidentes: form.otroAccidentes,

        nivel_pilares: form.nivelPilares,
        efectividad_comunicacion: form.efectividadComunicacion,
        actitud_empatica: form.actitudEmpatica,
        autonomia_reclamos: form.autonomiaReclamos,
        adaptacion_estilo: form.adaptacionEstilo,

        aspectos_atencion: form.aspectosAtencion,
        otro_aspectos_atencion: form.otroAspectosAtencion,

        conoce_playa: form.conocePlaya,
        conoce_tienda: form.conoceTienda,
        conoce_boxes: form.conoceBoxes,
        conoce_digital: form.conoceDigital,

        ranking_temas: form.rankingTemas,
        dominio_gestion: form.dominioGestion,
        capacidad_analisis: form.capacidadAnalisis,
        uso_herramientas_dig: form.usoHerramientasDig,

        ranking_desafios: form.rankingDesafios,

        liderazgo_efectivo: form.liderazgoEfectivo,
        frecuencia_feedback: form.frecuenciaFeedback,
        habilidades_org: form.habilidadesOrg,
        estilo_liderazgo: form.estiloLiderazgo,

        ranking_fortalecer_lider: form.rankingFortalecerLider,

        interes_capacitacion: form.interesCapacitacion,
        temas_prioritarios: form.temasPrioritarios,
        otro_tema_prioritario: form.otroTemaPrioritario,
        sugerencias_finales: form.sugerenciasFinales,
    });

    const handleUpdate = async () => {
        try {
            if (!id) return;

            setLoading(true);

            const payload = buildPayload();

            const res = await fetch(
                `https://dm-back-fn4l.onrender.com/diagnostico/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: "1803-1989-1803-1989",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                throw new Error("Error actualizando diagnóstico");
            }

            toast({
                title: "Cambios guardados",
                description: "El diagnóstico fue actualizado correctamente.",
            });

            setTimeout(() => {
                navigate(-1);
            }, 1200);

        } catch (e) {
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = buildPayload();

            const res = await fetch("https://dm-back-fn4l.onrender.com/diagnostico", {
                method: "POST",
                headers: {
                    Authorization: "1803-1989-1803-1989",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error("Error enviando diagnóstico");
            }

            toast({
                title: "Formulario enviado",
                description:
                    "El formulario se envió correctamente. Ya podés cerrar esta ventana. El gestor asociado entrará en contacto.",
            });

            setShowSuccess(true);
        } catch (e) {
            toast({
                title: "Error",
                description: "No se pudo enviar el diagnóstico. Intentá nuevamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const Likert = ({ label, field }: { label: React.ReactNode, field: keyof FormState }) => (
        <div className="py-4 border-b border-slate-800 last:border-0">
            <div className="text-slate-300 block mb-4">
                {label}
            </div>

            <RadioGroup
                value={form[field] as string}
                onValueChange={v => handleInp(field, v)}
                className="flex justify-between max-w-md"
            >
                {[1, 2, 3, 4, 5].map(v => (
                    <div key={v} className="flex flex-col items-center gap-2">
                        <RadioGroupItem
                            value={String(v)}
                            id={`${field}-${v}`}
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()}
                            className="border-slate-500 text-blue-500"
                        />
                        <Label htmlFor={`${field}-${v}`} className="text-xs text-slate-500">{v}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-10">
            <div className="max-w-5xl mx-auto space-y-10">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-blue-400">Diagnóstico de Necesidades de Capacitación</h1>
                    <p className="text-slate-400">Operadores / Mandos medios de EESS</p>
                </div>

                {/* SECCIÓN 1: DATOS GENERALES */}
                <Card className="bg-[#1e293b] border-slate-700">
                    <CardHeader><CardTitle className="text-blue-400">📋 SECCIÓN 1. DATOS GENERALES</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* NUEVO CAMPO: GESTOR ASOCIADO */}
                            <div className="space-y-2 md:col-span-2">
                                <Label>Gestor Asociado: ( quien te envió el link de esta encuesta )</Label>
                                <Select onValueChange={v => handleInp("gestorAsociado", v)}>
                                    <SelectTrigger className="bg-[#0f172a] border-slate-700">
                                        <SelectValue placeholder="Seleccione su gestor" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] text-white">
                                        {Object.keys(gestoresEmail).map((nombre) => (
                                            <SelectItem key={nombre} value={nombre}>
                                                {nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Provincia y localidad</Label>
                                <Input className="bg-[#0f172a] border-slate-700" onChange={e => handleInp("provinciaLocalidad", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>APIES</Label>
                                <Input className="bg-[#0f172a] border-slate-700" onChange={e => handleInp("apies", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de estación </Label>
                                <Select onValueChange={v => handleInp("tipoEstacion", v)}>
                                    <SelectTrigger className="bg-[#0f172a] border-slate-700"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] text-white">
                                        <SelectItem value="Abanderada">Abanderada</SelectItem>
                                        <SelectItem value="ACA">ACA</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cantidad total de empleados</Label>
                                <Input type="number" className="bg-[#0f172a] border-slate-700" onChange={e => handleInp("empleadosTotal", e.target.value)} />
                            </div>
                        </div>

                        <br />
                        <Label>Distribución aproximada del personal:</Label>
                        <div className="grid grid-cols-3 gap-4 p-4 bg-[#0f172a] rounded-lg border border-slate-700">
                            {["Playa", "Tienda", "Boxes"].map((s, i) => (
                                <div key={i} className="space-y-1">
                                    <Label className="text-xs text-slate-400">{s}</Label>
                                    <Input type="number" className="bg-[#1e293b] border-slate-600 h-8" onChange={e => handleInp(`${s.toLowerCase()}Personal` as any, e.target.value)} />
                                </div>
                            ))}
                        </div>

                        <Separator className="bg-slate-700" />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Cantidad de años de operación de la estación</Label>
                                <Select onValueChange={v => handleInp("aniosOperacion", v)}>
                                    <SelectTrigger className="bg-[#0f172a] border-slate-700"><SelectValue placeholder="Seleccionar años" /></SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] text-white">
                                        <SelectItem value="Menos de 2">Menos de 2</SelectItem>
                                        <SelectItem value="2 a 5">2 a 5</SelectItem>
                                        <SelectItem value="6 a 10">6 a 10</SelectItem>
                                        <SelectItem value="Más de 10">Más de 10 años</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Capacitaciones realizadas en el último año</Label>
                                <Select onValueChange={v => handleInp("capacitacionesAnio", v)}>
                                    <SelectTrigger className="bg-[#0f172a] border-slate-700"><SelectValue placeholder="Seleccionar cantidad" /></SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] text-white">
                                        <SelectItem value="Ninguna">Ninguna</SelectItem>
                                        <SelectItem value="1 o 2">1 o 2</SelectItem>
                                        <SelectItem value="3 a 5">3 a 5</SelectItem>
                                        <SelectItem value="Más de 5">Más de 5</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>¿Todas las capacitaciones realizadas en la estación se llevaron a cabo con Aprendizaje Comercial?</Label>
                            <RadioGroup onValueChange={v => handleInp("soloAprendizaje", v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Sí" id="cap-si" />
                                    <Label htmlFor="cap-si">Sí</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="No" id="cap-no" />
                                    <Label htmlFor="cap-no">No</Label>
                                </div>
                            </RadioGroup>

                            {form.soloAprendizaje === "No" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-xs text-blue-400">Indicá cuáles se realizaron y con qué centros/profesionales:</Label>
                                    <Textarea
                                        className="bg-[#0f172a] border-slate-700 min-h-[100px]"
                                        placeholder="Ej: Curso de liderazgo con Universidad X..."
                                        onChange={e => handleInp("detalleOtrasCap", e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SECCIÓN 2: SEGURIDAD Y CUMPLIMIENTO */}
                <Card className="bg-[#1e293b] border-slate-700">
                    <CardHeader><CardTitle className="text-orange-400">🦺 SECCIÓN 2. SEGURIDAD Y CUMPLIMIENTO</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <Likert
                            label={
                                <>
                                    Conocimiento y aplicación de procedimientos de seguridad.
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿En qué medida el personal de la estación (Playa, Tienda, Boxes) conoce y aplica los procedimientos de seguridad (uso de Elementos de Protección Personal -EPP, manejo de derrames, uso de matafuegos, prevención de incendios, manipulación de equipos eléctricos, etc.)?
                                    </span>
                                </>
                            }
                            field="nivelSeguridad"
                        />

                        <Likert
                            label={
                                <>
                                    Preparación ante emergencias o accidentes
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿Qué tan preparados considerás que están tus colaboradores para actuar ante una emergencia o accidente en la estación?
                                    </span>
                                </>
                            }
                            field="preparacionEmergencia"
                        />

                        {/* --- COMIENZO DEL BLOQUE NUEVO DE SECTORES --- */}
                        <div className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300">Oportunidades de mejora (Múltiple):</Label>
                                <span className="block text-xs text-slate-400 font-normal leading-relaxed">
                                    Seleccioná los aspectos de seguridad en la Operación de Playa, Tienda y Boxes donde tu equipo presenta mayores oportunidades de mejora. Podés marcar más de una opción.
                                </span>
                            </div>

                            {/* Generales */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Generales de la Estación</Label>
                                <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                    {["Uso del uniforme completo", "Procedimientos ante emergencias (Plan de emergencia y roles)", "Seguridad eléctrica (Equipos, corte de energía, evacuación)", "Disposición de residuos peligrosos"].map((opt) => (
                                        <div key={opt} className="flex items-start gap-2">
                                            <Checkbox onCheckedChange={() => handleChk("mejorasSeguridad", opt)} />
                                            <span className="text-xs text-slate-400 leading-tight">{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Playa */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sector Playa</Label>
                                <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                    {[
                                        "Comunicación de riesgos al cliente (Celular, motor apagado, etc.)",
                                        "Mantenimiento preventivo de instalaciones y surtidores",
                                        "Procedimiento de descarga de combustible (EPP, descarga, camión)",
                                        "Procedimiento de carga y despacho (Posición segura, mangueras)",
                                        "Ampliación del servicio (Parabrisas, fluidos, capot)",
                                        "Manipulación y almacenamiento de productos químicos",
                                        "Orden, limpieza y pisos secos en playa"
                                    ].map((opt) => (
                                        <div key={opt} className="flex items-start gap-2">
                                            <Checkbox onCheckedChange={() => handleChk("mejorasSeguridad", opt)} />
                                            <span className="text-xs text-slate-400 leading-tight">{opt}</span>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 mt-2">
                                        <Input
                                            placeholder="Otros playa (especificar)..."
                                            className="h-8 bg-[#1e293b] border-slate-700 text-xs"
                                            onChange={(e) => handleInp("otroSeguridadPlaya", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tienda */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sector Tienda</Label>
                                <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                    {[
                                        "Manipulación segura de equipos (Hornos, cafeteras, freidoras)",
                                        "Higiene y limpieza en cocina y depósito",
                                        "Uso de señalización (Pisos mojados, derrames)",
                                        "Orden en pasillos y góndolas",
                                        "Almacenamiento de productos químicos de limpieza",
                                        "Uso correcto de EPP (Guantes térmicos, anticorte, calzado)",
                                        "Prohibición de uso de cuchillos para descongelar",
                                        "Prohibición de accesorios personales (Anillos, pulseras)",
                                        "Procedimientos ante accidentes (Cortes, quemaduras)"
                                    ].map((opt) => (
                                        <div key={opt} className="flex items-start gap-2">
                                            <Checkbox onCheckedChange={() => handleChk("mejorasSeguridad", opt)} />
                                            <span className="text-xs text-slate-400 leading-tight">{opt}</span>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 mt-2">
                                        <Input
                                            placeholder="Otros tienda (especificar)..."
                                            className="h-8 bg-[#1e293b] border-slate-700 text-xs"
                                            onChange={(e) => handleInp("otroSeguridadTienda", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Boxes */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sector Boxes</Label>
                                <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                    {[
                                        "Mantenimiento y orden de equipos (Elevador, compresor)",
                                        "Guía segura y posicionamiento del vehículo",
                                        "Operación segura del elevador (Cuñas, trabas, motor)",
                                        "Apertura segura de radiador y lubricación",
                                        "Uso de EPP en tareas del sector",
                                        "Recepción, almacenamiento y manejo seguro de productos"
                                    ].map((opt) => (
                                        <div key={opt} className="flex items-start gap-2">
                                            <Checkbox onCheckedChange={() => handleChk("mejorasSeguridad", opt)} />
                                            <span className="text-xs text-slate-400 leading-tight">{opt}</span>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 mt-2">
                                        <Input
                                            placeholder="Otros boxes (especificar)..."
                                            className="h-8 bg-[#1e293b] border-slate-700 text-xs"
                                            onChange={(e) => handleInp("otroSeguridadBoxes", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* --- FIN DEL BLOQUE NUEVO --- */}

                        <Separator className="bg-slate-700 my-8" />

                        {/* --- BROMATOLOGÍA --- */}
                        <Likert
                            label={
                                <>
                                    Protocolos de bromatología y seguridad alimentaria
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿En qué nivel el equipo de Tienda conoce y cumple los protocolos (conservación, control de vencimientos, limpieza, etc.)?
                                    </span>
                                </>
                            }
                            field="nivelBromatologia"
                        />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300">Oportunidades de mejora en Bromatología (Múltiple):</Label>
                                <span className="block text-xs text-slate-400 font-normal leading-relaxed">
                                    Marcá los aspectos donde tu equipo presenta mayores oportunidades de mejora en la Tienda.
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                {[
                                    "Contaminación de alimentos", "Lavado de manos", "Uso adecuado del uniforme",
                                    "Manipulación durante preparación y elaboración", "Manejo de residuos",
                                    "Limpieza general y zonas de manipulación", "Control de temperatura y conservación",
                                    "Mantenimiento de la cadena de frío", "Control de fechas de vencimiento",
                                    "Almacenamiento de productos", "Orden y rotación de stock"
                                ].map((opt) => (
                                    <div key={opt} className="flex items-start gap-2">
                                        <Checkbox onCheckedChange={() => handleChk("mejorasBromatologia", opt)} />
                                        <span className="text-xs text-slate-400 leading-tight">{opt}</span>
                                    </div>
                                ))}
                                <div className="md:col-span-2 mt-2">
                                    <Input
                                        placeholder="Otros bromatología (especificar)..."
                                        className="h-8 bg-[#1e293b] border-slate-700 text-xs"
                                        onChange={(e) => handleInp("otroBromatologia", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-700 my-8" />

                        {/* --- ACCIDENTES --- */}
                        <div className="space-y-4">
                            <Label className="text-slate-300 block">Frecuencia de accidentes o incidentes registrados:</Label>
                            <RadioGroup onValueChange={v => handleInp("frecuenciaAccidentes", v)} className="flex gap-6 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                {["Nunca", "Ocasionalmente", "Frecuentemente"].map(op => (
                                    <div key={op} className="flex items-center space-x-2">
                                        <RadioGroupItem value={op} id={`freq-${op}`} />
                                        <Label htmlFor={`freq-${op}`} className="text-sm cursor-pointer">{op}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300">Situaciones de accidentes o incidentes (Múltiple):</Label>
                                <span className="block text-xs text-slate-400 font-normal leading-relaxed">
                                    ¿En qué tareas suelen ocurrir estos eventos en la estación?
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                {[
                                    "Al destrabar o cerrar un capot", "Durante la descarga de combustible",
                                    "Al despachar combustible en playa", "Al manipular equipos o utensilios de cocina",
                                    "Al manipular productos o reponer mercadería", "Al limpiar pisos o superficies",
                                    "Al trasladar objetos pesados", "Por resbalones o caídas",
                                    "Por cortes o pinchazos", "Por quemaduras", "Por contacto con productos químicos",
                                    "En Boxes o área de lubricación", "En el estacionamiento o zona de tránsito"
                                ].map((opt) => (
                                    <div key={opt} className="flex items-start gap-2">
                                        <Checkbox onCheckedChange={() => handleChk("situacionesAccidentes", opt)} />
                                        <span className="text-xs text-slate-400 leading-tight">{opt}</span>
                                    </div>
                                ))}
                                <div className="md:col-span-2 mt-2">
                                    <Input
                                        placeholder="Otras situaciones (especificar)..."
                                        className="h-8 bg-[#1e293b] border-slate-700 text-xs"
                                        onChange={(e) => handleInp("otroAccidentes", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                    </CardContent>

                </Card>

                {/* SECCIÓN 3: EXPERIENCIA DEL CLIENTE Y COMUNICACIÓN */}
                <Card className="bg-[#1e293b] border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-blue-400">🤝 SECCIÓN 3. EXPERIENCIA DEL CLIENTE Y COMUNICACIÓN</CardTitle>
                        <CardDescription className="text-slate-400">
                            Evaluación de habilidades de servicio, empatía y adaptación al cliente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <Likert
                            label={
                                <>
                                    Alineación con los Pilares de la Experiencia
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿En qué medida brindan atención Ágil, Cercana, Simple e Innovadora?
                                    </span>
                                </>
                            }
                            field="nivelPilares"
                        />

                        <Likert
                            label={
                                <>
                                    Efectividad de la comunicación
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿Cómo evaluás la escucha activa, el tono, el lenguaje corporal y la claridad con el cliente?
                                    </span>
                                </>
                            }
                            field="efectividadComunicacion"
                        />

                        <Likert
                            label={
                                <>
                                    Actitud empática y positiva
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿Mantienen la calma y empatía incluso frente a clientes difíciles o reclamos?
                                    </span>
                                </>
                            }
                            field="actitudEmpatica"
                        />

                        <Likert
                            label={
                                <>
                                    Autonomía en resolución de conflictos
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿Cuentan con herramientas para resolver reclamos de manera autónoma?
                                    </span>
                                </>
                            }
                            field="autonomiaReclamos"
                        />

                        <Likert
                            label={
                                <>
                                    Adaptación al estilo del cliente
                                    <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                        ¿Adaptan su comunicación según el perfil del cliente (impaciente, sociable, estructurado, etc.)?
                                    </span>
                                </>
                            }
                            field="adaptacionEstilo"
                        />

                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300">Aspectos presentes en la atención (Múltiple):</Label>
                                <span className="block text-xs text-slate-400 font-normal leading-relaxed">
                                    Marcá qué aspectos considerás que se reflejan hoy en el trato con el cliente.
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                {[
                                    "Amabilidad y cercanía con el cliente",
                                    "Rapidez y agilidad en el servicio",
                                    "Buen conocimiento de los productos y servicios",
                                    "Capacidad para resolver problemas o reclamos",
                                    "Buena presentación personal y limpieza",
                                    "Trabajo en equipo y colaboración",
                                    "Comunicación clara entre miembros del equipo"
                                ].map((opt) => (
                                    <div key={opt} className="flex items-start gap-2">
                                        <Checkbox onCheckedChange={() => handleChk("aspectosAtencion", opt)} />
                                        <span className="text-xs text-slate-400 leading-tight">{opt}</span>
                                    </div>
                                ))}
                                <div className="md:col-span-2 mt-2">
                                    <Input
                                        placeholder="Otros aspectos (especificar)..."
                                        className="h-8 bg-[#1e293b] border-slate-700 text-xs"
                                        onChange={(e) => handleInp("otroAspectosAtencion", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SECCIÓN 4: CONOCIMIENTO Y RANKING */}
                <Card className="bg-[#1e293b] border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-blue-400">🧠 SECCIÓN 4. CONOCIMIENTO Y RANKING</CardTitle>
                        <CardDescription className="text-slate-400">
                            Evaluación del dominio técnico y prioridades de capacitación.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {/* Preguntas de Conocimiento */}
                        <div className="space-y-2">
                            <Likert
                                label={
                                    <>
                                        Conocimiento de productos en Playa
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿Qué tan sólido es el conocimiento sobre tipos de combustibles, lubricantes y aditivos?
                                        </span>
                                    </>
                                }
                                field="conocePlaya"
                            />

                            <Likert
                                label={
                                    <>
                                        Dominio de información en Tienda
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿En qué medida el personal domina la información sobre productos, combos, promociones y stock?
                                        </span>
                                    </>
                                }
                                field="conoceTienda"
                            />

                            <Likert
                                label={
                                    <>
                                        Asesoramiento en Boxes
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿Qué tan preparados están los Lubriexpertos para asesorar correctamente sobre productos y servicios?
                                        </span>
                                    </>
                                }
                                field="conoceBoxes"
                            />

                            <Likert
                                label={
                                    <>
                                        Promoción de Herramientas Digitales
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿El equipo conoce y promueve activamente App YPF, Serviclub e YPF Ruta?
                                        </span>
                                    </>
                                }
                                field="conoceDigital"
                            />
                        </div>

                        <Separator className="bg-slate-700" />

                        {/* Sección de Ranking */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300 text-base">Prioridades de fortalecimiento</Label>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Ordená de mayor a menor relevancia por puntos los temas que considerás más importantes para seguir fortaleciendo en tu equipo:
                                </p>
                                <span className="text-[10px] text-slate-500 uppercase font-bold italic">
                                    (Arrastrá los elementos para cambiar el orden. A mayor puntaje es más relevante.)
                                </span>
                            </div>

                            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDnd(e, "rankingTemas")}>
                                    <SortableContext items={form.rankingTemas.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                        {form.rankingTemas.map((item, index) => (
                                            <SortableItem
                                                key={item.id}
                                                id={item.id}
                                                label={item.label}
                                                index={index}
                                                total={form.rankingTemas.length}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* SECCIÓN 5: GESTIÓN DE LA EESS Y REPUTACIÓN DIGITAL */}
                <Card className="bg-[#1e293b] border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-blue-400">📊 SECCIÓN 5. GESTIÓN DE LA EESS Y REPUTACIÓN DIGITAL</CardTitle>
                        <CardDescription className="text-slate-400">
                            Evaluación de procesos administrativos, análisis de datos y presencia digital.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {/* Preguntas de Gestión */}
                        <div className="space-y-2">
                            <Likert
                                label={
                                    <>
                                        Dominio de gestión operativa y administrativa
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿En qué medida los responsables dominan cierres, turnos, control de stock y reportes?
                                        </span>
                                    </>
                                }
                                field="dominioGestion"
                            />

                            <Likert
                                label={
                                    <>
                                        Capacidad de análisis de indicadores
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿Qué tan desarrollada está la capacidad para analizar ventas, tickets y rotación para tomar decisiones?
                                        </span>
                                    </>
                                }
                                field="capacidadAnalisis"
                            />

                            <Likert
                                label={
                                    <>
                                        Uso de herramientas digitales y reputación
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿Se aprovechan herramientas como Google Mi Negocio y redes sociales para la visibilidad de la estación?
                                        </span>
                                    </>
                                }
                                field="usoHerramientasDig"
                            />
                        </div>

                        <Separator className="bg-slate-700" />

                        {/* Sección de Ranking de Desafíos */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300 text-base">Desafíos de la gestión diaria</Label>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Ordená del 1 al 4 los aspectos que considerás más desafiantes en el día a día:
                                </p>
                                <span className="text-[10px] text-slate-500 uppercase font-bold italic">
                                    (Arrastrá para priorizar. Cuanto más puntos tiene, más prioritario es.)
                                </span>
                            </div>

                            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDnd(e, "rankingDesafios")}>
                                    <SortableContext items={form.rankingDesafios.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                        {form.rankingDesafios.map((item, index) => (
                                            <SortableItem
                                                key={item.id}
                                                id={item.id}
                                                label={item.label}
                                                index={index}
                                                total={form.rankingDesafios.length}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* SECCIÓN 6: LIDERAZGO Y GESTIÓN DE EQUIPOS */}
                <Card className="bg-[#1e293b] border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-blue-400">👥 SECCIÓN 6. LIDERAZGO Y GESTIÓN DE EQUIPOS</CardTitle>
                        <CardDescription className="text-slate-400">
                            Evaluación del estilo de mando, desarrollo del equipo y necesidades futuras.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {/* Preguntas de Escala y Selección Única */}
                        <div className="space-y-6">
                            <Likert
                                label={
                                    <>
                                        Liderazgo efectivo
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿En qué medida los mandos medios ejercen un liderazgo basado en acompañamiento y ejemplo?
                                        </span>
                                    </>
                                }
                                field="liderazgoEfectivo"
                            />

                            <div className="space-y-3">
                                <Label className="text-slate-300 block">Frecuencia de feedback y reconocimiento:</Label>
                                <RadioGroup onValueChange={v => handleInp("frecuenciaFeedback", v)} className="flex flex-wrap gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                    {["Nunca", "A veces", "Frecuentemente", "Siempre"].map(op => (
                                        <div key={op} className="flex items-center space-x-2">
                                            <RadioGroupItem value={op} id={`feed-${op}`} />
                                            <Label htmlFor={`feed-${op}`} className="text-sm cursor-pointer">{op}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <Likert
                                label={
                                    <>
                                        Habilidades de organización
                                        <span className="block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                                            ¿Qué tan sólidas son las habilidades para organizar turnos, delegar y resolver conflictos?
                                        </span>
                                    </>
                                }
                                field="habilidadesOrg"
                            />

                            <div className="space-y-3">
                                <Label className="text-slate-300 block">Estilo de liderazgo predominante:</Label>
                                <RadioGroup onValueChange={v => handleInp("estiloLiderazgo", v)} className="grid grid-cols-2 gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                    {["Controlador", "Participativo", "Delegativo", "Inspirador / Coach"].map(estilo => (
                                        <div key={estilo} className="flex items-center space-x-2">
                                            <RadioGroupItem value={estilo} id={`estilo-${estilo}`} />
                                            <Label htmlFor={`estilo-${estilo}`} className="text-sm cursor-pointer">{estilo}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>

                        <Separator className="bg-slate-700" />

                        {/* Ranking de Fortalecimiento de Liderazgo */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-blue-300 text-base">Prioridades de Liderazgo</Label>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Ordená de mayor a menor importancia por puntos según los aspectos que más necesitás fortalecer en tu rol. (+puntos = +importancia) :
                                </p>
                            </div>
                            <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDnd(e, "rankingFortalecerLider")}>
                                    <SortableContext items={form.rankingFortalecerLider.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                        {form.rankingFortalecerLider.map((item, index) => (
                                            <SortableItem key={item.id} id={item.id} label={item.label} index={index} total={form.rankingFortalecerLider.length} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                        <Separator className="bg-slate-700" />

                        {/* Futura Capacitación */}
                        <div className="space-y-6">
                            <Likert
                                label="¿Qué nivel de interés considerás que tiene tu equipo en seguir capacitándose?"
                                field="interesCapacitacion"
                            />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-blue-300">Temas prioritarios para formación (Múltiple):</Label>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
                                    {["Neuroventas", "Coaching y liderazgo", "Comunicación efectiva", "Negociación", "Gestión de equipos"].map((opt) => (
                                        <div key={opt} className="flex items-start gap-2">
                                            <Checkbox onCheckedChange={() => handleChk("temasPrioritarios", opt)} />
                                            <span className="text-xs text-slate-400">{opt}</span>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 mt-2">
                                        <Input
                                            placeholder="Otros temas (especificar)..."
                                            className="h-8 bg-[#1e293b] border-slate-700 text-xs"
                                            onChange={(e) => handleInp("otroTemaPrioritario", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-slate-300">Comentarios o sugerencias finales:</Label>
                                <Textarea
                                    placeholder="Escribí aquí tus sugerencias sobre formación o desarrollo..."
                                    className="bg-[#0f172a] border-slate-700 min-h-[100px]"
                                    onChange={(e) => handleInp("sugerenciasFinales", e.target.value)}
                                />
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* BOTÓN ENVÍO */}
                <div className="flex flex-col items-center gap-4">
                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full md:w-80 h-14 bg-blue-600 hover:bg-blue-500 text-lg font-bold"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Enviando...
                            </>
                        ) : (
                            "Confirmar edición de diagnóstico"
                        )}
                    </Button>
                </div>
            </div>

            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                    <DialogHeader className="items-center"><CheckCircle2 className="h-12 w-12 text-green-500 mb-2" /><DialogTitle>¡Diagnóstico Enviado!</DialogTitle></DialogHeader>
                    <p className="text-center text-slate-400">Gracias por completar el diagnóstico. Los datos se han guardado correctamente.</p>
                    <DialogFooter><Button className="w-full" onClick={() => setShowSuccess(false)}>Aceptar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}