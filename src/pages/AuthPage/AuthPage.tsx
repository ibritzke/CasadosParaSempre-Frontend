// src/pages/AuthPage.tsx
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import api, { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import { useToast } from "@/components/ui/Toast";
import { wifeTheme } from "@/styles/theme";
import { Divider } from "@/components/ui/Card";
import { createClient } from "@supabase/supabase-js";
import {
  AuthCard,
  CompleteCard,
  CompleteOverlay,
  GoogleBtn,
  InputEl,
  Label,
  Logo,
  PrimaryBtn,
  Screen,
  SelectEl,
  Tab,
  Tabs,
} from "./style";
import { FormGroup } from "@/components/ui";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [completeProfile, setCompleteProfile] = useState<{
    googleId: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [regRole, setRegRole] = useState("");
  const [regSpouse, setRegSpouse] = useState("");
  const [regCode, setRegCode] = useState("");

  // Complete Google profile
  const [cpRole, setCpRole] = useState("");
  const [cpSpouse, setCpSpouse] = useState("");
  const [cpCode, setCpCode] = useState("");

  const { setUser } = useAuthStore();
  const { show } = useToast();
  const navigate = useNavigate();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  // Detecta retorno do Google com perfil incompleto
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("complete") === "true") {
      const pending = localStorage.getItem("cps_google_pending");
      if (pending) {
        setCompleteProfile(JSON.parse(pending));
        localStorage.removeItem("cps_google_pending");
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!loginEmail || !loginPwd) {
      show("Preencha email e senha");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.login(loginEmail, loginPwd);
      setUser(data.user, data.token);
      navigate("/home");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      show(e.response?.data?.error || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPwd || !regRole) {
      show("Preencha todos os campos obrigatórios");
      return;
    }
    if (regPwd.length < 6) {
      show("Senha mínima: 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register({
        name: regName,
        email: regEmail,
        password: regPwd,
        role: regRole,
        spouseName: regSpouse,
        coupleCode: regCode,
      });
      setUser(data.user, data.token);
      navigate("/home");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      show(e.response?.data?.error || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        show("Erro ao conectar com Google");
        setLoading(false);
      }
    } catch {
      show("Erro no login com Google");
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!cpRole || !completeProfile) {
      show("Selecione seu papel no casal");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.completeGoogleProfile({
        ...completeProfile,
        role: cpRole,
        spouseName: cpSpouse,
        coupleCode: cpCode,
      });
      setUser(data.user, data.token);
      navigate("/home");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      show(e.response?.data?.error || "Erro ao completar cadastro");
    } finally {
      setLoading(false);
    }
  };

  const GoogleSvg = () => (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
  
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      show("Digite seu email");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotMsg("Link enviado! Verifique seu email (incluindo spam).");
    } catch {
      show("Erro ao enviar email");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen>
      <Logo>
        <span className="rings">💍</span>
        <h1>Casados Para Sempre</h1>
        <p>Pílula da Semana</p>
      </Logo>

      <AuthCard>
        <Tabs>
          <Tab $active={tab === "login"} onClick={() => setTab("login")}>
            Entrar
          </Tab>
          <Tab $active={tab === "register"} onClick={() => setTab("register")}>
            Cadastrar
          </Tab>
        </Tabs>

        {tab === "login" ? (
          <>
            <FormGroup>
              <Label>Email</Label>
              <InputEl
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Senha</Label>
              <InputEl
                type="password"
                placeholder="••••••••"
                value={loginPwd}
                onChange={(e) => setLoginPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </FormGroup>
            <PrimaryBtn onClick={handleLogin} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </PrimaryBtn>
            <div style={{ textAlign: "right", marginTop: 8, marginBottom: 8 }}>
              <button
                onClick={() => setShowForgot(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8B3A62",
                  fontSize: 13,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Esqueci minha senha
              </button>
            </div>
          </>
        ) : (
          <>
            <FormGroup>
              <Label>Nome completo *</Label>
              <InputEl
                type="text"
                placeholder="Seu nome"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Email *</Label>
              <InputEl
                type="email"
                placeholder="seu@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Senha *</Label>
              <InputEl
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={regPwd}
                onChange={(e) => setRegPwd(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Você é *</Label>
              <SelectEl
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="HUSBAND">Marido</option>
                <option value="WIFE">Esposa</option>
              </SelectEl>
            </FormGroup>
            <FormGroup>
              <Label>Nome do cônjuge</Label>
              <InputEl
                type="text"
                placeholder="Nome do seu cônjuge"
                value={regSpouse}
                onChange={(e) => setRegSpouse(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Código do casal (opcional)</Label>
              <InputEl
                type="text"
                placeholder="Ex: SILVA2024"
                value={regCode}
                onChange={(e) => setRegCode(e.target.value)}
              />
            </FormGroup>
            <PrimaryBtn onClick={handleRegister} disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </PrimaryBtn>
          </>
        )}

        <Divider $theme={wifeTheme}>ou</Divider>
        <GoogleBtn onClick={handleGoogle} disabled={loading}>
          <GoogleSvg /> Continuar com Google
        </GoogleBtn>
      </AuthCard>

      {completeProfile && (
        <CompleteOverlay>
          <CompleteCard>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#5C1F3E",
                marginBottom: 6,
              }}
            >
              Complete seu perfil
            </h2>
            <p style={{ fontSize: 13, color: "#7A5C68", marginBottom: 20 }}>
              Bem-vindo, {completeProfile.name}! Só mais algumas informações.
            </p>
            <FormGroup>
              <Label>Você é *</Label>
              <SelectEl
                value={cpRole}
                onChange={(e) => setCpRole(e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="HUSBAND">Marido</option>
                <option value="WIFE">Esposa</option>
              </SelectEl>
            </FormGroup>
            <FormGroup>
              <Label>Nome do cônjuge</Label>
              <InputEl
                type="text"
                placeholder="Nome do seu cônjuge"
                value={cpSpouse}
                onChange={(e) => setCpSpouse(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Código do casal (opcional)</Label>
              <InputEl
                type="text"
                placeholder="Ex: SILVA2024"
                value={cpCode}
                onChange={(e) => setCpCode(e.target.value)}
              />
            </FormGroup>
            <PrimaryBtn onClick={handleCompleteProfile} disabled={loading}>
              {loading ? "Salvando..." : "Continuar 💕"}
            </PrimaryBtn>
          </CompleteCard>
        </CompleteOverlay>
      )}
      {showForgot && (
        <CompleteOverlay onClick={() => setShowForgot(false)}>
          <CompleteCard onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#5C1F3E",
                marginBottom: 8,
              }}
            >
              Redefinir senha
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#7A5C68",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
            {forgotMsg && (
              <div
                style={{
                  background: "#DCFCE7",
                  color: "#16A34A",
                  padding: "10px 14px",
                  borderRadius: 10,
                  marginBottom: 14,
                  fontSize: 13,
                }}
              >
                {forgotMsg}
              </div>
            )}
            <FormGroup>
              <Label>Email</Label>
              <InputEl
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </FormGroup>
            <PrimaryBtn onClick={handleForgotPassword} disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de redefinição"}
            </PrimaryBtn>
            <button
              onClick={() => setShowForgot(false)}
              style={{
                width: "100%",
                marginTop: 10,
                padding: 12,
                background: "none",
                border: "none",
                color: "#7A5C68",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </CompleteCard>
        </CompleteOverlay>
      )}
    </Screen>
  );
}
