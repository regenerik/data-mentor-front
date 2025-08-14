import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  IdCard,
  Camera,
  Save,
  Edit,
  Settings,
  Eye,
  EyeOff,
  Crown,
  Check,
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  admin: boolean;
  dni: string;
  url_image: string;
}

export default function MyProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    admin: false,
    dni: "",
    url_image: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [showAdminBadge, setShowAdminBadge] = useState(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedProfile: UserProfile = {
      name: localStorage.getItem("name") || "Usuario",
      email: localStorage.getItem("email") || "usuario@ejemplo.com",
      admin: JSON.parse(localStorage.getItem("admin") || "false"),
      dni: localStorage.getItem("dni") || "12345678A",
      url_image: localStorage.getItem("url_image") || "",
    };
    setProfile(loadedProfile);
    setEditedProfile(loadedProfile);
  }, []);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem("name", editedProfile.name);
    localStorage.setItem("email", editedProfile.email);
    localStorage.setItem("admin", JSON.stringify(editedProfile.admin));
    localStorage.setItem("dni", editedProfile.dni);
    localStorage.setItem("url_image", editedProfile.url_image);

    setProfile(editedProfile);
    setIsEditing(false);
    setIsSaved(true);

    // Reset saved indicator after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string | boolean) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Mi Perfil</h1>
              <p className="text-sm text-muted-foreground">
                Gestiona tu información personal y configuración
              </p>
            </div>
          </div>
          {isSaved && (
            <div className="ml-auto flex items-center gap-2 bg-neon-green/10 border border-neon-green/20 rounded-full px-3 py-1">
              <Check className="h-4 w-4 text-neon-green" />
              <span className="text-sm font-medium text-neon-green">Guardado</span>
            </div>
          )}
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-neon-green/3 rounded-full blur-2xl"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Profile Picture Card */}
              <Card className="border-border shadow-xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-primary/20">
                        <AvatarImage src={profile.url_image} alt={profile.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center border-2 border-card">
                        <Camera className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-foreground">{profile.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {profile.email}
                  </CardDescription>
                  <div className="flex justify-center mt-3">
                    {profile.admin ? (
                      <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                        <Crown className="h-3 w-3 mr-1" />
                        Administrador
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-primary/30">
                        <User className="h-3 w-3 mr-1" />
                        Usuario
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Profile Information */}
              <div className="md:col-span-2">
                <Card className="border-border shadow-xl bg-card/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground">
                        Información Personal
                      </CardTitle>
                      <CardDescription>
                        Actualiza tus datos personales y de contacto
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="border-primary/30 hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          className="border-border"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-primary/90 hover:bg-primary">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-foreground flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Nombre Completo
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={isEditing ? editedProfile.name : profile.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          disabled={!isEditing}
                          className={`bg-background/50 ${
                            isEditing ? "border-primary/50" : "border-border/30"
                          }`}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4 text-primary" />
                          Correo Electrónico
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? editedProfile.email : profile.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          disabled={!isEditing}
                          className={`bg-background/50 ${
                            isEditing ? "border-primary/50" : "border-border/30"
                          }`}
                        />
                      </div>

                      {/* DNI */}
                      <div className="space-y-2">
                        <Label htmlFor="dni" className="text-foreground flex items-center gap-2">
                          <IdCard className="h-4 w-4 text-primary" />
                          DNI / Identificación
                        </Label>
                        <Input
                          id="dni"
                          type="text"
                          value={isEditing ? editedProfile.dni : profile.dni}
                          onChange={(e) => handleInputChange("dni", e.target.value)}
                          disabled={!isEditing}
                          className={`bg-background/50 ${
                            isEditing ? "border-primary/50" : "border-border/30"
                          }`}
                        />
                      </div>

                      {/* Profile Image URL */}
                      <div className="space-y-2">
                        <Label htmlFor="url_image" className="text-foreground flex items-center gap-2">
                          <Camera className="h-4 w-4 text-primary" />
                          URL de Imagen
                        </Label>
                        <Input
                          id="url_image"
                          type="url"
                          placeholder="https://ejemplo.com/imagen.jpg"
                          value={isEditing ? editedProfile.url_image : profile.url_image}
                          onChange={(e) => handleInputChange("url_image", e.target.value)}
                          disabled={!isEditing}
                          className={`bg-background/50 ${
                            isEditing ? "border-primary/50" : "border-border/30"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Admin Status */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-primary" />
                          <div>
                            <Label className="text-foreground font-medium">
                              Privilegios de Administrador
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {profile.admin
                                ? "Tienes acceso completo al sistema"
                                : "Acceso estándar de usuario"}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isEditing ? editedProfile.admin : profile.admin}
                          onCheckedChange={(checked) => handleInputChange("admin", checked)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border shadow-xl bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Configuración de Perfil</CardTitle>
                <CardDescription>
                  Personaliza la visualización y comportamiento de tu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-foreground">Mostrar Badge de Admin</Label>
                        <p className="text-sm text-muted-foreground">
                          Mostrar públicamente el estado de administrador
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={showAdminBadge}
                      onCheckedChange={setShowAdminBadge}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-foreground">Tema Personalizado</Label>
                        <p className="text-sm text-muted-foreground">
                          Usar colores personalizados para el perfil
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-foreground">Notificaciones</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibir notificaciones por email
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Estadísticas del Perfil
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
                      <div className="text-2xl font-bold text-neon-blue">15</div>
                      <div className="text-sm text-muted-foreground">Conversaciones</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
                      <div className="text-2xl font-bold text-neon-green">42</div>
                      <div className="text-sm text-muted-foreground">Descargas</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
                      <div className="text-2xl font-bold text-neon-purple">8</div>
                      <div className="text-sm text-muted-foreground">Cursos</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="text-2xl font-bold text-primary">120</div>
                      <div className="text-sm text-muted-foreground">Puntos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
