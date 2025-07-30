import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Settings,
  Users,
  Shield,
  Database,
  Bell,
  Eye,
  Trash2,
  Save,
  Plus,
  Edit,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User" | "Viewer";
  status: "Active" | "Inactive";
  lastLogin: string;
}

interface SystemSettings {
  siteName: string;
  maxFileSize: string;
  sessionTimeout: string;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  maintenanceMode: boolean;
  allowRegistration: boolean;
}

const sampleUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@datamentor.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-01-15 10:30",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    role: "User",
    status: "Active",
    lastLogin: "2024-01-14 15:45",
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "2024-01-10 09:15",
  },
];

export default function AjustesAdministrador() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: "Data Mentor Tools",
    maxFileSize: "50",
    sessionTimeout: "30",
    enableNotifications: true,
    enableAnalytics: true,
    maintenanceMode: false,
    allowRegistration: true,
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "User" as User["role"],
  });

  const handleSystemSettingChange = (
    key: keyof SystemSettings,
    value: string | boolean,
  ) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    // In real implementation, this would save to backend
    alert("Settings saved successfully!");
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "Active",
      lastLogin: "Never",
    };

    setUsers((prev) => [...prev, user]);
    setNewUser({ name: "", email: "", role: "User" });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user,
      ),
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "User":
        return "bg-primary/20 text-primary border-primary/30";
      case "Viewer":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-neon-green/20 text-neon-green border-neon-green/30";
      case "Inactive":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-muted text-muted-foreground";
    }
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
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Ajustes de Administrador
              </h1>
              <p className="text-sm text-muted-foreground">
                Configuración de sistema y administración de usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base de datos
            </TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Add New User */}
              <Card className="border-border shadow-xl">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Agregar nuevo usuario
                  </CardTitle>
                  <CardDescription>
                    Crear una nueva cuenta de usuario para el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Nombre Completo</Label>
                    <Input
                      id="user-name"
                      placeholder="Enter full name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-email">Dirección de email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="Enter email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: User["role"]) =>
                        setNewUser((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Viewer">Solo visualización</SelectItem>
                        <SelectItem value="User">Usuario</SelectItem>
                        <SelectItem value="Admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleAddUser} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Usuario
                  </Button>
                </CardContent>
              </Card>

              {/* Users List */}
              <div className="lg:col-span-2">
                <Card className="border-border shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-foreground">
                      Administración de Usuarios
                    </CardTitle>
                    <CardDescription>
                      Administrar usuarios existentes y sus permisos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">
                                {user.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ultimo log-in: {user.lastLogin}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={getRoleColor(user.role)}
                            >
                              {user.role}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getStatusColor(user.status)}
                            >
                              {user.status}
                            </Badge>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card className="border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Configuración del sistema
                </CardTitle>
                <CardDescription>
                  Configuración general de sistema y preferencias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Nombre del sitio</Label>
                    <Input
                      id="site-name"
                      value={systemSettings.siteName}
                      onChange={(e) =>
                        handleSystemSettingChange("siteName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-file-size">
                      Max File Size (MB)
                    </Label>
                    <Input
                      id="max-file-size"
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) =>
                        handleSystemSettingChange("maxFileSize", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) =>
                        handleSystemSettingChange(
                          "sessionTimeout",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Habilitar Notificaciones</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificacione de sistema a los usuarios
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={systemSettings.enableNotifications}
                      onCheckedChange={(checked) =>
                        handleSystemSettingChange("enableNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics">Habilitar Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Recolectar análisis de datos usados
                      </p>
                    </div>
                    <Switch
                      id="analytics"
                      checked={systemSettings.enableAnalytics}
                      onCheckedChange={(checked) =>
                        handleSystemSettingChange("enableAnalytics", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Modo Mantenimiento</Label>
                      <p className="text-sm text-muted-foreground">
                        Habilitar modo de mantenimiento para actualizaciones de sistema
                      </p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        handleSystemSettingChange("maintenanceMode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registration">Permitir Registros</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir a nuevos usuarios registrar cuentas.
                      </p>
                    </div>
                    <Switch
                      id="registration"
                      checked={systemSettings.allowRegistration}
                      onCheckedChange={(checked) =>
                        handleSystemSettingChange("allowRegistration", checked)
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Configuración de seguridad
                </CardTitle>
                <CardDescription>
                  Administrar políticas de seguridad y accesos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Políticas de password
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Longitud mínima del password</Label>
                        <Input type="number" defaultValue="8" />
                      </div>
                      <div className="space-y-2">
                        <Label>Vencimiento de password (dias)</Label>
                        <Input type="number" defaultValue="90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Control de Acceso
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Autenticación de dos factores</Label>
                          <p className="text-sm text-muted-foreground">
                            Requerir autenticación de 2 factores para todos los Admin
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>IP Whitelist</Label>
                          <p className="text-sm text-muted-foreground">
                            Restringir acceso solo a IP's específicas
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database" className="space-y-6">
            <Card className="border-border shadow-xl">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Control General de base de datos
                </CardTitle>
                <CardDescription>
                  Monitor y mantenimiento de salud de base de datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Configuraciones de buck-up
                    </h3>
                    <div className="space-y-2">
                      <Label>Frecuencia de buck-up's</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Por hora</SelectItem>
                          <SelectItem value="daily">Por dia</SelectItem>
                          <SelectItem value="weekly">Por semana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="w-full">
                      Abrir manual de buck-up
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Estado de base de datos
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Estado de conección:
                        </span>
                        <Badge className="bg-neon-green/20 text-neon-green">
                          Conectado
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Ultimo buck-up:
                        </span>
                        <span className="text-sm">2024-01-15 08:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tamaño de base de datos:
                        </span>
                        <span className="text-sm">245 MB</span>
                      </div>
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