import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Eye,
  Trash2,
  Save,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bug,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { authActions } from "../store";
import Reports from "./Reports.tsx";
import ErroresReportados from "./ErroresReportados.tsx";
import Instructions from "./Instructions.tsx";
import Data from "./Data.tsx";

interface User {
  dni: string;
  name: string;
  email: string;
  admin: boolean;
  url_image: string;
  status: boolean;
  lastLogin?: string;
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

interface SectorPermission {
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
}

const BASE_URL = "https://dm-back-fn4l.onrender.com";
const isAdminLS = () => localStorage.getItem("admin") === "true";


export default function AjustesAdministrador() {
  const [users, setUsers] = useState<User[]>([]);
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
    password: "",
    dni: "",
    role: "User" as "User" | "Admin",
  });

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [formError, setFormError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState<User | null>(null);
  const [showAdminRoleModal, setShowAdminRoleModal] = useState(false);
  const [userToToggleAdmin, setUserToToggleAdmin] = useState<User | null>(null);

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [userToEditPermissions, setUserToEditPermissions] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<SectorPermission[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingUsers(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      const fetchedUsers: User[] = data.lista_usuarios.map((user: any) => ({
        dni: user.dni,
        name: user.name,
        email: user.email,
        admin: user.admin,
        url_image: user.url_image,
        // Convertir el status a booleano de forma segura
        status: user.status === true || user.status === "true",
        lastLogin: "N/A",
      }));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setModalMessage("Error al cargar la lista de usuarios.");
      setShowErrorModal(true);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    const checkTokenAndFetchUsers = async () => {
      const token = localStorage.getItem("token");
      const isAdmin = localStorage.getItem("admin") === "true";


      if (!token || !isAdmin) {
        console.warn("Acceso denegado. Redirigiendo a dashboard.");
        navigate("/dashboard");
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/check_token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.warn("Token expirado o inválido. Cerrando sesión automáticamente.");
          authActions.logout();
          navigate("/expired-token");
          return;
        }
        fetchUsers();
      } catch (error) {
        console.error("Error al verificar el token:", error);
        authActions.logout();
        navigate("/");
      }
    };

    checkTokenAndFetchUsers();
  }, [navigate]);

  const handleSystemSettingChange = (
    key: keyof SystemSettings,
    value: string | boolean
  ) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    alert("Settings saved successfully!");
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.dni || !newUser.password) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }

    const token = localStorage.getItem("token"); // 👈 AGREGAR
    if (!token) {
      setModalMessage("Sesión inválida. Volvé a iniciar sesión.");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      const payload = {
        name: newUser.name,
        email: newUser.email,
        dni: newUser.dni,
        password: newUser.password,
        admin: newUser.role === "Admin",
      };

      const response = await fetch(`${BASE_URL}/create_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ ACÁ
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al crear el usuario.");
      }

      setModalMessage("Usuario creado exitosamente.");
      setShowSuccessModal(true);
      setNewUser({ name: "", email: "", password: "", dni: "", role: "User" });
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      setModalMessage(error.message || "Ocurrió un error al crear el usuario.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowErrorModal(false);
      }, 3000);
    }
  };


  const handleDeleteUser = async (user: User) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/delete_user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dni: user.dni }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al eliminar el usuario.");
      }

      setModalMessage(result.message);
      setShowSuccessModal(true);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setModalMessage(error.message || "Ocurrió un error al eliminar el usuario.");
      setShowErrorModal(true);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowErrorModal(false);
      }, 3000);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/toggle_user_status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dni: user.dni }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al cambiar el estado del usuario.");
      }

      setModalMessage(result.message);
      setShowSuccessModal(true);
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      setModalMessage(error.message || "Ocurrió un error al cambiar el estado del usuario.");
      setShowErrorModal(true);
    } finally {
      setShowStatusModal(false);
      setUserToToggleStatus(null);
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowErrorModal(false);
      }, 3000);
    }
  };

  const handleToggleAdminRole = async (user: User) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${BASE_URL}/update_admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ ACÁ
        },
        body: JSON.stringify({ email: user.email, admin: !user.admin }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al cambiar el rol del usuario.");
      }

      setModalMessage(result.message);
      setShowSuccessModal(true);
      fetchUsers();
    } catch (error: any) {
      console.error("Error toggling admin role:", error);
      setModalMessage(error.message || "Ocurrió un error al cambiar el rol del usuario.");
      setShowErrorModal(true);
    } finally {
      setShowAdminRoleModal(false);
      setUserToToggleAdmin(null);
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowErrorModal(false);
      }, 3000);
    }
  };


  const openPermissionsModal = async (user: User) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setUserToEditPermissions(user);
    setShowPermissionsModal(true);
    setLoadingPermissions(true);
    setPermissions([]);

    try {
      const res = await fetch(`${BASE_URL}/users/${user.dni}/permissions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al obtener permisos.");

      setPermissions(data.permissions || []);
    } catch (err: any) {
      console.error("Error fetching permissions:", err);
      setModalMessage(err.message || "Error al cargar permisos del usuario.");
      setShowErrorModal(true);
      // Si falla, cerramos el modal para no dejar una UI rota
      setPermissions([]); // opcional, para que no queden permisos viejos
    } finally {
      setLoadingPermissions(false);
    }
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const savePermissions = async () => {
    if (!userToEditPermissions) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setSavingPermissions(true);
    try {
      const payload = {
        permissions: permissions.map((p) => ({ key: p.key, enabled: p.enabled })),
      };

      const res = await fetch(`${BASE_URL}/users/${userToEditPermissions.dni}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar permisos.");

      setModalMessage("Permisos actualizados correctamente.");
      setShowSuccessModal(true);

      setShowPermissionsModal(false);
      setUserToEditPermissions(null);

      setTimeout(() => setShowSuccessModal(false), 2500);
    } catch (err: any) {
      console.error("Error saving permissions:", err);
      setModalMessage(err.message || "Ocurrió un error al guardar permisos.");
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    } finally {
      setSavingPermissions(false);
    }
  };

  const closePermissionsModal = () => {
    setShowPermissionsModal(false);
    setUserToEditPermissions(null);
    setPermissions([]);
  };


  const getRoleColor = (isAdmin: boolean) => {
    return isAdmin
      ? "bg-destructive/20 text-destructive border-destructive/30"
      : "bg-primary/20 text-primary border-primary/30";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-neon-green/20 text-neon-green border-neon-green/30"
      : "bg-muted text-muted-foreground border-muted";
  };

  const getInitials = (name: string) => {
    if (!name) return "";
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

      {/* Pop-up de éxito */}
      {showSuccessModal && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-lg bg-green-500/90 text-white shadow-xl flex flex-col items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-8 w-8 text-white" />
          <p className="font-semibold text-lg">{modalMessage}</p>
        </div>
      )}

      {/* Pop-up de error */}
      {showErrorModal && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-lg bg-red-500/90 text-white shadow-xl flex flex-col items-center gap-3 animate-fade-in">
          <XCircle className="h-8 w-8 text-white" />
          <p className="font-semibold text-lg">{modalMessage}</p>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
            <DialogTitle className="text-2xl font-bold text-destructive">Advertencia</DialogTitle>
            <DialogDescription className="text-lg">
              Estás a punto de eliminar a **{userToDelete?.name}**.
            </DialogDescription>
            <DialogDescription className="text-sm text-muted-foreground">
              Esta acción es irreversible. ¿Estás seguro de que quieres continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de cambio de estado */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mb-2" />
            <DialogTitle className="text-2xl font-bold text-orange-500">Advertencia</DialogTitle>
            <DialogDescription className="text-lg">
              Estás a punto de **{userToToggleStatus?.status ? "desactivar" : "activar"}** a **{userToToggleStatus?.name}**.
            </DialogDescription>
            <DialogDescription className="text-sm text-muted-foreground">
              Esto afectará su capacidad para acceder al sistema. ¿Quieres continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => userToToggleStatus && handleToggleStatus(userToToggleStatus)}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de cambio de rol de admin */}
      <Dialog open={showAdminRoleModal} onOpenChange={setShowAdminRoleModal}>
        <DialogContent>
          <DialogHeader className="flex flex-col items-center text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-2" />
            <DialogTitle className="text-2xl font-bold text-yellow-500">Advertencia</DialogTitle>
            <DialogDescription className="text-lg">
              Estás a punto de **{userToToggleAdmin?.admin ? "eliminar los permisos de administrador" : "otorgar permisos de administrador"}** a **{userToToggleAdmin?.name}**.
            </DialogDescription>
            <DialogDescription className="text-sm text-muted-foreground">
              Esta acción es sensible y afecta los privilegios de acceso del usuario. ¿Quieres continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminRoleModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={() => userToToggleAdmin && handleToggleAdminRole(userToToggleAdmin)}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de permisos por usuario */}
      <Dialog open={showPermissionsModal} onOpenChange={(open) => {
        // si se cierra desde afuera, reseteamos
        if (!open) closePermissionsModal();
        else setShowPermissionsModal(true);
      }}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permisos por usuario
            </DialogTitle>
            <DialogDescription>
              Editando permisos de: <span className="font-semibold">{userToEditPermissions?.name}</span>
            </DialogDescription>
          </DialogHeader>

          {loadingPermissions ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay sectores cargados o no se pudo obtener la lista.
                </p>
              ) : (
                permissions.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center justify-between border border-border rounded-lg p-3"
                  >
                    <div className="pr-4">
                      <p className="font-medium text-foreground">{p.label}</p>
                      {p.description ? (
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      ) : null}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        key: <span className="font-mono">{p.key}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={p.enabled ? "bg-neon-green/20 text-neon-green border-neon-green/30" : ""}>
                        {p.enabled ? "Habilitado" : "Deshabilitado"}
                      </Badge>

                      <Switch
                        checked={p.enabled}
                        onCheckedChange={() => togglePermission(p.key)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closePermissionsModal} disabled={savingPermissions}>
              Cancelar
            </Button>
            <Button onClick={savePermissions} disabled={savingPermissions || loadingPermissions}>
              {savingPermissions ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="p-1 bg-muted text-muted-foreground rounded-md w-full mb-4">
            <div className="flex flex-wrap justify-center w-full gap-1">
              <TabsTrigger value="users" className="flex items-center gap-2 flex-grow sm:flex-auto min-w-[120px]">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2 flex-grow sm:flex-auto min-w-[120px]">
                <Settings className="h-4 w-4" />
                Reportes
              </TabsTrigger>
              <TabsTrigger value="reported_errors" className="flex items-center gap-2 flex-grow sm:flex-auto min-w-[120px]">
                <Bug className="h-4 w-4" />
                Errores reportados
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2 flex-grow sm:flex-auto min-w-[120px]">
                <Settings className="h-4 w-4" />
                Instrucciones IA
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2 flex-grow sm:flex-auto min-w-[120px]">
                <Database className="h-4 w-4" />
                Datos
              </TabsTrigger>
            </div>
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
                      placeholder="Ingresar nombre completo"
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
                      placeholder="Ingresar email"
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
                    <Label htmlFor="user-dni">DNI</Label>
                    <Input
                      id="user-dni"
                      placeholder="Ingresar DNI"
                      value={newUser.dni}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, dni: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-password">Contraseña</Label>
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="Ingresar contraseña"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser((prev) => ({ ...prev, password: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: "User" | "Admin") =>
                        setNewUser((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="User">Usuario</SelectItem>
                        <SelectItem value="Admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formError && <p className="text-sm text-destructive">{formError}</p>}
                  <Button onClick={handleCreateUser} className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
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
                    {loadingUsers ? (
                      <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {users.length > 0 ? (
                          users.map((user) => (
                            <div
                              key={user.dni}
                              className="flex items-center justify-between p-4 border border-border rounded-lg"
                            >
                              <div className="flex items-center gap-4">
                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                  <AvatarImage src={user.url_image} alt={user.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-medium text-foreground">
                                    {user.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {user.email}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`cursor-pointer ${getRoleColor(user.admin)}`}
                                  onClick={() => {
                                    setShowAdminRoleModal(true);
                                    setUserToToggleAdmin(user);
                                  }}
                                >
                                  {user.admin ? "Admin" : "User"}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`cursor-pointer ${getStatusColor(user.status)}`}
                                  onClick={() => {
                                    setShowStatusModal(true);
                                    setUserToToggleStatus(user);
                                  }}
                                >
                                  {user.status ? "Activo" : "Inactivo"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (!isAdminLS()) {
                                      setModalMessage("Acceso denegado (admin requerido).");
                                      setShowErrorModal(true);
                                      return;
                                    }
                                    openPermissionsModal(user);
                                  }}
                                  title="Permisos"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setShowDeleteModal(true);
                                    setUserToDelete(user);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground">No hay usuarios para mostrar.</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reports Content */}
          <TabsContent value="reports" className="space-y-6">
            <Reports />
          </TabsContent>

          {/* Reported Errors Content */}
          <TabsContent value="reported_errors" className="space-y-6">
            <ErroresReportados />
          </TabsContent>

          {/* Instructions Content */}
          <TabsContent value="instructions" className="space-y-6">
            <Instructions />
          </TabsContent>

          {/* New Data Content Tab */}
          <TabsContent value="data" className="space-y-6">
            <Data />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}