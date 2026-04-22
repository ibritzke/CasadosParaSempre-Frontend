import { useEffect } from "react";
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

  useEffect(() => {
    // Aguarda o Supabase processar o hash da URL
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        subscription.unsubscribe();
        try {
          const resp = await authApi.googleAuth(session.access_token);
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
        } catch {
          navigate("/auth");
        }
      } else if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    // Timeout de segurança — se não autenticar em 10s, volta para auth
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      navigate("/auth");
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#FDF8F4",
          fontFamily: "DM Sans, sans-serif",
          color: "#8B3A62",
          fontSize: 16,
        }}
      >
        Conectando com Google... 💕
      </div>
      <div>{status}</div>
    </>
  );
}
