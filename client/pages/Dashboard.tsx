import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  FileSpreadsheet,
  ArrowRight,
  FilePlus,
  Brain,
  User,
  ClipboardList,
  LogOut,
  GraduationCap,
  Settings,
  Users,
  Zap,
  FileText,
  ChevronDown,
} from "lucide-react";
import { authActions } from "../store";
import NotificationsBell from "@/components/ui/NotificationsBell";

/* ─── Parallax hook ─────────────────────────────────────────── */
function useParallax() {
  const ref = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      ref.current = { x, y };
      setPos({ x, y });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return pos;
}

/* ─── Scroll-reveal hook ────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Tool card data ────────────────────────────────────────── */
const TOOLS = [
  {
    key: "course_creator",
    icon: GraduationCap,
    label: "Creador de Cursos con I.A.",
    desc: "Asistente interactivo para crear cursos empresariales con ayuda contextual, mejora de material y orientación personalizada.",
    tags: ["Contextos", "Asistencia de uso"],
    tagIcons: [Brain, GraduationCap],
    route: "/chat-data-mentor-cursos",
    btnLabel: "Crea tu curso",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
  },
  {
    key: "needs_apies",
    icon: FileSpreadsheet,
    label: "Necesidades APIES",
    desc: "Procesá archivos Excel con comentarios de estaciones de servicio. Clasificá, filtrá y extraé insights con análisis de sentimientos.",
    tags: ["Análisis Excel", "Filtros avanzados", "Clasificación automática"],
    tagIcons: null,
    tagColors: ["#60a5fa", "#34d399", "#a78bfa"],
    route: "/necesidades-apies",
    btnLabel: "Abrir herramienta",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.15)",
  },
  {
    key: "chat_data_mentor",
    icon: MessageCircle,
    label: "Chat Data Mentor",
    desc: "Asistente conversacional inteligente para análisis en tiempo real, generación de insights y NLP avanzado.",
    tags: ["Tiempo real", "Potenciado con IA"],
    tagIcons: [Zap, Brain],
    route: "/chat-data-mentor",
    btnLabel: "En construcción",
    accent: "#60a5fa",
    glow: "rgba(96,165,250,0.15)",
  },
  {
    key: "talent_management",
    icon: Users,
    label: "Gestión de Talento (RRHH)",
    desc: "Encontrá personas por habilidades en la base de CVs y gestioná cargas masivas de currículums.",
    tags: ["Búsqueda rápida", "Carga masiva PDF/DOCX/TXT"],
    tagColors: ["#fbbf24", "#fcd34d"],
    tagIcons: null,
    route: "/recursos",
    btnLabel: "Ir a RRHH",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    key: "presentations",
    icon: FilePlus,
    label: "Presentaciones",
    desc: "Generá presentaciones automáticamente desde una descripción o archivo adjunto con IA.",
    tags: ["Creación rápida", "Archivos adjuntos"],
    tagColors: ["#60a5fa", "#a78bfa"],
    tagIcons: null,
    route: "/presentaciones",
    btnLabel: "Ir a Presentaciones",
    accent: "#818cf8",
    glow: "rgba(129,140,248,0.15)",
  },
  {
    key: "recommendations_form",
    icon: FileText,
    label: "Recomendaciones de Cursos",
    desc: "Completá un formulario de evaluación de una APIES para obtener recomendaciones de cursos personalizadas.",
    tags: ["Evaluación personalizada", "Recomendaciones de cursos"],
    tagIcons: [Zap, GraduationCap],
    route: "/formularios-necesidades",
    btnLabel: "Comenzar",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.15)",
  },
  {
    key: "__admin__",
    icon: Settings,
    label: "Ajustes de Administrador",
    desc: "Panel completo para gestionar usuarios, configurar seguridad, monitorear base de datos y controlar el sistema.",
    tags: ["Permisos", "Configuraciones", "Seguridad"],
    tagColors: ["#60a5fa", "#34d399", "#a78bfa"],
    tagIcons: null,
    route: "/ajustes-administrador",
    btnLabel: "Abrir Configuraciones",
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.15)",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Inteligencia artificial",
    desc: "Algoritmos de machine learning para interpretar datos con precisión.",
    color: "#a78bfa",
  },
  {
    icon: Zap,
    title: "Procesamiento en tiempo real",
    desc: "Análisis instantáneo para obtener resultados al momento.",
    color: "#facc15",
  },
  {
    icon: FileSpreadsheet,
    title: "Integración de datos",
    desc: "Integración fluida con archivos Excel y filtros personalizados.",
    color: "#34d399",
  },
];

/* ─── Main component ────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const parallax = useParallax();
  useReveal();

  const isAdmin = JSON.parse(localStorage.getItem("admin") || "false");

  const permissions: string[] = (() => {
    try {
      const raw = localStorage.getItem("permissions");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const can = (sectorKey: string) =>
    sectorKey === "__admin__" ? isAdmin : isAdmin || permissions.includes(sectorKey);

  const handlerLogOut = () => {
    authActions.logout();
    navigate("/expired-token");
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        handlerLogOut();
        return;
      }
      try {
        const response = await fetch("https://dm-back-fn4l.onrender.com/check_token", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) handlerLogOut();
      } catch {
        handlerLogOut();
      }
    };
    checkTokenValidity();
  }, [navigate]);

  const visibleTools = TOOLS.filter((t) => can(t.key));

  return (
    <div className="db-root">
      {/* ── Parallax background layer ── */}
      <div
        className="db-bg"
        style={{
          transform: `translate(${parallax.x * -18}px, ${parallax.y * -18}px)`,
        }}
      >
        <div className="db-orb db-orb-1" style={{ transform: `translate(${parallax.x * 30}px, ${parallax.y * 30}px)` }} />
        <div className="db-orb db-orb-2" style={{ transform: `translate(${parallax.x * -22}px, ${parallax.y * -22}px)` }} />
        <div className="db-orb db-orb-3" style={{ transform: `translate(${parallax.x * 15}px, ${parallax.y * 40}px)` }} />
        <div className="db-orb db-orb-4" style={{ transform: `translate(${parallax.x * -35}px, ${parallax.y * 20}px)` }} />
        <div className="db-grid" />
      </div>

      {/* ── Topbar ── */}
      <nav className="db-nav">
        <div className="db-nav-inner">
          <div className="db-nav-brand">
            <div className="db-nav-logo">
              <Brain className="db-nav-logo-icon" />
            </div>
            <span className="db-nav-name">Data Mentor</span>
          </div>

          <div className="db-nav-actions">
            <button className="db-nav-btn" onClick={() => navigate("/mi-perfil")}>
              <User className="db-nav-btn-icon" />
              <span>Mi Perfil</span>
            </button>
            <button className="db-nav-btn" onClick={() => navigate("/forms")}>
              <ClipboardList className="db-nav-btn-icon" />
              <span>Formularios</span>
            </button>
            {can("recommendations_form") && <NotificationsBell />}
            <button className="db-nav-btn db-nav-btn-danger" onClick={handlerLogOut}>
              <LogOut className="db-nav-btn-icon" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="db-hero">
        <div className="db-hero-inner">
          <div className="db-hero-badge reveal">
            <span className="db-hero-badge-dot" />
            Plataforma activa
          </div>

          <h1 className="db-hero-title reveal">
            Herramientas
            <br />
            <span className="db-hero-title-gradient">Data Mentor</span>
          </h1>

          <p className="db-hero-sub reveal">
            Plataforma avanzada para análisis de datos e insights de clientes,
            diseñada para operaciones en estaciones de servicio.
          </p>

          <a href="#tools" className="db-hero-scroll reveal">
            <ChevronDown className="db-hero-scroll-icon" />
          </a>
        </div>

        {/* Floating hero stat cards */}
        <div
          className="db-hero-float db-hero-float-1 reveal"
          style={{ transform: `translate(${parallax.x * -12}px, ${parallax.y * -8}px)` }}
        >
          <Zap className="db-hf-icon" style={{ color: "#facc15" }} />
          <span>Análisis IA</span>
        </div>
        <div
          className="db-hero-float db-hero-float-2 reveal"
          style={{ transform: `translate(${parallax.x * 10}px, ${parallax.y * 12}px)` }}
        >
          <Brain className="db-hf-icon" style={{ color: "#a78bfa" }} />
          <span>Machine Learning</span>
        </div>
      </section>

      {/* ── Tools grid ── */}
      <section id="tools" className="db-tools-section">
        <div className="db-tools-header reveal">
          <h2 className="db-tools-heading">Tus herramientas</h2>
          <p className="db-tools-sub">Seleccioná una herramienta para comenzar</p>
        </div>

        <div className="db-grid-tools">
          {visibleTools.map((tool, i) => (
            <ToolCard key={tool.key} tool={tool} index={i} navigate={navigate} />
          ))}
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="db-features-section">
        <h2 className="db-features-heading reveal">Potenciado por tecnología avanzada</h2>
        <div className="db-features-grid">
          {FEATURES.map((f, i) => (
            <div className="db-feature-card reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="db-feature-icon-wrap" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                <f.icon className="db-feature-icon" style={{ color: f.color }} />
              </div>
              <h3 className="db-feature-title">{f.title}</h3>
              <p className="db-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="db-footer">
        <Brain className="db-footer-icon" />
        <span>Data Mentor Tools © {new Date().getFullYear()}</span>
      </footer>

      <style>{`
        /* ─── Root ─────────────────────────────────────────────── */
        .db-root {
          min-height: 100vh;
          background: #06070f;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* ─── Parallax BG ──────────────────────────────────────── */
        .db-bg {
          position: fixed;
          inset: -10%;
          pointer-events: none;
          z-index: 0;
          transition: transform 0.08s linear;
        }
        .db-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          transition: transform 0.12s linear;
        }
        .db-orb-1 {
          width: 600px; height: 600px;
          top: -10%; left: -5%;
          background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%);
          animation: orb-drift 14s ease-in-out infinite alternate;
        }
        .db-orb-2 {
          width: 700px; height: 700px;
          bottom: -15%; right: -10%;
          background: radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 65%);
          animation: orb-drift 18s ease-in-out infinite alternate-reverse;
        }
        .db-orb-3 {
          width: 400px; height: 400px;
          top: 40%; left: 45%;
          background: radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 65%);
          animation: orb-drift 22s ease-in-out infinite alternate;
        }
        .db-orb-4 {
          width: 350px; height: 350px;
          top: 60%; left: 10%;
          background: radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 65%);
          animation: orb-drift 16s ease-in-out infinite alternate-reverse;
        }
        @keyframes orb-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, -50px) scale(1.08); }
        }
        .db-grid {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          background-image:
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        /* ─── Reveal animation ─────────────────────────────────── */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1);
        }
        .revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* ─── Nav ──────────────────────────────────────────────── */
        .db-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(6,7,15,0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .db-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .db-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .db-nav-logo {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .db-nav-logo-icon {
          width: 18px; height: 18px;
          color: #fff;
        }
        .db-nav-name {
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.01em;
        }
        .db-nav-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .db-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .db-nav-btn:hover {
          background: rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }
        .db-nav-btn-danger:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.25);
          color: #fca5a5;
        }
        .db-nav-btn-icon {
          width: 14px; height: 14px;
        }
        @media (max-width: 540px) {
          .db-nav-btn span { display: none; }
          .db-nav-btn { padding: 8px; }
          .db-nav-btn-icon { width: 16px; height: 16px; }
        }

        /* ─── Hero ─────────────────────────────────────────────── */
        .db-hero {
          position: relative;
          z-index: 1;
          min-height: 88vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 60px;
          overflow: hidden;
        }
        .db-hero-inner {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          max-width: 700px;
        }
        .db-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #34d399;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          animation-delay: 0.0s;
        }
        .db-hero-badge-dot {
          width: 7px; height: 7px;
          background: #34d399;
          border-radius: 50%;
          animation: pulse-dot 1.8s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(0.7); }
        }
        .db-hero-title {
          font-size: clamp(2.8rem, 9vw, 5.5rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: #f8fafc;
          margin: 0;
          animation-delay: 0.1s;
        }
        .db-hero-title-gradient {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 40%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hue-shift 6s linear infinite;
          display: inline-block;
        }
        @keyframes hue-shift {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(30deg); }
        }
        .db-hero-sub {
          font-size: clamp(1rem, 2.5vw, 1.15rem);
          color: #475569;
          line-height: 1.7;
          max-width: 520px;
          margin: 0;
          animation-delay: 0.2s;
        }
        .db-hero-scroll {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px; height: 40px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          color: #475569;
          text-decoration: none;
          margin-top: 12px;
          animation: bounce-down 2.2s ease-in-out infinite, reveal-fade 0.65s 0.3s both;
          transition: border-color 0.2s, color 0.2s;
        }
        .db-hero-scroll:hover {
          border-color: rgba(129,140,248,0.4);
          color: #818cf8;
        }
        @keyframes bounce-down {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(7px); }
        }
        @keyframes reveal-fade {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
        .db-hero-scroll-icon { width: 18px; height: 18px; }

        /* Floating cards */
        .db-hero-float {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(15,17,28,0.8);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          backdrop-filter: blur(16px);
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          transition: transform 0.12s linear;
          pointer-events: none;
          animation-delay: 0.4s;
        }
        .db-hero-float-1 { top: 22%; left: 6%; }
        .db-hero-float-2 { top: 30%; right: 6%; }
        .db-hf-icon { width: 16px; height: 16px; }
        @media (max-width: 768px) {
          .db-hero-float { display: none; }
        }

        /* ─── Tools section ────────────────────────────────────── */
        .db-tools-section {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }
        .db-tools-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .db-tools-heading {
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.03em;
          margin: 0 0 8px;
        }
        .db-tools-sub {
          color: #475569;
          font-size: 15px;
          margin: 0;
        }
        .db-grid-tools {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        @media (max-width: 660px) {
          .db-grid-tools { grid-template-columns: 1fr; }
        }

        /* ─── Tool card ────────────────────────────────────────── */
        .tool-card {
          position: relative;
          background: rgba(13,15,25,0.75);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          overflow: hidden;
          backdrop-filter: blur(18px);
          transition: transform 0.3s cubic-bezier(.22,1,.36,1),
                      border-color 0.3s,
                      box-shadow 0.3s;
          cursor: default;
          display: flex;
          flex-direction: column;
        }
        .tool-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .tool-card-top-bar {
          height: 3px;
          width: 100%;
          border-radius: 18px 18px 0 0;
          background: linear-gradient(90deg, var(--accent), transparent 80%);
          opacity: 0.8;
          transition: opacity 0.3s;
        }
        .tool-card:hover .tool-card-top-bar { opacity: 1; }

        .tool-card-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s;
          background: radial-gradient(ellipse at 30% 0%, var(--glow) 0%, transparent 70%);
        }
        .tool-card:hover .tool-card-glow { opacity: 1; }

        .tool-card-body {
          padding: 24px 22px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }

        .tool-card-icon-wrap {
          width: 46px; height: 46px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--accent-rgb), 0.12);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          flex-shrink: 0;
          transition: background 0.3s, transform 0.3s;
        }
        .tool-card:hover .tool-card-icon-wrap {
          background: rgba(var(--accent-rgb), 0.2);
          transform: rotate(-4deg) scale(1.1);
        }
        .tool-card-icon {
          width: 22px; height: 22px;
        }

        .tool-card-label {
          font-size: 1.05rem;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: -0.02em;
          margin: 0;
          transition: color 0.2s;
        }
        .tool-card:hover .tool-card-label {
          color: var(--accent);
        }

        .tool-card-desc {
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }

        .tool-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }
        .tool-tag {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid;
          opacity: 0.8;
        }
        .tool-tag-icon { width: 11px; height: 11px; }

        .tool-card-footer {
          padding: 0 22px 22px;
        }
        .tool-card-btn {
          width: 100%;
          height: 42px;
          border-radius: 10px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          letter-spacing: 0.01em;
          background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #a855f7)) !important;
          border: none !important;
          color: #fff !important;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s !important;
          box-shadow: 0 4px 18px color-mix(in srgb, var(--accent) 35%, transparent) !important;
        }
        .tool-card-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 8px 30px color-mix(in srgb, var(--accent) 50%, transparent) !important;
        }
        .tool-card-btn:active { transform: translateY(0); }
        .tool-btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .tool-btn-arrow { width: 14px; height: 14px; transition: transform 0.2s; }
        .tool-card-btn:hover .tool-btn-arrow { transform: translateX(3px); }

        /* ─── Features ─────────────────────────────────────────── */
        .db-features-section {
          position: relative;
          z-index: 1;
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px 80px;
        }
        .db-features-heading {
          text-align: center;
          font-size: clamp(1.3rem, 3.5vw, 1.8rem);
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.03em;
          margin: 0 0 40px;
        }
        .db-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }
        .db-feature-card {
          padding: 28px 22px;
          background: rgba(13,15,25,0.65);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          backdrop-filter: blur(12px);
          transition: transform 0.3s, border-color 0.3s;
        }
        .db-feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.1);
        }
        .db-feature-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .db-feature-icon { width: 24px; height: 24px; }
        .db-feature-title {
          font-size: 15px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .db-feature-desc {
          font-size: 13px;
          color: #475569;
          margin: 0;
          line-height: 1.6;
        }

        /* ─── Footer ───────────────────────────────────────────── */
        .db-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          border-top: 1px solid rgba(255,255,255,0.04);
          color: #1e293b;
          font-size: 12px;
        }
        .db-footer-icon { width: 14px; height: 14px; }
      `}</style>
    </div>
  );
}

/* ─── ToolCard sub-component ──────────────────────────────────────── */
function ToolCard({
  tool,
  index,
  navigate,
}: {
  tool: (typeof TOOLS)[0];
  index: number;
  navigate: ReturnType<typeof useNavigate>;
}) {
  // Convert hex color to rgb for CSS vars
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };

  const tagColors = (tool as any).tagColors;

  const handleClick = () => {
    navigate(tool.route);
  };

  return (
    <div
      className="tool-card reveal"
      style={
        {
          "--accent": tool.accent,
          "--accent-rgb": hexToRgb(tool.accent),
          "--glow": tool.glow,
          animationDelay: `${index * 0.06}s`,
        } as React.CSSProperties
      }
    >
      <div className="tool-card-top-bar" />
      <div className="tool-card-glow" />

      <div className="tool-card-body">
        {/* Icon */}
        <div className="tool-card-icon-wrap">
          <tool.icon className="tool-card-icon" style={{ color: tool.accent }} />
        </div>

        {/* Label */}
        <h3 className="tool-card-label">{tool.label}</h3>

        {/* Description */}
        <p className="tool-card-desc">{tool.desc}</p>

        {/* Tags */}
        <div className="tool-card-tags">
          {tool.tags.map((tag, ti) => {
            const color = tagColors ? tagColors[ti] : tool.accent;
            const Icon = tool.tagIcons?.[ti];
            return (
              <span
                key={ti}
                className="tool-tag"
                style={{
                  color,
                  borderColor: `${color}30`,
                  background: `${color}0d`,
                }}
              >
                {Icon && <Icon className="tool-tag-icon" />}
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="tool-card-footer">
        {tool.route !== "/formularios-necesidades" ? (
          <Link to={tool.route}>
            <Button className="tool-card-btn">
              <span className="tool-btn-inner">
                {tool.btnLabel}
                <ArrowRight className="tool-btn-arrow" />
              </span>
            </Button>
          </Link>
        ) : (
          <Button className="tool-card-btn" onClick={handleClick}>
            <span className="tool-btn-inner">
              {tool.btnLabel}
              <ArrowRight className="tool-btn-arrow" />
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}