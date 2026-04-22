import { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import api from '@/services/api'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`

const Screen = styled.div`
  min-height: 100%;
  background: linear-gradient(160deg, #5C1F3E 0%, #8B3A62 55%, #C4709A 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  max-width: 430px;
  margin: 0 auto;
`

const Card = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.22);
  animation: ${fadeIn} 0.4s ease;
`

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: #5C1F3E;
  margin-bottom: 8px;
`

const Sub = styled.p`
  font-size: 13px;
  color: #7A5C68;
  margin-bottom: 24px;
  line-height: 1.5;
`

const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #7A5C68;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
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
  margin-bottom: 16px;
  &:focus { border-color: #8B3A62; }
`

const Btn = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8B3A62, #5C1F3E);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const Msg = styled.div<{ $error?: boolean }>`
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 16px;
  background: ${p => p.$error ? '#FEE2E2' : '#DCFCE7'};
  color: ${p => p.$error ? '#DC2626' : '#16A34A'};
`

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Pega o token do hash da URL (vem do email do Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.access_token) {
        setAccessToken(session.access_token)
        subscription.unsubscribe()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async () => {
    if (!password || !confirm) { setError('Preencha os dois campos'); return }
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    if (password.length < 6) { setError('Senha mínima: 6 caracteres'); return }
    if (!accessToken) { setError('Token inválido. Solicite um novo link.'); return }

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { accessToken, newPassword: password })
      setMsg('Senha redefinida com sucesso! Redirecionando...')
      setTimeout(() => navigate('/auth'), 2500)
    } catch {
      setError('Erro ao redefinir senha. Solicite um novo link.')
    } finally { setLoading(false) }
  }

  return (
    <Screen>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 48 }}>🔐</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: 24, marginTop: 12 }}>
          Casados Para Sempre
        </h1>
      </div>
      <Card>
        <Title>Nova senha</Title>
        <Sub>Digite sua nova senha abaixo. Ela deve ter pelo menos 6 caracteres.</Sub>

        {msg && <Msg>{msg}</Msg>}
        {error && <Msg $error>{error}</Msg>}

        {!accessToken && !msg && (
          <Msg $error>Aguardando link do email... Verifique sua caixa de entrada e clique no link recebido.</Msg>
        )}

        <Label>Nova senha</Label>
        <InputEl type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        <Label>Confirmar senha</Label>
        <InputEl type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()} />
        <Btn onClick={handleReset} disabled={loading || !accessToken}>{loading ? 'Salvando...' : 'Salvar nova senha'}</Btn>
      </Card>
    </Screen>
  )
}