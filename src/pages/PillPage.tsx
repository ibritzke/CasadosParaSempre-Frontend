// src/pages/PillPage.tsx
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuthStore } from '@/store/auth.store'
import { pillApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import { PillDraw } from '@/types'

const fadeUp = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`
const shake = keyframes`0%,100%{transform:rotate(0)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(8deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(5deg)}`
const popIn = keyframes`from { opacity:0; transform: scale(0.8) translateY(40px); } to { opacity:1; transform: scale(1) translateY(0); }`
const fadeIn = keyframes`from{opacity:0}to{opacity:1}`

const Page = styled.div<{ $bg: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  min-height: 100%;
  background: ${p => p.$bg};
  text-align: center;
  animation: ${fadeUp} 0.3s ease;
`

const Title = styled.h2<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 23px;
  color: ${p => p.$color};
  margin-bottom: 8px;
`

const Sub = styled.p<{ $color: string }>`
  font-size: 14px;
  color: ${p => p.$color};
  max-width: 280px;
`

const JarWrapper = styled.div<{ $shaking: boolean }>`
  margin: 32px 0;
  cursor: pointer;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.15));
  transition: transform 0.15s;
  animation: ${p => p.$shaking ? shake : 'none'} 0.5s ease;
  &:active { transform: scale(0.95); }
  svg { width: 170px; height: 210px; }
`

const CurrentCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 18px;
  border: 1px solid ${p => p.$border};
  padding: 20px;
  width: 100%;
  max-width: 340px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  animation: ${fadeUp} 0.4s ease;
`

const WeekBadge = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex; align-items: center; gap: 5px;
  background: ${p => p.$bg}; color: ${p => p.$color};
  padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
  margin-bottom: 14px;
`

const PillRow = styled.div`
  display: flex; align-items: flex-start; gap: 14px; text-align: left;
`

const PillCapsuleLg = styled.div<{ $color: string }>`
  width: 72px; height: 36px; border-radius: 18px;
  background: ${p => p.$color}; flex-shrink: 0; position: relative; overflow: hidden;
  &::before { content:''; position:absolute; left:0; top:0; width:50%; height:100%; background:rgba(255,255,255,0.3); }
`

const ProgressBar = styled.div<{ $bg: string }>`
  height: 5px; background: ${p => p.$bg}; border-radius: 3px; overflow: hidden; margin-top: 14px;
`
const ProgressFill = styled.div<{ $color: string; $pct: number }>`
  height: 100%; width: ${p => p.$pct}%; background: ${p => p.$color}; border-radius: 3px; transition: width 0.8s ease;
`

const CountdownText = styled.div<{ $color: string }>`
  font-size: 12px; color: ${p => p.$color}; margin-top: 8px;
  span { background: #FBF3E4; color: #C9973A; padding: 2px 8px; border-radius: 6px; font-weight: 500; }
`

const BtnRow = styled.div` width: 100%; max-width: 340px; display: flex; flex-direction: column; gap: 10px; `

const Btn = styled.button<{ $variant: 'primary'|'outline'|'danger'; $color: string; $light: string }>`
  width: 100%; padding: 13px; border-radius: 10px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.18s;
  ${p => p.$variant === 'primary' ? `background:${p.$color};color:#fff;border:none;` :
         p.$variant === 'outline' ? `background:transparent;color:${p.$color};border:1.5px solid ${p.$color};` :
         `background:#FEE2E2;color:#DC2626;border:none;`}
  &:active { opacity: 0.85; transform: scale(0.98); }
`

// Result overlay
const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 200;
  display: flex; align-items: center; justify-content: center; padding: 24px;
  animation: ${fadeIn} 0.25s ease; backdrop-filter: blur(4px);
`

const ResultCard = styled.div`
  background: #fff; border-radius: 26px; padding: 40px 28px; max-width: 340px; width: 100%;
  text-align: center; animation: ${popIn} 0.4s cubic-bezier(0.34,1.56,0.64,1);
`

const ResultEmoji = styled.div` font-size: 72px; margin-bottom: 14px; `

const PillColorBar = styled.div<{ $color: string }>`
  width: 80px; height: 14px; border-radius: 7px; background: ${p => p.$color};
  margin: 0 auto 16px;
`

function getWeekNumber() {
  const d = new Date()
  d.setHours(0,0,0,0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const w = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - w.getTime()) / 86400000 - 3 + (w.getDay() + 6) % 7) / 7)
}

function daysLeft() {
  const day = new Date().getDay()
  return day === 1 ? 7 : (8 - day) % 7
}

export default function PillPage() {
  const { theme } = useAuthStore()
  const { show } = useToast()
  const [draw, setDraw] = useState<PillDraw | null>(null)
  const [loading, setLoading] = useState(true)
  const [shaking, setShaking] = useState(false)
  const [result, setResult] = useState<PillDraw | null>(null)

  useEffect(() => {
    pillApi.getCurrent().then(r => { setDraw(r.data.draw); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleJarClick = async () => {
    if (draw) { show('Você já tem uma pílula esta semana! 💊'); return }
    if (shaking) return
    setShaking(true)
    setTimeout(() => setShaking(false), 600)
    setTimeout(async () => {
      try {
        const { data } = await pillApi.draw()
        setResult(data.draw)
      } catch (err: unknown) {
        const e = err as { response?: { data?: { error?: string } } }
        show(e.response?.data?.error || 'Erro ao sortear')
      }
    }, 350)
  }

  const acceptResult = () => {
    if (result) { setDraw(result); setResult(null) }
  }

  const handleCancel = async () => {
    if (!draw) return
    if (!window.confirm('Tem certeza que deseja cancelar sua pílula desta semana?')) return
    try {
      await pillApi.cancel(draw.id)
      setDraw(null)
      show('Pílula cancelada.')
    } catch { show('Erro ao cancelar') }
  }

  if (loading) return <Page $bg={theme.cream}><p style={{ color: theme.textMuted }}>Carregando...</p></Page>

  const pct = draw ? Math.min(100, Math.round((Date.now() - new Date(draw.drawnAt).getTime()) / (7 * 24 * 60 * 60 * 1000) * 100)) : 0
  const days = daysLeft()
  const week = getWeekNumber()

  return (
    <Page $bg={theme.cream}>
      {!draw ? (
        <>
          <Title $color={theme.primaryDark}>Pílula da Semana</Title>
          <Sub $color={theme.textMuted}>Toque no pote para sortear sua pílula desta semana</Sub>

          <JarWrapper $shaking={shaking} onClick={handleJarClick}>
            <svg viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="70" width="140" height="130" rx="20" fill="#FDF8F4" stroke={theme.primaryMid} strokeWidth="2.5"/>
              <rect x="30" y="80" width="18" height="60" rx="9" fill="rgba(255,255,255,0.6)"/>
              <rect x="10" y="50" width="160" height="28" rx="14" fill={theme.primary}/>
              <rect x="20" y="54" width="140" height="16" rx="8" fill={theme.primaryMid} opacity="0.5"/>
              <ellipse cx="65" cy="130" rx="20" ry="12" fill="#E8A87C" opacity="0.85"/>
              <ellipse cx="65" cy="130" rx="10" ry="12" fill="rgba(255,255,255,0.3)"/>
              <ellipse cx="105" cy="140" rx="20" ry="12" fill="#9B7BB5" opacity="0.85"/>
              <ellipse cx="105" cy="140" rx="10" ry="12" fill="rgba(255,255,255,0.3)"/>
              <ellipse cx="80" cy="158" rx="20" ry="12" fill="#6BA3BE" opacity="0.85"/>
              <ellipse cx="80" cy="158" rx="10" ry="12" fill="rgba(255,255,255,0.3)"/>
              <ellipse cx="55" cy="165" rx="16" ry="10" fill="#7B9E87" opacity="0.85"/>
              <ellipse cx="120" cy="118" rx="18" ry="10" fill={theme.primaryMid} opacity="0.85"/>
              <ellipse cx="120" cy="118" rx="9" ry="10" fill="rgba(255,255,255,0.3)"/>
              <text x="90" y="105" textAnchor="middle" fontSize="22" fill={theme.primary} opacity="0.35">♥</text>
            </svg>
          </JarWrapper>
        </>
      ) : (
        <>
          <Title $color={theme.primaryDark}>Sua pílula desta semana</Title>
          <Sub $color={theme.textMuted} style={{ marginBottom: 24 }}>Complete e registre sua experiência! 💕</Sub>

          <CurrentCard $bg={theme.white} $border={theme.border}>
            <WeekBadge $bg={theme.primaryLight} $color={theme.primary}>💊 Semana {week}</WeekBadge>
            <PillRow>
              <PillCapsuleLg $color={draw.pill.color} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: theme.text }}>{draw.pill.name}</div>
                <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5, marginTop: 4 }}>{draw.pill.description}</div>
              </div>
            </PillRow>
            <CountdownText $color={theme.textMuted}>
              ⏳ <span>{days} dia{days !== 1 ? 's' : ''} restante{days !== 1 ? 's' : ''}</span> até a próxima semana
            </CountdownText>
            <ProgressBar $bg={theme.border}>
              <ProgressFill $color={theme.primary} $pct={pct} />
            </ProgressBar>
          </CurrentCard>

          <BtnRow style={{ marginTop: 20 }}>
            <Btn $variant="outline" $color={theme.primary} $light={theme.primaryLight} onClick={handleCancel}>
              Cancelar pílula desta semana
            </Btn>
          </BtnRow>
        </>
      )}

      {result && (
        <Overlay onClick={() => {}}>
          <ResultCard>
            <ResultEmoji>{result.pill.emoji}</ResultEmoji>
            <PillColorBar $color={result.pill.color} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#1e293b', marginBottom: 6 }}>
              Sua pílula desta semana!
            </h2>
            <div style={{ fontSize: 18, fontWeight: 600, color: result.pill.color, marginBottom: 8 }}>{result.pill.name}</div>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>{result.pill.description}</p>
            <div style={{ display:'inline-block', background: theme.primaryLight, color: theme.primary, padding:'6px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, marginBottom: 20 }}>
              Semana {result.weekNumber} de {result.year}
            </div>
            <button onClick={acceptResult} style={{ display:'block', width:'100%', padding:14, background:theme.primary, color:'#fff', border:'none', borderRadius:10, fontSize:15, fontWeight:500, cursor:'pointer', marginBottom:10 }}>
              Aceitar e fechar 💕
            </button>
            <button onClick={() => setResult(null)} style={{ display:'block', width:'100%', padding:12, background:'transparent', color:theme.primary, border:`1.5px solid ${theme.primary}`, borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer' }}>
              Fechar
            </button>
          </ResultCard>
        </Overlay>
      )}
    </Page>
  )
}
