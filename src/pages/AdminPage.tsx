// src/pages/AdminPage.tsx
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuthStore } from '@/store/auth.store'
import { adminApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import { AdminStats, AdminUser } from '@/types'

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div<{ $bg: string }>`
  padding: 20px;
  min-height: 100%;
  background: ${p => p.$bg};
  animation: ${fadeUp} 0.3s ease;
`

const SectionTitle = styled.h2<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${p => p.$color};
  margin-bottom: 14px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`

const StatCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 14px;
  border: 1px solid ${p => p.$border};
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`

const StatNum = styled.div<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  color: ${p => p.$color};
  line-height: 1;
`

const StatLabel = styled.div<{ $color: string }>`
  font-size: 12px;
  color: ${p => p.$color};
  margin-top: 4px;
`

const SearchInput = styled.input<{ $border: string; $primary: string }>`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${p => p.$border};
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: border-color 0.2s;
  margin-bottom: 14px;
  &:focus { border-color: ${p => p.$primary}; }
  &::placeholder { color: #94a3b8; }
`

const UserCard = styled.div<{ $bg: string; $border: string; $disabled?: boolean }>`
  background: ${p => p.$bg};
  border-radius: 14px;
  border: 1px solid ${p => p.$border};
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  opacity: ${p => p.$disabled ? 0.55 : 1};
`

const UserTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const UserAvatar = styled.div<{ $bg: string; $color: string }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  flex-shrink: 0;
`

const UserInfo = styled.div` flex: 1; `

const UserName = styled.div<{ $color: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.$color};
`

const UserEmail = styled.div<{ $color: string }>`
  font-size: 12px;
  color: ${p => p.$color};
  margin-top: 1px;
`

const TagRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
`

const Tag = styled.span<{ $bg: string; $color: string }>`
  background: ${p => p.$bg};
  color: ${p => p.$color};
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
`

const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
`

const SmallBtn = styled.button<{ $bg: string; $color: string }>`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  font-size: 12px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  &:active { opacity: 0.8; }
`

const PillStatCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 12px;
  border: 1px solid ${p => p.$border};
  padding: 12px 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
`

const PillColorDot = styled.div<{ $color: string }>`
  width: 36px;
  height: 18px;
  border-radius: 9px;
  background: ${p => p.$color};
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  &::before { content:''; position:absolute; left:0; top:0; width:50%; height:100%; background:rgba(255,255,255,0.3); }
`

const BarWrap = styled.div<{ $bg: string }>`
  flex: 1;
  height: 6px;
  background: ${p => p.$bg};
  border-radius: 3px;
  overflow: hidden;
`

const Bar = styled.div<{ $color: string; $pct: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.$color};
  border-radius: 3px;
  transition: width 0.8s ease;
`

interface PillStat { id: number; name: string; emoji: string; color: string; count: number }

export default function AdminPage() {
  const { theme, user } = useAuthStore()
  const { show } = useToast()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pillStats, setPillStats] = useState<PillStat[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [s, u, p] = await Promise.all([adminApi.getStats(), adminApi.getUsers(), adminApi.getPillStats()])
      setStats(s.data.stats)
      setUsers(u.data.users)
      setPillStats(p.data.pillStats)
    } catch { show('Erro ao carregar dados') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleSearch = async (q: string) => {
    setSearch(q)
    try {
      const { data } = await adminApi.getUsers({ search: q })
      setUsers(data.users)
    } catch {}
  }

  const toggleAdmin = async (id: string, name: string) => {
    if (!window.confirm(`Alterar status admin de ${name}?`)) return
    try {
      await adminApi.toggleAdmin(id)
      show('Admin atualizado')
      loadData()
    } catch { show('Erro') }
  }

  const toggleActive = async (id: string, name: string) => {
    if (!window.confirm(`Alterar status de ${name}?`)) return
    try {
      await adminApi.toggleActive(id)
      show('Usuário atualizado')
      loadData()
    } catch { show('Erro') }
  }

  const maxCount = pillStats[0]?.count || 1

  if (loading) return <Page $bg={theme.cream}><p style={{ color: theme.textMuted }}>Carregando...</p></Page>

  return (
    <Page $bg={theme.cream}>
      <SectionTitle $color={theme.primaryDark}>Painel Admin ⭐</SectionTitle>

      {stats && (
        <StatsGrid>
          {[
            { num: stats.totalUsers, label: 'Usuários total' },
            { num: stats.couples, label: 'Casais aprox.' },
            { num: stats.totalDraws, label: 'Pílulas sorteadas' },
            { num: stats.totalRecords, label: 'Registros feitos' },
            { num: stats.husbands, label: 'Maridos' },
            { num: stats.wives, label: 'Esposas' },
          ].map((s, i) => (
            <StatCard key={i} $bg={theme.white} $border={theme.border}>
              <StatNum $color={theme.primary}>{s.num}</StatNum>
              <StatLabel $color={theme.textMuted}>{s.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>
      )}

      {/* Pill stats */}
      {pillStats.length > 0 && (
        <>
          <SectionTitle $color={theme.primaryDark}>Pílulas mais sorteadas</SectionTitle>
          {pillStats.slice(0, 5).map(p => (
            <PillStatCard key={p.id} $bg={theme.white} $border={theme.border}>
              <PillColorDot $color={p.color} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: theme.text }}>{p.emoji} {p.name}</span>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{p.count}x</span>
                </div>
                <BarWrap $bg={theme.border}>
                  <Bar $color={p.color} $pct={Math.round(p.count / maxCount * 100)} />
                </BarWrap>
              </div>
            </PillStatCard>
          ))}
          <div style={{ marginBottom: 24 }} />
        </>
      )}

      {/* Users */}
      <SectionTitle $color={theme.primaryDark}>Usuários cadastrados</SectionTitle>
      <SearchInput
        placeholder="Buscar por nome ou email..."
        value={search}
        onChange={e => handleSearch(e.target.value)}
        $border={theme.border}
        $primary={theme.primary}
      />

      {users.map(u => {
        const initials = u.name.split(' ').map(n => n[0]).slice(0, 2).join('')
        const isHusband = u.role === 'HUSBAND'
        const avatarBg = isHusband ? '#DBEAFE' : '#F5E6EE'
        const avatarColor = isHusband ? '#1D4ED8' : '#8B3A62'
        const isSelf = u.id === user?.id

        return (
          <UserCard key={u.id} $bg={theme.white} $border={theme.border} $disabled={!u.isActive}>
            <UserTop>
              <UserAvatar $bg={avatarBg} $color={avatarColor}>{initials}</UserAvatar>
              <UserInfo>
                <UserName $color={theme.text}>{u.name} {isSelf ? '(você)' : ''}</UserName>
                <UserEmail $color={theme.textMuted}>{u.email}</UserEmail>
              </UserInfo>
            </UserTop>

            <TagRow>
              <Tag $bg={isHusband ? '#DBEAFE' : '#F5E6EE'} $color={isHusband ? '#1D4ED8' : '#8B3A62'}>
                {isHusband ? 'Marido' : 'Esposa'}
              </Tag>
              {u.isAdmin && <Tag $bg="#FEF3C7" $color="#D97706">⭐ Admin</Tag>}
              <Tag $bg={u.isActive ? '#DCFCE7' : '#FEE2E2'} $color={u.isActive ? '#16A34A' : '#DC2626'}>
                {u.isActive ? 'Ativo' : 'Inativo'}
              </Tag>
              <Tag $bg="#F1F5F9" $color="#475569">{u._count.pillDraws} pílulas</Tag>
            </TagRow>

            {!isSelf && (
              <ActionRow>
                <SmallBtn
                  $bg={u.isAdmin ? '#FEF3C7' : theme.primaryLight}
                  $color={u.isAdmin ? '#D97706' : theme.primary}
                  onClick={() => toggleAdmin(u.id, u.name)}
                >
                  {u.isAdmin ? '⭐ Remover admin' : '⭐ Tornar admin'}
                </SmallBtn>
                <SmallBtn
                  $bg={u.isActive ? '#FEE2E2' : '#DCFCE7'}
                  $color={u.isActive ? '#DC2626' : '#16A34A'}
                  onClick={() => toggleActive(u.id, u.name)}
                >
                  {u.isActive ? 'Desativar' : 'Ativar'}
                </SmallBtn>
              </ActionRow>
            )}
          </UserCard>
        )
      })}
    </Page>
  )
}
