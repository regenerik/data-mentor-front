import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Lock, Mail, Loader2, Zap, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authStore, authActions, LoginCredentials } from "../store";

export default function LogIn() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [authState, setAuthState] = useState(authStore.getState());
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState(authStore.getState());
    };

    authStore.addChangeListener(handleAuthChange);

    return () => {
      authStore.removeChangeListener(handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [authState.isAuthenticated, navigate]);

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      return;
    }

    try {
      await authActions.login(credentials);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const isFormValid = credentials.email && credentials.password;

  return (
    <div className="login-root">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Subtle grid overlay */}
      <div className="grid-overlay" />

      {/* Center container */}
      <main className="login-main">

        {/* Brand header */}
        <header className="login-header">
          <div className="brand-pill">
            <Brain className="brand-pill-icon" />
            <span>Data Mentor</span>
          </div>
          <h1 className="login-title">Bienvenid@ de vuelta</h1>
          <p className="login-subtitle">
            Ingresá tus credenciales para acceder al dashboard de analytics
          </p>
        </header>

        {/* Card */}
        <div className="login-card">
          {/* Card top accent bar */}
          <div className="card-accent-bar" />

          {/* Card inner */}
          <div className="card-body">

            {/* Lock icon */}
            <div className="card-icon-wrap">
              <ShieldCheck className="card-icon" />
            </div>

            <h2 className="card-title">Acceso Seguro</h2>
            <p className="card-desc">
              Proporcioná tus credenciales para continuar
            </p>

            <form onSubmit={handleSubmit} className="login-form" noValidate>

              {/* Email */}
              <div className={`field-group ${focusedField === "email" ? "field-focused" : ""}`}>
                <Label htmlFor="email" className="field-label">
                  Correo electrónico
                </Label>
                <div className="field-input-wrap">
                  <Mail className="field-icon" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.email@ejemplo.com"
                    value={credentials.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="field-input"
                    required
                    disabled={authState.isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className={`field-group ${focusedField === "password" ? "field-focused" : ""}`}>
                <Label htmlFor="password" className="field-label">
                  Contraseña
                </Label>
                <div className="field-input-wrap">
                  <Lock className="field-icon" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={credentials.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="field-input field-input-password"
                    required
                    disabled={authState.isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword
                      ? <EyeOff className="toggle-password-icon" />
                      : <Eye className="toggle-password-icon" />
                    }
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {authState.error && (
                <div className="error-banner" role="alert">
                  <span className="error-dot" />
                  <p className="error-text">{authState.error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="submit-btn"
                disabled={authState.isLoading || !isFormValid}
              >
                {authState.isLoading ? (
                  <span className="btn-inner">
                    <Loader2 className="btn-spinner" />
                    Autenticando...
                  </span>
                ) : (
                  <span className="btn-inner">
                    <Zap className="btn-icon" />
                    Acceder al Dashboard
                  </span>
                )}
              </Button>

              {/* Helper text */}
              <p className="form-hint">
                Para obtener tus credenciales, contactá al administrador.
              </p>
            </form>
          </div>
        </div>

        {/* Loading indicator below card */}
        {authState.isLoading && (
          <div className="loading-bar-wrap" aria-live="polite">
            <div className="loading-bar">
              <div className="loading-bar-fill" />
            </div>
            <span className="loading-text">Conectando al servidor seguro…</span>
          </div>
        )}

      </main>

      <style>{`
        /* ─── Reset / Root ─────────────────────────────────── */
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #07080f;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* ─── Ambient orbs ─────────────────────────────────── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          animation: orb-float 8s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 420px; height: 420px;
          top: -100px; left: -80px;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
          animation-delay: 0s;
        }
        .orb-2 {
          width: 500px; height: 500px;
          bottom: -120px; right: -100px;
          background: radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%);
          animation-delay: -3s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          top: 50%; left: 55%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%);
          animation-delay: -6s;
        }
        @keyframes orb-float {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -30px) scale(1.05); }
        }
        .orb-3 { animation-name: orb-float-center; }
        @keyframes orb-float-center {
          from { transform: translate(-50%, -50%) scale(1); }
          to   { transform: translate(-50%, calc(-50% - 20px)) scale(1.08); }
        }

        /* ─── Grid overlay ─────────────────────────────────── */
        .grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.03;
          background-image:
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ─── Main layout ──────────────────────────────────── */
        .login-main {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 24px 16px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        /* ─── Header ───────────────────────────────────────── */
        .login-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #a5b4fc;
          letter-spacing: 0.01em;
        }
        .brand-pill-icon {
          width: 15px; height: 15px;
          color: #818cf8;
        }

        .login-title {
          font-size: clamp(1.6rem, 5vw, 2rem);
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
        }

        .login-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
          max-width: 320px;
        }

        /* ─── Card ─────────────────────────────────────────── */
        .login-card {
          width: 100%;
          background: rgba(8,10,20,0.96);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.08),
            0 24px 64px rgba(0,0,0,0.5),
            0 4px 16px rgba(0,0,0,0.3);
          overflow: hidden;
          position: relative;
        }

        .card-accent-bar {
          height: 3px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #3b82f6);
          border-radius: 3px 3px 0 0;
        }

        .card-body {
          padding: 32px 28px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .card-icon-wrap {
          width: 48px; height: 48px;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .card-icon {
          width: 22px; height: 22px;
          color: #818cf8;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 6px;
          text-align: center;
        }
        .card-desc {
          font-size: 13px;
          color: #94a3b8;
          margin: 0 0 28px;
          text-align: center;
        }

        /* ─── Form ─────────────────────────────────────────── */
        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ─── Field ────────────────────────────────────────── */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #cbd5e1;
          letter-spacing: 0.01em;
          transition: color 0.2s;
        }
        .field-focused .field-label {
          color: #a5b4fc;
        }

        .field-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 13px;
          width: 15px; height: 15px;
          color: #94a3b8;
          pointer-events: none;
          z-index: 1;
          transition: color 0.2s;
        }
        .field-focused .field-icon {
          color: #818cf8;
        }

        .field-input {
          width: 100%;
          height: 44px;
          padding-left: 40px !important;
          padding-right: 14px !important;
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.14) !important;
          border-radius: 10px !important;
          color: #e2e8f0 !important;
          font-size: 14px !important;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s !important;
          outline: none !important;
        }
        .field-input::placeholder {
          color: #94a3b8 !important;
        }
        .field-input:focus {
          background: rgba(99,102,241,0.06) !important;
          border-color: rgba(99,102,241,0.45) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        }
        .field-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .field-input-password {
          padding-right: 42px !important;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
        }
        .toggle-password:hover {
          color: #a5b4fc;
          background: rgba(99,102,241,0.1);
        }
        .toggle-password-icon {
          width: 15px; height: 15px;
        }

        /* ─── Error banner ─────────────────────────────────── */
        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          animation: fade-in 0.25s ease;
        }
        .error-dot {
          flex-shrink: 0;
          margin-top: 5px;
          width: 7px; height: 7px;
          background: #ef4444;
          border-radius: 50%;
        }
        .error-text {
          font-size: 13px;
          color: #fca5a5;
          margin: 0;
          line-height: 1.5;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── Submit button ────────────────────────────────── */
        .submit-btn {
          width: 100%;
          height: 46px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
          border: none !important;
          border-radius: 11px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          color: #fff !important;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s !important;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3) !important;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.45) !important;
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.72 !important;
          cursor: not-allowed;
          box-shadow: none !important;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-spinner {
          width: 16px; height: 16px;
          animation: spin 0.8s linear infinite;
        }
        .btn-icon {
          width: 15px; height: 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ─── Form hint ────────────────────────────────────── */
        .form-hint {
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }

        /* ─── Loading bar ──────────────────────────────────── */
        .loading-bar-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          width: 100%;
        }
        .loading-bar {
          width: 100%;
          height: 2px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }
        .loading-bar-fill {
          height: 100%;
          width: 40%;
          background: linear-gradient(90deg, transparent, #818cf8, transparent);
          border-radius: 2px;
          animation: loading-slide 1.4s ease-in-out infinite;
        }
        @keyframes loading-slide {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
        .loading-text {
          font-size: 12px;
          color: #94a3b8;
          letter-spacing: 0.01em;
        }

        /* ─── Responsive ───────────────────────────────────── */
        @media (max-width: 480px) {
          .card-body { padding: 24px 18px 22px; }
          .login-main { padding: 16px 12px 32px; }
        }
      `}</style>
    </div>
  );
}