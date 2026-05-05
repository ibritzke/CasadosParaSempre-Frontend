import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { notificationApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

const fadeUp = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`

const Page = styled.div<{ $bg: string }>`
  padding: 20px 20px 100px;
  background: ${p => p.$bg};
  min-height: 100%;
  animation: ${fadeUp} 0.35s ease;
  overflow-y: auto;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
`

const BackBtn = styled.button<{ $bg: string; $color: string }>`
  width: 40px; height: 40px;
  border-radius: 12px;
  border: none;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;
  &:active { opacity: 0.7; }
`

const PageTitle = styled.h1<{ $color: string }>`
  font-family: 'DM Sans', sans-serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: ${p => p.$color};
`

const PermissionCard = styled.div<{ $bg: string; $border: string; $granted: boolean }>`
  background: ${p => p.$granted ? '#F0FDF4' : p.$bg};
  border: 1.5px solid ${p => p.$granted ? '#86EFAC' : p.$border};
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
`

const PermIcon = styled.div`
  font-size: 36px;
  flex-shrink: 0;
`

const PermInfo = styled.div`
  flex: 1;
  h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 4px; }
  p { font-size: 13px; color: #64748b; line-height: 1.4; }
`

const EnableBtn = styled.button<{ $primary: string; $granted: boolean }>`
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: ${p => p.$granted ? 'default' : 'pointer'};
  background: ${p => p.$granted ? '#22C55E' : p.$primary};
  color: #fff;
  white-space: nowrap;
  transition: all 0.2s;
  &:active { opacity: 0.8; }
`

const Section = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 16px;
  border: 1px solid ${p => p.$border};
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
`

const SectionHeader = styled.div<{ $border: string; $color: string }>`
  font-size: 11px;
  font-weight: 600;
  color: ${p => p.$color};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 12px 16px 10px;
  border-bottom: 1px solid ${p => p.$border};
`

const NotifRow = styled.div<{ $border: string }>`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid ${p => p.$border};
  gap: 12px;
  &:last-child { border-bottom: none; }
`

const NotifIcon = styled.span`font-size: 22px; flex-shrink: 0;`

const NotifInfo = styled.div`
  flex: 1;
  h4 { font-size: 14px; font-weight: 600; color: #1e293b; }
  p { font-size: 12px; color: #64748b; margin-top: 2px; }
`

const Toggle = styled.button<{ $on: boolean; $primary: string }>`
  width: 48px; height: 26px;
  border-radius: 13px;
  border: none;
  cursor: pointer;
  background: ${p => p.$on ? p.$primary : '#CBD5E1'};
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${p => p.$on ? '24px' : '3px'};
    width: 20px; height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    transition: left 0.2s;
  }
`

const TimeInput = styled.input<{ $color: string; $bg: string }>`
  border: none;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  outline: none;
  width: 88px;
  text-align: center;
`

const TestBtn = styled.button<{ $primary: string }>`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  background: ${p => p.$primary}18;
  color: ${p => p.$primary};
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.18s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  &:active { opacity: 0.8; }
`

const SaveBtn = styled.button<{ $primary: string }>`
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  background: ${p => p.$primary};
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 4px 12px ${p => p.$primary}40;
  transition: all 0.18s;
  &:active { transform: scale(0.98); }
`

interface Settings {
  devotionalTime: string
  tipTime: string
  calendarTime: string
  pillReminders: boolean
}

export default function NotificationsPage() {
  const { user, theme } = useAuthStore()
  const navigate = useNavigate()
  const { show } = useToast()

  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState<Settings>({
    devotionalTime: '08:00',
    tipTime: '10:00',
    calendarTime: '09:00',
    pillReminders: true,
  })

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    // Load saved settings
    notificationApi.getSettings()
      .then(r => {
        const s = r.data.settings
        setSettings({
          devotionalTime: s.devotionalTime || '08:00',
          tipTime: s.tipTime || '10:00',
          calendarTime: s.calendarTime || '09:00',
          pillReminders: s.pillReminders ?? true,
        })
      })
      .catch(() => {})

    // Check existing subscription
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub)
        })
      }).catch(() => {})
    }
  }, [])

  const handleEnable = async () => {
    if (loading) return
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        show('Permissão de notificações negada. Habilite nas configurações do seu dispositivo.')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await notificationApi.subscribe(sub as PushSubscription)
      setIsSubscribed(true)
      show('Notificações ativadas com sucesso! 🔔')
    } catch (err) {
      show('Não foi possível ativar as notificações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await notificationApi.updateSettings(settings)
      show('Configurações salvas! ✅')
    } catch {
      show('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    try {
      const res = await notificationApi.testPush()
      if (res.data.count === 0) {
        show('Ative as notificações primeiro!')
      } else {
        show('Notificação de teste enviada! Aguarde...')
      }
    } catch {
      show('Erro ao enviar teste.')
    }
  }

  if (!user) return null

  const granted = permission === 'granted' && isSubscribed

  return (
    <Page $bg={theme.cream}>
      <HeaderRow>
        <BackBtn $bg={theme.white} $color={theme.primaryDark} onClick={() => navigate(-1)}>‹</BackBtn>
        <PageTitle $color={theme.primaryDark}>Notificações</PageTitle>
      </HeaderRow>

      {/* Permission card */}
      <PermissionCard $bg={theme.white} $border={theme.border} $granted={granted}>
        <PermIcon>{granted ? '🔔' : '🔕'}</PermIcon>
        <PermInfo>
          <h3>{granted ? 'Notificações ativas' : 'Notificações desativadas'}</h3>
          <p>{granted
            ? 'Você receberá as mensagens nos horários configurados abaixo.'
            : 'Ative para receber lembretes diários no seu celular.'
          }</p>
        </PermInfo>
        <EnableBtn $primary={theme.primary} $granted={granted} onClick={!granted ? handleEnable : undefined} disabled={loading}>
          {loading ? '...' : granted ? '✅ Ativo' : 'Ativar'}
        </EnableBtn>
      </PermissionCard>

      {/* Devotional + Tip */}
      <Section $bg={theme.white} $border={theme.border}>
        <SectionHeader $border={theme.border} $color={theme.textLight}>Conteúdo Diário</SectionHeader>

        <NotifRow $border={theme.border}>
          <NotifIcon>🙏</NotifIcon>
          <NotifInfo>
            <h4>Devocional Diário</h4>
            <p>Palavra do dia para seu crescimento espiritual</p>
          </NotifInfo>
          <TimeInput
            type="time"
            $color={theme.primary}
            $bg={theme.primaryLight}
            value={settings.devotionalTime}
            onChange={e => setSettings(s => ({ ...s, devotionalTime: e.target.value }))}
          />
        </NotifRow>

        <NotifRow $border={theme.border}>
          <NotifIcon>💡</NotifIcon>
          <NotifInfo>
            <h4>Dica do Dia</h4>
            <p>Uma sugestão para edificar seu casamento</p>
          </NotifInfo>
          <TimeInput
            type="time"
            $color={theme.primary}
            $bg={theme.primaryLight}
            value={settings.tipTime}
            onChange={e => setSettings(s => ({ ...s, tipTime: e.target.value }))}
          />
        </NotifRow>
      </Section>

      {/* Calendar */}
      <Section $bg={theme.white} $border={theme.border}>
        <SectionHeader $border={theme.border} $color={theme.textLight}>Calendário</SectionHeader>
        <NotifRow $border={theme.border}>
          <NotifIcon>📅</NotifIcon>
          <NotifInfo>
            <h4>Eventos do Dia</h4>
            <p>Lembrete quando houver eventos agendados</p>
          </NotifInfo>
          <TimeInput
            type="time"
            $color={theme.primary}
            $bg={theme.primaryLight}
            value={settings.calendarTime}
            onChange={e => setSettings(s => ({ ...s, calendarTime: e.target.value }))}
          />
        </NotifRow>
      </Section>

      {/* Pill reminders */}
      <Section $bg={theme.white} $border={theme.border}>
        <SectionHeader $border={theme.border} $color={theme.textLight}>Pílula da Semana</SectionHeader>
        <NotifRow $border={theme.border}>
          <NotifIcon>💊</NotifIcon>
          <NotifInfo>
            <h4>Lembretes da Pílula</h4>
            <p>Às quartas-feiras às 12h para registrar, e quando a pílula vencer</p>
          </NotifInfo>
          <Toggle
            $on={settings.pillReminders}
            $primary={theme.primary}
            onClick={() => setSettings(s => ({ ...s, pillReminders: !s.pillReminders }))}
          />
        </NotifRow>
      </Section>

      <SaveBtn $primary={theme.primary} onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : '💾 Salvar configurações'}
      </SaveBtn>

      {granted && (
        <TestBtn $primary={theme.primary} onClick={handleTest}>
          🔔 Enviar notificação de teste
        </TestBtn>
      )}
    </Page>
  )
}
