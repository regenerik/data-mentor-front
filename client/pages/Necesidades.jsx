import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
// Importamos Check para el tilde de copiado
import { Loader2, Copy, Check } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

/**
 * Formulario de Diagnóstico de Necesidades de Aprendizaje – YPF
 * VERSIÓN FINAL DEFINITIVA (EMAIL UNIFICADO)
 *
 * - Un único input: Email del gestor
 * - Se recupera desde localStorage si existe
 * - Si el email corresponde a un gestor → autocompleta nombre
 * - Si NO corresponde → permite escribir nombre manual
 * - Payload limpio, sin campos redundantes
 */

const provinciasArgentina = [
    "Buenos Aires",
    "Ciudad Autónoma de Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán",
];

const gestoresEmail = {
    "Jose L. Gallucci": "jose.l.gallucci@ypf.com",
    "Mauricio Cuevas": "mauricio.cuevas@ypf.com",
    "John Martinez": "john.martinez@ypf.com",
    "Georgina M. Cutili": "georgina.m.cutili@ypf.com",
    "Octavio Torres": "octavio.torres@ypf.com",
    "Fernanda M. Rodriguez": "fernanda.m.rodriguez@ypf.com",
    "Pablo J. Raggio": "pablo.j.raggio@ypf.com",
    "Noelia Otarula": "noelia.otarula@ypf.com",
    "Dante Merluccio": "dante.merluccio@ypf.com",
    "Flavia Camuzzi": "flavia.camuzzi@ypf.com",
};

const Necesidades = () => {
    const [gestorBloqueado, setGestorBloqueado] = useState(false);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [resultadoIA, setResultadoIA] = useState("");
    // NUEVO ESTADO: Para el indicador visual de copiado
    const [copied, setCopied] = useState(false);
    const [data, setData] = useState({
        provincia: "",
        localidad: "",
        apies: "",
        empleadosTotal: "",
        emailGestor: "",
        gestor: "",
        experienciaCliente: "",
        liderazgo: "",
        comentarios: "",
        seguridadOperativa: {
            general: { score: "", comentario: "" },
            epp: { score: "", comentario: "" },
            emergencias: { score: "", comentario: "" },
            manipulacion: { score: "", comentario: "" },
        },
    });

    // Recuperar email desde localStorage
    useEffect(() => {
        const emailLS = localStorage.getItem("email");
        if (emailLS) {
            setData(prev => ({ ...prev, emailGestor: emailLS }));
        }
    }, []);

    // Mapear email → gestor si corresponde
    useEffect(() => {
        if (!data.emailGestor) return;

        const match = Object.entries(gestoresEmail)
            .find(([_, email]) => email === data.emailGestor);

        if (match) {
            const [nombre] = match;
            setData(prev => ({ ...prev, gestor: nombre }));
            setGestorBloqueado(true);
        } else {
            setGestorBloqueado(false);
        }
    }, [data.emailGestor]);

    const handleChange = (path, value) => {
        setData(prev => {
            const newData = { ...prev };
            const keys = path.split(".");
            let ref = newData;
            keys.slice(0, -1).forEach(k => (ref[k] = { ...ref[k] }));
            ref = keys.slice(0, -1).reduce((acc, k) => acc[k], newData);
            ref[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    // NUEVA FUNCIÓN: Manejar el copiado y el estado visual
    const handleCopy = () => {
        navigator.clipboard.writeText(resultadoIA);
        setCopied(true);
        // Restablecer el estado después de 2 segundos
        setTimeout(() => setCopied(false), 2000);
    };

    const Likert = ({ label, value, onChange }) => (
        <div className="space-y-3">
            <Label className="text-sm font-medium">{label}</Label>
            <RadioGroup value={value} onValueChange={onChange} className="flex gap-6">
                {[1, 2, 3, 4, 5].map(v => (
                    <div key={v} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(v)} />
                        <Label className="text-sm">{v}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
    );

    const handleSubmit = async () => {
        const payload = data;

        try {
            setLoading(true);

            const response = await fetch(
                "https://dm-back-fn4l.onrender.com/form_necesidades",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "1803-1989-1803-1989",
                    },
                    body: JSON.stringify(payload),
                }
            );

            const text = await response.text();

            if (!response.ok) {
                throw new Error(text || "Error al enviar el formulario");
            }

            const result = JSON.parse(text);

            setResultadoIA(result.respuesta_ia);
            setOpenModal(true);

        } catch (error) {
            console.error("Error enviando diagnóstico:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [loading]);

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Datos de la Estación</CardTitle>
                        <CardDescription>Información general</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Select
                                value={data.provincia}
                                onValueChange={(v) => handleChange("provincia", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccioná una provincia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {provinciasArgentina.map((prov) => (
                                        <SelectItem key={prov} value={prov}>
                                            {prov}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Input placeholder="Localidad" value={data.localidad} onChange={e => handleChange("localidad", e.target.value)} />
                        <Input placeholder="APIES" value={data.apies} onChange={e => handleChange("apies", e.target.value)} />
                        <Input type="number" placeholder="Cantidad total empleados" value={data.empleadosTotal} onChange={e => handleChange("empleadosTotal", e.target.value)} />

                        <Input
                            placeholder="Email del gestor"
                            value={data.emailGestor}
                            onChange={e => handleChange("emailGestor", e.target.value)}
                            className={localStorage.getItem("email") ? "bg-muted" : ""}
                        />

                        <Input
                            placeholder="Nombre del gestor"
                            value={data.gestor}
                            onChange={e => handleChange("gestor", e.target.value)}
                            readOnly={gestorBloqueado}
                            className={gestorBloqueado ? "bg-muted" : ""}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Seguridad Operativa</CardTitle>
                        <CardDescription>Evaluación detallada</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {[
                            ["general", "Aplicación general de normas de seguridad"],
                            ["epp", "Uso de EPP"],
                            ["emergencias", "Procedimientos de emergencia"],
                            ["manipulacion", "Manipulación de productos"],
                        ].map(([key, label]) => (
                            <div key={key} className="space-y-4">
                                <Likert
                                    label={label}
                                    value={data.seguridadOperativa[key].score}
                                    onChange={v => handleChange(`seguridadOperativa.${key}.score`, v)}
                                />
                                <Textarea
                                    rows={3}
                                    placeholder="Comentario / observaciones"
                                    value={data.seguridadOperativa[key].comentario}
                                    onChange={e => handleChange(`seguridadOperativa.${key}.comentario`, e.target.value)}
                                />
                                <Separator />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Experiencia del Cliente</CardTitle></CardHeader>
                    <CardContent>
                        <Likert
                            label="Nivel de atención y comunicación"
                            value={data.experienciaCliente}
                            onChange={v => handleChange("experienciaCliente", v)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Liderazgo</CardTitle></CardHeader>
                    <CardContent>
                        <Likert
                            label="Efectividad del liderazgo"
                            value={data.liderazgo}
                            onChange={v => handleChange("liderazgo", v)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Comentarios generales</CardTitle></CardHeader>
                    <CardContent>
                        <Textarea rows={4} value={data.comentarios} onChange={e => handleChange("comentarios", e.target.value)} />
                    </CardContent>
                </Card>
                <div className="flex justify-center pt-4">
                    <Button size="lg" onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analizando diagnóstico...
                            </>
                        ) : (
                            "Enviar diagnóstico"
                        )}
                    </Button>
                </div>
                {loading && (
                    <p className="text-center text-sm text-muted-foreground mt-2">
                        Esto puede tardar hasta un minuto
                    </p>
                )}

            </div>

            {/* --- BLOQUE DE MODAL ACTUALIZADO --- */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="
                    w-full 
                    max-w-4xl 
                    // CAMBIO: Aseguramos un margen vertical mínimo y limitamos el alto para pantallas grandes
                    max-h-[90vh] 
                    my-8 
                    flex 
                    flex-col 
                    p-0
                    border-none
                    // El componente DialogContent por defecto ya incluye un h-full en su base de Radix si es necesario
                    // Al añadir 'my-8' aseguramos el margen superior/inferior.
                ">
                    {/* HEADER (Fijo) */}
                    <DialogHeader className="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-left space-y-0">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            Evaluación automática de la estación
                        </DialogTitle>
                    </DialogHeader>

                    {/* BODY (Scrollable) */}
                    <div className="
                        flex-1 
                        overflow-y-auto 
                        px-4 
                        sm:px-6 
                        py-4
                    ">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-4 rounded-lg">
                            {resultadoIA}
                        </div>
                    </div>

                    {/* FOOTER (Fijo) */}
                    <DialogFooter className="shrink-0 px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-end items-center">
                        
                        {/* Botón de Copiar (Lógica de Copiado con Tilde Verde) */}
                        <Button
                            variant="secondary"
                            // CAMBIO: Usamos la nueva función handleCopy
                            onClick={handleCopy}
                            className={`w-full sm:w-auto transition-colors duration-300 ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                        >
                            {/* CAMBIO: Lógica para mostrar Copy o Check */}
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" /> Copiado
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" /> Copiar todo
                                </>
                            )}
                        </Button>

                        {/* Botón de Aceptar */}
                        <Button 
                            onClick={() => setOpenModal(false)}
                            className="w-full sm:w-auto"
                        >
                            Aceptar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* --- FIN DEL BLOQUE DE MODAL ACTUALIZADO --- */}
        </div>
    );
};

export default Necesidades;