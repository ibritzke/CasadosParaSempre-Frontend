// src/pages/AuthPage.tsx
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/components/ui/Toast'
import { wifeTheme } from '@/styles/theme'
import { Divider } from '@/components/ui/Card'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`

const Screen = styled.div`
  min-height: 100%;
  background: linear-gradient(160deg, #5C1F3E 0%, #8B3A62 55%, #C4709A 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 40px;
  max-width: 430px;
  margin: 0 auto;
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.5s ease;

  .rings { font-size: 56px; display: block; margin-bottom: 14px; }
  h1 { font-family: 'Playfair Display', serif; color: #fff; font-size: 26px; font-weight: 600; line-height: 1.2; }
  p { color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 6px; }
`

const AuthCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 28px 24px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
  animation: ${fadeIn} 0.5s ease 0.1s both;
`

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: #F5E6EE;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
`

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$active ? '#fff' : 'transparent'};
  color: ${p => p.$active ? '#8B3A62' : '#7A5C68'};
  box-shadow: ${p => p.$active ? '0 2px 8px rgba(139,58,98,0.08)' : 'none'};
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`

const Label = styled.label`
  font-size: 11px;
  font-weight: 500;
  color: #7A5C68;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const InputEl = styled.input`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid rgba(139,58,98,0.18);
  border-radius: 10px;
  font-size: 15px;
  color: #2A1A1F;
  background: #FDF8F4;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: #8B3A62; }
  &::placeholder { color: #B09AA6; }
`

const SelectEl = styled.select`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid rgba(139,58,98,0.18);
  border-radius: 10px;
  font-size: 15px;
  color: #2A1A1F;
  background: #FDF8F4;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A5C68' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
  &:focus { border-color: #8B3A62; }
`

const PrimaryBtn = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #8B3A62, #5C1F3E);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.18s;
  margin-top: 6px;
  &:active { opacity: 0.85; transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const GoogleBtn = styled.button`
  width: 100%;
  padding: 13px;
  background: #fff;
  border: 1.5px solid rgba(139,58,98,0.18);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background 0.2s;
  margin-top: 10px;
  &:hover { background: #FDF8F4; }
`

// Complete profile modal (after Google login)
const CompleteOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(44,10,25,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 24px;
`

const CompleteCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 380px;
`

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [completeProfile, setCompleteProfile] = useState<{googleId:string;name:string;email:string;avatarUrl?:string} | null>(null)

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd, setLoginPwd] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPwd, setRegPwd] = useState('')
  const [regRole, setRegRole] = useState('')
  const [regSpouse, setRegSpouse] = useState('')
  const [regCode, setRegCode] = useState('')

  // Complete Google profile
  const [cpRole, setCpRole] = useState('')
  const [cpSpouse, setCpSpouse] = useState('')
  const [cpCode, setCpCode] = useState('')

  const { setUser } = useAuthStore()
  const { show } = useToast()
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!loginEmail || !loginPwd) { show('Preencha email e senha'); return }
    setLoading(true)
    try {
      const { data } = await authApi.login(loginEmail, loginPwd)
      setUser(data.user, data.token)
      navigate('/home')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      show(e.response?.data?.error || 'Erro ao entrar')
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPwd || !regRole) { show('Preencha todos os campos obrigatórios'); return }
    if (regPwd.length < 6) { show('Senha mínima: 6 caracteres'); return }
    setLoading(true)
    try {
      const { data } = await authApi.register({ name: regName, email: regEmail, password: regPwd, role: regRole, spouseName: regSpouse, coupleCode: regCode })
      setUser(data.user, data.token)
      navigate('/home')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      show(e.response?.data?.error || 'Erro ao cadastrar')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const { data: sbData, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { skipBrowserRedirect: false } })
      if (error || !sbData) { show('Erro ao conectar com Google'); setLoading(false); return }
      // After redirect, user comes back and we get session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) { show('Sessão Google não encontrada'); setLoading(false); return }

      const resp = await authApi.googleAuth(session.access_token)
      if (resp.status === 206) {
        setCompleteProfile(resp.data)
      } else {
        setUser(resp.data.user, resp.data.token)
        navigate('/home')
      }
    } catch {
      show('Erro no login com Google')
    } finally { setLoading(false) }
  }

  const handleCompleteProfile = async () => {
    if (!cpRole || !completeProfile) { show('Selecione seu papel no casal'); return }
    setLoading(true)
    try {
      const { data } = await authApi.completeGoogleProfile({ ...completeProfile, role: cpRole, spouseName: cpSpouse, coupleCode: cpCode })
      setUser(data.user, data.token)
      navigate('/home')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      show(e.response?.data?.error || 'Erro ao completar cadastro')
    } finally { setLoading(false) }
  }

  const GoogleSvg = () => (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  )

  return (
    <Screen>
      <Logo>
        <span className="rings">💍</span>
        <h1>Casados Para Sempre</h1>
        <p>Pílula da Semana</p>
      </Logo>

      <AuthCard>
        <Tabs>
          <Tab $active={tab === 'login'} onClick={() => setTab('login')}>Entrar</Tab>
          <Tab $active={tab === 'register'} onClick={() => setTab('register')}>Cadastrar</Tab>
        </Tabs>

        {tab === 'login' ? (
          <>
            <FormGroup>
              <Label>Email</Label>
              <InputEl type="email" placeholder="seu@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Senha</Label>
              <InputEl type="password" placeholder="••••••••" value={loginPwd} onChange={e => setLoginPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </FormGroup>
            <PrimaryBtn onClick={handleLogin} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</PrimaryBtn>
          </>
        ) : (
          <>
            <FormGroup>
              <Label>Nome completo *</Label>
              <InputEl type="text" placeholder="Seu nome" value={regName} onChange={e => setRegName(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Email *</Label>
              <InputEl type="email" placeholder="seu@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Senha *</Label>
              <InputEl type="password" placeholder="Mínimo 6 caracteres" value={regPwd} onChange={e => setRegPwd(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Você é *</Label>
              <SelectEl value={regRole} onChange={e => setRegRole(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="HUSBAND">Marido</option>
                <option value="WIFE">Esposa</option>
              </SelectEl>
            </FormGroup>
            <FormGroup>
              <Label>Nome do cônjuge</Label>
              <InputEl type="text" placeholder="Nome do seu cônjuge" value={regSpouse} onChange={e => setRegSpouse(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Código do casal (opcional)</Label>
              <InputEl type="text" placeholder="Ex: SILVA2024" value={regCode} onChange={e => setRegCode(e.target.value)} />
            </FormGroup>
            <PrimaryBtn onClick={handleRegister} disabled={loading}>{loading ? 'Criando conta...' : 'Criar conta'}</PrimaryBtn>
          </>
        )}

        <Divider $theme={wifeTheme}>ou</Divider>
        <GoogleBtn onClick={handleGoogle} disabled={loading}><GoogleSvg /> Continuar com Google</GoogleBtn>
      </AuthCard>

      {completeProfile && (
        <CompleteOverlay>
          <CompleteCard>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#5C1F3E', marginBottom: 6 }}>Complete seu perfil</h2>
            <p style={{ fontSize: 13, color: '#7A5C68', marginBottom: 20 }}>Bem-vindo, {completeProfile.name}! Só mais algumas informações.</p>
            <FormGroup>
              <Label>Você é *</Label>
              <SelectEl value={cpRole} onChange={e => setCpRole(e.target.value)}>
                <option value="">Selecione...</option>
                <option value="HUSBAND">Marido</option>
                <option value="WIFE">Esposa</option>
              </SelectEl>
            </FormGroup>
            <FormGroup>
              <Label>Nome do cônjuge</Label>
              <InputEl type="text" placeholder="Nome do seu cônjuge" value={cpSpouse} onChange={e => setCpSpouse(e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label>Código do casal (opcional)</Label>
              <InputEl type="text" placeholder="Ex: SILVA2024" value={cpCode} onChange={e => setCpCode(e.target.value)} />
            </FormGroup>
            <PrimaryBtn onClick={handleCompleteProfile} disabled={loading}>{loading ? 'Salvando...' : 'Continuar 💕'}</PrimaryBtn>
          </CompleteCard>
        </CompleteOverlay>
      )}
    </Screen>
  )
}
