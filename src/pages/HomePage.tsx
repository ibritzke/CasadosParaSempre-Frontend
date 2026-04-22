// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { pillApi } from '@/services/api'
import { PillDraw } from '@/types'

const fadeUp = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`

const Page = styled.div<{ $bg: string }>`
  padding: 20px;
  background: ${p => p.$bg};
  min-height: 100%;
  animation: ${fadeUp} 0.35s ease;
`

const GreetingCard = styled.div<{ $gradient: string }>`
  background: ${p => p.$gradient};
  border-radius: 20px;
  padding: 22px 20px;
  color: #fff;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '💍';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 60px;
    opacity: 0.12;
  }

  h2 { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 400; margin-bottom: 4px; }
  p { font-size: 13px; opacity: 0.8; }
`

const StatusCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 16px;
  border: 1px solid ${p => p.$border};
  padding: 18px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`

const WeekBadge = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 14px;
`

const PillRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

const PillCapsule = styled.div<{ $color: string; size?: 'sm' | 'lg' }>`
  width: ${p => p.size === 'lg' ? '72px' : '48px'};
  height: ${p => p.size === 'lg' ? '36px' : '24px'};
  border-radius: ${p => p.size === 'lg' ? '18px' : '12px'};
  background: ${p => p.$color};
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0;
    width: 50%; height: 100%;
    background: rgba(255,255,255,0.3);
  }
`

const EmptyPill = styled.div`
  text-align: center;
  padding: 20px 0;
  color: #94A3B8;
  .icon { font-size: 36px; margin-bottom: 8px; }
  p { font-size: 13px; }
`

const ActionBtn = styled.button<{ $primary: string; $variant?: 'ghost' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 14px;
  transition: all 0.18s;
  background: ${p => p.$variant === 'ghost' ? p.$primary + '18' : p.$primary};
  color: ${p => p.$variant === 'ghost' ? p.$primary : '#fff'};
  &:active { opacity: 0.85; transform: scale(0.98); }
`

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`

const QuickCard = styled.button<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 14px;
  border: 1px solid ${p => p.$border};
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  &:active { transform: scale(0.97); }
  .icon { font-size: 26px; margin-bottom: 8px; display: block; }
  h4 { font-size: 14px; font-weight: 500; color: #1e293b; }
  p { font-size: 12px; color: #64748b; margin-top: 2px; }
`

const SectionTitle = styled.h2<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${p => p.$color};
  margin-bottom: 14px;
`

const HistoryItem = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 12px;
  border: 1px solid ${p => p.$border};
  padding: 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`

const WeekTag = styled.span<{ $bg: string; $color: string }>`
  font-size: 11px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
`

function daysUntilNextMonday() {
  const day = new Date().getDay()
  return day === 1 ? 7 : (8 - day) % 7
}

export default function HomePage() {
  const { user, theme } = useAuthStore()
  const navigate = useNavigate()
  const [currentDraw, setCurrentDraw] = useState<PillDraw | null>(null)
  const [history, setHistory] = useState<PillDraw[]>([])

  useEffect(() => {
    pillApi.getCurrent().then(r => setCurrentDraw(r.data.draw)).catch(() => {})
    pillApi.getHistory().then(r => setHistory(r.data.draws || [])).catch(() => {})
  }, [])

  if (!user) return null

  const firstName = user.name.split(' ')[0]
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const roleLabel = user.role === 'HUSBAND' ? 'marido' : 'esposa'
  const days = daysUntilNextMonday()

  return (
    <Page $bg={theme.cream}>
      <GreetingCard $gradient={theme.gradientCard}>
        <h2>{greet}, {firstName}! 💕</h2>
        <p>Que semana abençoada te aguarda, {roleLabel}!</p>
      </GreetingCard>

      <StatusCard $bg={theme.white} $border={theme.border}>
        <WeekBadge $bg={theme.primaryLight} $color={theme.primary}>💊 Semana atual</WeekBadge>
        {currentDraw ? (
          <>
            <PillRow>
              <PillCapsule $color={currentDraw.pill.color} size="lg" />
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, color: theme.text }}>
                  {currentDraw.pill.emoji} {currentDraw.pill.name}
                </div>
                <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                  Semana {currentDraw.weekNumber} — {days} dia{days !== 1 ? 's' : ''} restante{days !== 1 ? 's' : ''}
                </div>
              </div>
            </PillRow>
            <ActionBtn $primary={theme.primary} $variant="ghost" onClick={() => navigate('/records')}>
              📝 Registrar experiência
            </ActionBtn>
          </>
        ) : (
          <EmptyPill>
            <div className="icon">🫙</div>
            <p>Nenhuma pílula esta semana</p>
            <ActionBtn $primary={theme.primary} onClick={() => navigate('/pill')}>
              Sortear agora →
            </ActionBtn>
          </EmptyPill>
        )}
      </StatusCard>

      <QuickGrid>
        {[
          { path: '/pill', icon: '🫙', label: 'Pílula', sub: 'Sortear ou ver a sua' },
          { path: '/records', icon: '📖', label: 'Registros', sub: 'Sua jornada semanal' },
          { path: '/calendar', icon: '📅', label: 'Calendário', sub: 'Eventos do casal' },
          { path: '/profile', icon: '👤', label: 'Perfil', sub: 'Suas configurações' },
        ].map(item => (
          <QuickCard key={item.path} $bg={theme.white} $border={theme.border} onClick={() => navigate(item.path)}>
            <span className="icon">{item.icon}</span>
            <h4>{item.label}</h4>
            <p>{item.sub}</p>
          </QuickCard>
        ))}
      </QuickGrid>

      <SectionTitle $color={theme.primaryDark}>Histórico recente</SectionTitle>
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: theme.textMuted }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
          <p style={{ fontSize: 14 }}>Nenhum registro ainda.<br />Comece sua jornada!</p>
        </div>
      ) : (
        history.slice(0, 5).map(draw => (
          <HistoryItem key={draw.id} $bg={theme.white} $border={theme.border}>
            <PillCapsule $color={draw.pill.color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{draw.pill.emoji} {draw.pill.name}</div>
              <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>Semana {draw.weekNumber}/{draw.year}</div>
            </div>
            <WeekTag $bg={theme.primaryLight} $color={theme.primary}>Sem. {draw.weekNumber}</WeekTag>
          </HistoryItem>
        ))
      )}
    </Page>
  )
}
