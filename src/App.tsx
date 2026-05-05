// src/App.tsx
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { ToastProvider } from "@/components/ui/Toast";
import { Layout } from "@/components/layout/Layout";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/services/api";

import AuthPage from "@/pages/AuthPage/AuthPage";
import HomePage from "@/pages/HomePage";
import PillPage from "@/pages/PillPage";
import RecordsPage from "@/pages/RecordsPage";
import CalendarPage from "@/pages/CalendarPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage/AdminPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DevotionalPage from "./pages/DevotionalPage";

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html, body, #root {
    height: 100%;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    background: #f0f0f0;
  }

  input, select, textarea, button { font-family: 'DM Sans', sans-serif; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
`;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/auth" replace />;
  if (!user.isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

// Refreshes user data on app load
function AppInit() {
  const { user, setUser, token, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !user) return;
    authApi
      .me()
      .then(({ data }) => setUser(data.user, token))
      .catch(() => {
        logout();
        navigate("/auth");
      });
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <ToastProvider>
        <AppInit />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <AuthPage />
              </AuthRoute>
            }
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <HomePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pill"
            element={
              <ProtectedRoute>
                <Layout>
                  <PillPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/records"
            element={
              <ProtectedRoute>
                <Layout>
                  <RecordsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Layout>
                  <CalendarPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/devotional"
            element={
              <ProtectedRoute>
                <Layout>
                  <DevotionalPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout>
                  <AdminPage />
                </Layout>
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
