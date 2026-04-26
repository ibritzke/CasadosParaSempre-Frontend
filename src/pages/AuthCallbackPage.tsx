import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState("Conectando com Google... 💕");

  useEffect(() => {
    let handled = false;

    const processSession = async (accessToken: string) => {
      if (handled) return;
      handled = true;

      setStatus("Verificando sua conta... 💕");
      try {
        const resp = await authApi.googleAuth(accessToken);
        if (resp.status === 206) {
          localStorage.setItem(
            "cps_google_pending",
            JSON.stringify(resp.data),
          );
          navigate("/auth?complete=true");
        } else {
          setUser(resp.data.user, resp.data.token);
          navigate("/home");
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string }; status?: number } };
        const msg = e.response?.data?.error || "Erro ao autenticar com Google";
        setStatus(`❌ ${msg}`);
        setTimeout(() => navigate("/auth"), 3000);
      }
    };

    // First try: check if there's already a session (hash fragment from Supabase redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        processSession(session.access_token);
      }
    });

    // Second try: listen for auth state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        subscription.unsubscribe();
        processSession(session.access_token);
      } else if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    // Timeout de segurança — aumentado para 30s (Railway pode ter cold start)
    const timeout = setTimeout(() => {
      if (!handled) {
        subscription.unsubscribe();
        setStatus("⏱️ Tempo esgotado. Redirecionando...");
        setTimeout(() => navigate("/auth"), 1500);
      }
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#FDF8F4",
        fontFamily: "DM Sans, sans-serif",
        color: "#8B3A62",
        fontSize: 16,
        gap: 16,
      }}
    >
      {/* Spinner */}
      {!status.startsWith("❌") && !status.startsWith("⏱️") && (
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #F0E4EC",
            borderTop: "3px solid #8B3A62",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <span>{status}</span>
      {(status.startsWith("❌") || status.startsWith("⏱️")) && (
        <button
          onClick={() => navigate("/auth")}
          style={{
            marginTop: 8,
            padding: "10px 24px",
            background: "#8B3A62",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Voltar ao login
        </button>
      )}
    </div>
  );
}
