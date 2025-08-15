import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseActions } from "../store";
import { marked } from "marked";
import DOMPurify from "dompurify";
marked.setOptions({ gfm: true, breaks: true });
const isLikelyHTML = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

const mdToSafeHTML = (s: string) => {
    const html = marked.parse(s);
    return DOMPurify.sanitize(html as string);
};

const toEditorHTML = (s: string) => (isLikelyHTML(s) ? s : mdToSafeHTML(s));
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    ArrowLeft,
    Edit3,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Image,
    Palette,
    Type,
    Download,
    Upload,
    Undo,
    Redo,
    List,
    ListOrdered,
    Quote,
    Code,
    Link as LinkIcon,
    Eye,
    Share,
    FileText,
    File,
} from "lucide-react";

// Importaciones para PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Importa el store de curso para la inicialización
import courseStore from "../store/stores/courseStore";

interface EditorState {
    content: string;
    title: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
}

const fontFamilies = [
    "Inter, sans-serif",
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "Georgia, serif",
    "Times New Roman, serif",
    "Courier New, monospace",
    "JetBrains Mono, monospace",
];

const backgroundGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
];

export default function CourseEditor() {
    const navigate = useNavigate();
    const [editorState, setEditorState] = useState<EditorState>({
        content: "<h1>Welcome to Course Editor</h1><p>Start creating your amazing content here!</p>",
        title: "Untitled Course",
        backgroundColor: "#0f0f23",
        textColor: "#ffffff",
        fontFamily: "Inter, sans-serif",
        fontSize: 16,
        lineHeight: 1.6,
    });

    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [applyToAll, setApplyToAll] = useState(true);
    const [history, setHistory] = useState<EditorState[]>([editorState]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const contentRef = useRef(editorState.content);

    const buildJsPdf = async (): Promise<jsPDF> => {
        // === mismos parámetros y lógica que hoy en exportAsPDF ===
        const MARGIN_MM = 15;
        const SCALE = 1.5;

        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-10000px";
        tempDiv.style.top = "0";
        tempDiv.style.width = "210mm";
        tempDiv.style.padding = `${MARGIN_MM}mm`;
        tempDiv.style.boxSizing = "border-box";
        tempDiv.style.fontFamily = editorState.fontFamily;
        tempDiv.style.fontSize = `${editorState.fontSize}px`;
        tempDiv.style.lineHeight = editorState.lineHeight.toString();
        tempDiv.style.color = editorState.textColor;
        tempDiv.style.background = editorState.backgroundColor;
        tempDiv.innerHTML = editorState.content;
        document.body.appendChild(tempDiv);

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        const pageAspect = pdfH / pdfW;

        const cssW = tempDiv.getBoundingClientRect().width;
        const cssPageHeightPx = cssW * pageAspect;
        const totalPages = Math.max(1, Math.ceil(tempDiv.scrollHeight / cssPageHeightPx));
        tempDiv.style.height = `${totalPages * cssPageHeightPx}px`;

        const baseRect = tempDiv.getBoundingClientRect();
        const linkNodes = Array.from(tempDiv.querySelectorAll("a")) as HTMLAnchorElement[];
        const linkPositionsDOM = linkNodes.map(a => {
            const r = a.getBoundingClientRect();
            return { href: a.href, x: r.left - baseRect.left, y: r.top - baseRect.top, w: r.width, h: r.height };
        });

        const bigCanvas = await html2canvas(tempDiv, { scale: SCALE, useCORS: true });
        const cW = bigCanvas.width;
        const pageHeightCanvasPx = Math.floor((pdfH / pdfW) * cW);
        const scaleToPdf = pdfW / cW;

        for (let page = 0; page < totalPages; page++) {
            const srcY = page * pageHeightCanvasPx;
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = cW;
            pageCanvas.height = pageHeightCanvasPx;
            const ctx = pageCanvas.getContext("2d")!;
            ctx.drawImage(bigCanvas, 0, srcY, cW, pageHeightCanvasPx, 0, 0, cW, pageHeightCanvasPx);
            const img = pageCanvas.toDataURL("image/jpeg", 0.82);

            if (page > 0) pdf.addPage();
            pdf.addImage(img, "JPEG", 0, 0, pdfW, pdfH);

            linkPositionsDOM
                .map(lp => ({ href: lp.href, x: lp.x * SCALE, y: lp.y * SCALE, w: lp.w * SCALE, h: lp.h * SCALE }))
                .filter(lp => lp.y >= srcY && lp.y < srcY + pageHeightCanvasPx)
                .forEach(lp => {
                    const xPdf = lp.x * scaleToPdf;
                    const yPdf = (lp.y - srcY) * scaleToPdf;
                    const wPdf = lp.w * scaleToPdf;
                    const hPdf = lp.h * scaleToPdf;
                    try { pdf.link(xPdf, yPdf, wPdf, hPdf, { url: lp.href }); } catch { }
                });
        }

        document.body.removeChild(tempDiv);
        return pdf;
    };



    useEffect(() => {
        const fetchInitialContent = () => {
            const globalContent = courseStore.getEditorContent();
            const globalTitle = courseStore.getEditorTitle();

            const rawContent =
                globalContent || "<h1>Welcome to Course Editor</h1><p>Start creating your amazing content here!</p>";
            const initialTitle = globalTitle || "Untitled Course";

            // 👇 convierte Markdown a HTML solo si hace falta
            const html = toEditorHTML(rawContent);

            setEditorState(prev => ({
                ...prev,
                content: html,
                title: initialTitle,
            }));
            contentRef.current = html;

            if (editorRef.current) {
                editorRef.current.innerHTML = html;
            }

            setHistory([{
                ...editorState,
                content: html,
                title: initialTitle
            }]);
            setHistoryIndex(0);
        };

        fetchInitialContent();
        courseStore.addChangeListener(fetchInitialContent);
        return () => {
            courseStore.removeChangeListener(fetchInitialContent);
        };
    }, []);

    const saveToHistory = (newState: EditorState) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setEditorState(newState);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            const newState = history[historyIndex - 1];
            setEditorState(newState);
            if (editorRef.current) {
                editorRef.current.innerHTML = newState.content;
            }
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const newState = history[historyIndex + 1];
            setEditorState(newState);
            if (editorRef.current) {
                editorRef.current.innerHTML = newState.content;
            }
        }
    };

    const executeCommand = (command: string, value?: string) => {
        if (!editorRef.current) return;
        const selection = window.getSelection();

        const savedRange = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (applyToAll) {
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            selection?.removeAllRanges();
            selection?.addRange(range);
        } else {
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                alert("Please select some text first, or enable 'Apply to All' to format all text.");
                return;
            }
        }

        document.execCommand(command, false, value);

        if (!applyToAll && savedRange) {
            selection?.removeAllRanges();
            selection?.addRange(savedRange);
        }

        const newContent = editorRef.current.innerHTML;
        const newEditorState = { ...editorState, content: newContent };
        saveToHistory(newEditorState);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageSrc = e.target?.result as string;
                const imageHtml = `<img src="${imageSrc}" title="Arrastra y redimensiona la imagen" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block; cursor: grab;" contenteditable="true" />`;

                if (editorRef.current) {
                    document.execCommand("insertHTML", false, imageHtml);
                    const newContent = editorRef.current.innerHTML;
                    const newEditorState = { ...editorState, content: newContent };
                    saveToHistory(newEditorState);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const insertLink = () => {
        let url = prompt("Enter URL:");
        if (url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            executeCommand("createLink", url);
        }
    };

    const applyTextColor = (color: string) => {
        executeCommand("foreColor", color);
        setEditorState(prev => ({ ...prev, textColor: color }));
    };

    const applyGlobalStyle = (style: Partial<EditorState>) => {
        setEditorState(prev => ({ ...prev, ...style }));
    };

    const exportAsPDF = async () => {
        const pdf = await buildJsPdf();
        pdf.save(`${editorState.title.replace(/\s+/g, "_")}.pdf`);
    };

    const shareContent = async () => {
        const pdf = await buildJsPdf();
        const blob = pdf.output("blob"); // 👉 Blob del PDF listo para subir
        const fileName = `${editorState.title.replace(/\s+/g, "_")}.pdf`;

        // guardamos globalmente (incluye objectURL para preview)
        courseActions.setSharePdf(blob, fileName);

        // nos vamos a /share
        navigate("/share");
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        to="/dashboard"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Edit3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <Input
                                value={editorState.title}
                                onChange={(e) =>
                                    setEditorState(prev => ({ ...prev, title: e.target.value }))
                                }
                                className="text-xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                                placeholder="Course Title"
                            />
                            <p className="text-sm text-muted-foreground">
                                Rich content editor for course creation
                            </p>
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className={isPreviewMode ? "bg-primary/10" : ""}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {isPreviewMode ? "Edit" : "Preview"}
                        </Button>

                        {/* Export Options */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                                <div className="space-y-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={exportAsPDF}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Export as PDF
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Share Button */}
                        <Button variant="outline" onClick={shareContent}>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl"></div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Left Sidebar - Tools */}
                    <div className="lg:col-span-1">
                        <Tabs defaultValue="formatting" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="formatting">
                                    <Type className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="design">
                                    <Palette className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="media">
                                    <Image className="h-4 w-4" />
                                </TabsTrigger>
                            </TabsList>

                            {/* Formatting Tab */}
                            <TabsContent value="formatting" className="space-y-4">
                                <Card className="border-border shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Text Formatting</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Apply to All Toggle */}
                                        <div className={`flex items-center justify-between p-3 rounded-lg border ${applyToAll
                                            ? "bg-primary/10 border-primary/30"
                                            : "bg-destructive/5 border-destructive/20"
                                            }`}>
                                            <div>
                                                <Label className="text-foreground font-medium">Apply to All</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    {applyToAll
                                                        ? "✓ Changes apply to entire text"
                                                        : "⚠ Select text first, then apply formatting"}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={applyToAll}
                                                onCheckedChange={setApplyToAll}
                                            />
                                        </div>
                                        {/* Basic Formatting */}
                                        <div className="flex flex-wrap gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("bold")}
                                            >
                                                <Bold className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("italic")}
                                            >
                                                <Italic className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("underline")}
                                            >
                                                <Underline className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Alignment */}
                                        <div className="flex flex-wrap gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("justifyLeft")}
                                            >
                                                <AlignLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("justifyCenter")}
                                            >
                                                <AlignCenter className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("justifyRight")}
                                            >
                                                <AlignRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("justifyFull")}
                                            >
                                                <AlignJustify className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Lists and More */}
                                        <div className="flex flex-wrap gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("insertUnorderedList")}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("insertOrderedList")}
                                            >
                                                <ListOrdered className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => executeCommand("formatBlock", "blockquote")}
                                            >
                                                <Quote className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={insertLink}
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Font Family (aplica a todo el documento) */}
                                        <div className="space-y-2">
                                            <Label>Font Family</Label>
                                            <Select
                                                value={editorState.fontFamily}
                                                onValueChange={(value) =>
                                                    setEditorState(prev => ({ ...prev, fontFamily: value }))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fontFamilies.map((font) => (
                                                        <SelectItem key={font} value={font}>
                                                            <span style={{ fontFamily: font }}>{font.split(",")[0]}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Font Size (aplica a todo el documento) */}
                                        <div className="space-y-2">
                                            <Label>Font Size: {editorState.fontSize}px</Label>
                                            <Slider
                                                value={[editorState.fontSize]}
                                                onValueChange={([value]) =>
                                                    setEditorState(prev => ({ ...prev, fontSize: value }))
                                                }
                                                min={12}
                                                max={72}
                                                step={1}
                                            />
                                        </div>

                                        {/* Line Height (aplica a todo el documento) */}
                                        <div className="space-y-2">
                                            <Label>Line Height: {editorState.lineHeight}</Label>
                                            <Slider
                                                value={[editorState.lineHeight]}
                                                onValueChange={([value]) =>
                                                    setEditorState(prev => ({ ...prev, lineHeight: value }))
                                                }
                                                min={1}
                                                max={3}
                                                step={0.1}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Design Tab */}
                            <TabsContent value="design" className="space-y-4">
                                <Card className="border-border shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Colors & Background</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Text Color */}
                                        <div className="space-y-2">
                                            <Label>Text Color</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="color"
                                                    value={editorState.textColor}
                                                    onChange={(e) => executeCommand("foreColor", e.target.value)}
                                                    className="w-12 h-8 p-1 border rounded"
                                                />
                                                <Input
                                                    value={editorState.textColor}
                                                    onChange={(e) => setEditorState(prev => ({ ...prev, textColor: e.target.value }))}
                                                    className="flex-1"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {applyToAll ? "Will apply to all text" : "Will apply to selected text only"}
                                            </p>
                                        </div>

                                        {/* Background Color */}
                                        <div className="space-y-2">
                                            <Label>Background Color</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="color"
                                                    value={editorState.backgroundColor}
                                                    onChange={(e) =>
                                                        setEditorState(prev => ({ ...prev, backgroundColor: e.target.value }))
                                                    }
                                                    className="w-12 h-8 p-1 border rounded"
                                                />
                                                <Input
                                                    value={editorState.backgroundColor}
                                                    onChange={(e) =>
                                                        setEditorState(prev => ({ ...prev, backgroundColor: e.target.value }))
                                                    }
                                                    className="flex-1"
                                                />
                                            </div>
                                        </div>

                                        {/* Gradient Presets */}
                                        <div className="space-y-2">
                                            <Label>Gradient Presets</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {backgroundGradients.map((gradient, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="outline"
                                                        className="h-8 p-0"
                                                        style={{ background: gradient }}
                                                        onClick={() =>
                                                            setEditorState(prev => ({ ...prev, backgroundColor: gradient }))
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Media Tab */}
                            <TabsContent value="media" className="space-y-4">
                                <Card className="border-border shadow-xl">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Media & Assets</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload Image
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label>History</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={undo}
                                                    disabled={historyIndex === 0}
                                                >
                                                    <Undo className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={redo}
                                                    disabled={historyIndex === history.length - 1}
                                                >
                                                    <Redo className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Main Editor */}
                    <div className="lg:col-span-3">
                        <Card className="border-border shadow-xl h-[calc(100vh-200px)]">
                            <CardContent className="p-0 h-full">
                                {isPreviewMode ? (
                                    <div
                                        className="w-full h-full p-6 overflow-auto"
                                        style={{
                                            fontFamily: editorState.fontFamily,
                                            fontSize: `${editorState.fontSize}px`,
                                            lineHeight: editorState.lineHeight,
                                            color: editorState.textColor,
                                            background: editorState.backgroundColor,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: editorState.content }}
                                    />
                                ) : (
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        className="w-full h-full p-6 outline-none overflow-auto prose prose-lg max-w-none"
                                        style={{
                                            fontFamily: editorState.fontFamily,
                                            fontSize: `${editorState.fontSize}px`,
                                            lineHeight: editorState.lineHeight,
                                            color: editorState.textColor,
                                            background: editorState.backgroundColor,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: editorState.content }}
                                        onInput={(e) => {
                                            contentRef.current = e.currentTarget.innerHTML;
                                        }}
                                        onBlur={() => {
                                            if (editorRef.current && contentRef.current !== history[historyIndex].content) {
                                                setEditorState(prev => ({ ...prev, content: contentRef.current }));
                                                saveToHistory({ ...editorState, content: contentRef.current });
                                            }
                                        }}
                                        onPaste={(e) => {
                                            const plain = e.clipboardData?.getData("text/plain") || "";
                                            const htmlClip = e.clipboardData?.getData("text/html") || "";

                                            // Si es solo texto plano (probable markdown), lo convierto a HTML
                                            if (plain && !htmlClip) {
                                                e.preventDefault();
                                                const converted = mdToSafeHTML(plain);
                                                document.execCommand("insertHTML", false, converted);

                                                if (editorRef.current) {
                                                    const newContent = editorRef.current.innerHTML;
                                                    saveToHistory({ ...editorState, content: newContent });
                                                }
                                            }
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}