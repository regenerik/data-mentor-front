import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FilePlus, ArrowLeft, Bot, Loader2, X } from "lucide-react"; // Importamos el ícono de cruz
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Configuración de Cloudinary
const CLOUDINARY_UPLOAD_PRESET = "yu1h90st"; // Reemplaza con tu preset de carga
const CLOUDINARY_CLOUD_NAME = "drlqmol4c"; // Reemplaza con tu nombre de nube
const BACKEND_API_URL = "https://dm-back-fn4l.onrender.com/create-gamma"; // URL del backend, ajusta si es necesario

export default function Presentaciones() {
    const persistedEmail = localStorage.getItem("email") || "";

    const [email, setEmail] = useState<string>(persistedEmail);
    const [titulo, setTitulo] = useState<string>("");
    const [descripcion, setDescripcion] = useState<string>("");
    const [archivo, setArchivo] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [gammaUrl, setGammaUrl] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

    // NUEVOS estados para los parámetros opcionales
    const [numCards, setNumCards] = useState<string>(""); // Nuevo estado para numCards
    const [amount, setAmount] = useState<string>("medium"); // Nuevo estado para amount
    const [tono, setTono] = useState<string>("");
    const [audiencia, setAudiencia] = useState<string>("");
    const [tema, setTema] = useState<string>("");
    const [idioma, setIdioma] = useState<string>("es");

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files && e.target.files[0];
        if (f) {
            setArchivo(f);
            setUploadedImageUrl(null);
        }
    }

    const uploadImageToCloudinary = async (file: File) => {
        setIsUploadingImage(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: "POST",
                    body: data,
                }
            );
            const uploadedFile = await response.json();
            if (!response.ok) {
                throw new Error(uploadedFile.error?.message || "Error al subir la imagen a Cloudinary.");
            }
            setUploadedImageUrl(uploadedFile.secure_url);
            setIsUploadingImage(false);
            return uploadedFile.secure_url;
        } catch (err: any) {
            console.error("Error al subir la imagen:", err);
            setError(err.message || "Error al subir la imagen. Por favor, inténtalo de nuevo.");
            setIsUploadingImage(false);
            return null;
        }
    };

    async function handleGenerate() {
        setError(null);
        setGammaUrl(null);
        setPdfUrl(null);

        if (!titulo && !descripcion && !archivo) {
            setError("Proporcione un título, una descripción o un archivo para generar la presentación.");
            return;
        }

        setIsLoading(true);
        let imageUrl = uploadedImageUrl;

        if (archivo && archivo.type.startsWith("image/")) {
            const url = await uploadImageToCloudinary(archivo);
            if (!url) {
                setIsLoading(false);
                return;
            }
            imageUrl = url;
        }

        const fd = new FormData();
        if (titulo) fd.append("titulo", titulo);
        if (descripcion) fd.append("descripcion", descripcion);
        if (email) fd.append("email", email);

        if (archivo && !archivo.type.startsWith("image/")) {
            fd.append("file", archivo);
        }
        if (imageUrl) {
            fd.append("imageUrl", imageUrl);
        }

        // AGREGADO: Agregamos los nuevos campos al FormData
        if (numCards) fd.append("numCards", numCards); // Correcto
        if (amount) fd.append("amount", amount);       // Correcto
        if (tono) fd.append("tone", tono);             // Corregido: "tone"
        if (audiencia) fd.append("audience", audiencia); // Corregido: "audience"
        if (tema) fd.append("themeName", tema);         // Corregido: "themeName"
        if (idioma) fd.append("language", idioma);

        try {
            const res = await fetch(BACKEND_API_URL, {
                method: "POST",
                body: fd,
            });

            if (!res.ok) {
                const jsonError = await res.json();
                throw new Error(jsonError.message || `Error del servidor: ${res.status}`);
            }

            const json = await res.json();
            const { gammaUrl, exportUrl } = json;

            if (exportUrl) {
                setGammaUrl(gammaUrl || null);
                setPdfUrl(exportUrl);
            } else {
                setError("No se recibió la URL de exportación PDF de la API de generación.");
            }
        } catch (err: any) {
            setError(err?.message || String(err));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 mb-4">
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
                                Presentaciones
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Creación de presentaciones power-point automatizadas
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <FilePlus className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Presentaciones</CardTitle>
                        </div>
                        <CardDescription>
                            Genera presentaciones automáticamente utilizando la API externa. Introduce los datos y adjunta un archivo opcional.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="email">Tu correo (opcional)</Label>
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@empresa.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="titulo">Título de la presentación</Label>
                                <Input
                                    id="titulo"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Ej: Estrategia Comercial Q4"
                                />
                            </div>
                            <div>
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    placeholder="Describe los objetivos o puntos clave para la presentación"
                                />
                            </div>

                            {/* Nuevos campos para los parámetros opcionales */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="tono">Tono de la presentación (opcional)</Label>
                                    <Input
                                        id="tono"
                                        value={tono}
                                        onChange={(e) => setTono(e.target.value)}
                                        placeholder="Ej: Profesional, inspirador, humorístico"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="audiencia">Audiencia (opcional)</Label>
                                    <Input
                                        id="audiencia"
                                        value={audiencia}
                                        onChange={(e) => setAudiencia(e.target.value)}
                                        placeholder="Ej: Inversores, estudiantes, clientes"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="tema">Nombre del tema (opcional)</Label>
                                    <Input
                                        id="tema"
                                        value={tema}
                                        onChange={(e) => setTema(e.target.value)}
                                        placeholder="Ej: Oasis, Night Sky"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="idioma">Idioma</Label>
                                    <Select value={idioma} onValueChange={setIdioma}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona un idioma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="en">Inglés (en)</SelectItem>
                                            <SelectItem value="es">Español (es)</SelectItem>
                                            <SelectItem value="pt">Portugués (pt)</SelectItem>
                                            <SelectItem value="fr">Francés (fr)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* AGREGADO: Input para numCards */}
                                <div>
                                    <Label htmlFor="numCards">Número de diapositivas</Label>
                                    <Input
                                        id="numCards"
                                        type="number"
                                        value={numCards}
                                        onChange={(e) => setNumCards(e.target.value)}
                                        placeholder="Ej: 10"
                                    />
                                </div>
                            </div>
                            {/* AGREGADO: Select para amount */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amount">Cantidad de texto</Label>
                                    <Select value={amount} onValueChange={setAmount}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona una cantidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="brief">Breve</SelectItem>
                                            <SelectItem value="medium">Medio</SelectItem>
                                            <SelectItem value="detailed">Detallado</SelectItem>
                                            <SelectItem value="extensive">Extenso</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="file">Archivo adjunto (opcional)</Label>
                                <br />
                                <input
                                    id="file"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="mt-2"
                                    aria-label="Adjuntar archivo"
                                />
                                {archivo && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Archivo seleccionado: {archivo.name}
                                    </p>
                                )}
                                {uploadedImageUrl && (
                                    <p className="text-sm text-green-500 mt-2">
                                        Imagen subida a Cloudinary correctamente.
                                    </p>
                                )}
                            </div>

                            {error && <div className="text-sm text-destructive">{error}</div>}

                            <div className="flex gap-3">
                                <Button onClick={handleGenerate} disabled={isLoading || isUploadingImage} className="flex-1">
                                    {isLoading || isUploadingImage ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {isUploadingImage ? "Subiendo imagen..." : "Generando..."}
                                        </>
                                    ) : (
                                        "Generar Presentación"
                                    )}
                                </Button>

                                {pdfUrl && (
                                    <a href={pdfUrl} target="_blank" rel="noreferrer" className="inline-block">
                                        <Button variant="outline">Descargar PDF</Button>
                                    </a>
                                )}
                            </div>
                        </div>

                        {pdfUrl && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold">Resultado</h3>
                                <p className="text-sm text-muted-foreground">
                                    La presentación ha sido generada correctamente. Haz clic para descargar el PDF.
                                </p>
                                <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                                    Descargar PDF
                                </a>
                                {gammaUrl && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        También puedes ver y editar en Gamma:{" "}
                                        <a
                                            href={gammaUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs underline text-blue-500"
                                        >
                                            Ver en Gamma App
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}