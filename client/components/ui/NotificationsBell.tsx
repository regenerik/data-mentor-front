import { useEffect, useRef, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AUTH = "1803-1989-1803-1989";

type NotificationItem = {
  id: number;
  apies: string;
  gestor_asociado: string;
  created_at: string | null;
};

const formatDate = (date: string | null) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date;
  }
};

export default function NotificationsBell() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const gestor = (localStorage.getItem("name") || "").trim();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    if (!gestor) return;

    try {
      setLoading(true);

      const res = await fetch(
        `https://dm-back-fn4l.onrender.com/diagnostico/notificaciones?gestor_asociado=${encodeURIComponent(gestor)}`,
        {
          method: "GET",
          headers: {
            Authorization: AUTH,
          },
        }
      );

      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch {
      // silencioso para no spamear toasts en cada mount
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [gestor]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleNotificationClick = async (item: NotificationItem) => {
    try {
      setMarkingId(item.id);

      const res = await fetch(
        "https://dm-back-fn4l.onrender.com/diagnostico/notificacion-vista",
        {
          method: "POST",
          headers: {
            Authorization: AUTH,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: item.id,
            gestor_asociado: gestor,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "No se pudo marcar la notificación");
      }

      setItems((prev) => prev.filter((n) => n.id !== item.id));
      setOpen(false);

      navigate(
        `/formularios-necesidades?apies=${encodeURIComponent(item.apies)}`
      );
    } catch {
      toast({
        title: "Error",
        description: "No se pudo abrir la notificación",
        variant: "destructive",
      });
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        className="relative h-10 w-10 shrink-0 border-white/10 bg-white/5 hover:bg-white/10"
      >
        <Bell className="h-4 w-4" />

        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-emerald-400 text-[11px] font-bold text-slate-950 flex items-center justify-center">
            {items.length > 99 ? "99+" : items.length}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl z-[300] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">
                Notificaciones
              </p>
              <p className="text-xs text-slate-400">
                Formularios nuevos asignados a vos
              </p>
            </div>

            {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!loading && items.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-400 text-center">
                No tenés notificaciones pendientes
              </div>
            )}

            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNotificationClick(item)}
                disabled={markingId === item.id}
                className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-100">
                      APIES Nº {item.apies} llenó el formulario
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  {markingId === item.id && (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}