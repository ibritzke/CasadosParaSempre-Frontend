// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { pillApi, calendarApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div<{ $bg: string }>`
  padding: 24px 20px 60px;
  min-height: 100%;
  background: ${p => p.$bg};
  overflow-y: auto;
  animation: ${fadeUp} 0.3s ease;
`

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 28px;
`

const AvatarLarge = styled.div<{ $gradient: string }>`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: ${p => p.$gradient};
  margin: 0 auto 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  border: 4px solid #fff;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  overflow: hidden;
`

const ProfileName = styled.h2<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: ${p => p.$color};
`

const ProfileRole = styled.p<{ $color: string }>`
  font-size: 13px;
  color: ${p => p.$color};
  margin-top: 4px;
`

const RoleBadge = styled.span<{ $bg: string; $color: string }>`
  display: inline-block;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 22px;
`

const StatCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 14px;
  border: 1px solid ${p => p.$border};
  padding: 14px 10px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`

const StatNum = styled.div<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  color: ${p => p.$color};
  line-height: 1;
`

const StatLabel = styled.div<{ $color: string }>`
  font-size: 11px;
  color: ${p => p.$color};
  margin-top: 4px;
  line-height: 1.3;
`

const Section = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 16px;
  border: 1px solid ${p => p.$border};
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`

const SectionTitle = styled.div<{ $border: string; $color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${p => p.$color};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 16px 8px;
  border-bottom: 1px solid ${p => p.$border};
`

const ProfileItem = styled.div<{ $border: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${p => p.$border};
  &:last-child { border-bottom: none; }
`

const ItemLabel = styled.span<{ $color: string }>`
  font-size: 15px;
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  gap: 10px;
`

const ItemValue = styled.span<{ $color: string }>`
  font-size: 13px;
  color: ${p => p.$color};
  max-width: 180px;
  text-align: right;
  word-break: break-all;
`

const LogoutBtn = styled.button`
  width: 100%;
  padding: 15px;
  background: #FEE2E2;
  color: #DC2626;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.18s;
  &:active { opacity: 0.8; }
`

const AdminBtn = styled.button<{ $color: string; $light: string }>`
  width: 100%;
  padding: 15px;
  background: ${p => p.$light};
  color: ${p => p.$color};
  border: 1.5px solid ${p => p.$color};
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:active { opacity: 0.8; }
`

export default function ProfilePage() {
  const { user, theme, logout } = useAuthStore()
  const navigate = useNavigate()
  const { show } = useToast()

  const [stats, setStats] = useState({ pills: 0, records: 0, events: 0 })

  useEffect(() => {
    if (!user) return
    Promise.all([
      pillApi.getHistory(),
      calendarApi.getEvents(new Date().getMonth(), new Date().getFullYear()),
    ]).then(([hist, evts]) => {
      const draws = hist.data.draws || []
      const totalRecords = draws.reduce((acc: number, d: { records?: unknown[] }) => acc + (d.records?.length || 0), 0)
      setStats({ pills: draws.length, records: totalRecords, events: evts.data.events?.length || 0 })
    }).catch(() => {})
  }, [user])

  if (!user) return null

  const initials = user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
  const roleLabel = user.role === 'HUSBAND' ? '💙 Marido' : '🌸 Esposa'
  const since = new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  const handleLogout = () => {
    logout()
    navigate('/auth')
    show('Até logo! 👋')
  }

  return (
    <Page $bg={theme.cream}>
      <ProfileHeader>
        <AvatarLarge $gradient={theme.gradientCard}>
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials
          }
        </AvatarLarge>
        <ProfileName $color={theme.primaryDark}>{user.name}</ProfileName>
        <ProfileRole $color={theme.textMuted}>{user.email}</ProfileRole>
        <RoleBadge $bg={theme.primaryLight} $color={theme.primary}>{roleLabel}</RoleBadge>
      </ProfileHeader>

      <StatsGrid>
        <StatCard $bg={theme.white} $border={theme.border}>
          <StatNum $color={theme.primary}>{stats.pills}</StatNum>
          <StatLabel $color={theme.textMuted}>Pílulas sorteadas</StatLabel>
        </StatCard>
        <StatCard $bg={theme.white} $border={theme.border}>
          <StatNum $color={theme.primary}>{stats.records}</StatNum>
          <StatLabel $color={theme.textMuted}>Registros feitos</StatLabel>
        </StatCard>
        <StatCard $bg={theme.white} $border={theme.border}>
          <StatNum $color={theme.primary}>{stats.events}</StatNum>
          <StatLabel $color={theme.textMuted}>Eventos este mês</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section $bg={theme.white} $border={theme.border}>
        <SectionTitle $border={theme.border} $color={theme.textLight}>Informações</SectionTitle>
        <ProfileItem $border={theme.border}>
          <ItemLabel $color={theme.text}>📧 Email</ItemLabel>
          <ItemValue $color={theme.textMuted}>{user.email}</ItemValue>
        </ProfileItem>
        <ProfileItem $border={theme.border}>
          <ItemLabel $color={theme.text}>💑 Cônjuge</ItemLabel>
          <ItemValue $color={theme.textMuted}>{user.spouseName || '—'}</ItemValue>
        </ProfileItem>
        {user.coupleCode && (
          <ProfileItem $border={theme.border}>
            <ItemLabel $color={theme.text}>🔗 Código do casal</ItemLabel>
            <ItemValue $color={theme.textMuted}>{user.coupleCode}</ItemValue>
          </ProfileItem>
        )}
        <ProfileItem $border={theme.border}>
          <ItemLabel $color={theme.text}>📅 Membro desde</ItemLabel>
          <ItemValue $color={theme.textMuted}>{since}</ItemValue>
        </ProfileItem>
      </Section>

      {user.isAdmin && (
        <AdminBtn $color={theme.primary} $light={theme.primaryLight} onClick={() => navigate('/admin')}>
          ⭐ Acessar painel admin
        </AdminBtn>
      )}

      <LogoutBtn onClick={handleLogout}>Sair da conta</LogoutBtn>
    </Page>
  )
}
