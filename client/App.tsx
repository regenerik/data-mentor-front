import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LogIn from "./pages/LogIn";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ChatDataMentor from "./pages/ChatDataMentor";
import NecesidadesApies from "./pages/NecesidadesApies";
import ChatDataMentorCursos from "./pages/ChatDataMentorCursos";
import AjustesAdministrador from "./pages/AjustesAdministrador";
import History from "./pages/History";
import MyProfile from "./pages/MyProfile";
import { authStore } from "./store";

const queryClient = new QueryClient();


// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState(authStore.getState());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState(authStore.getState());
    };

    authStore.addChangeListener(handleAuthChange);

    return () => {
      authStore.removeChangeListener(handleAuthChange);
    };
  }, []);

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LogIn />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-data-mentor"
            element={
              <ProtectedRoute>
                <ChatDataMentor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/necesidades-apies"
            element={
              <ProtectedRoute>
                <NecesidadesApies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-data-mentor-cursos"
            element={
              <ProtectedRoute>
                <ChatDataMentorCursos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ajustes-administrador"
            element={
              <ProtectedRoute>
                <AjustesAdministrador />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
                    <Route
            path="/mi-perfil"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
