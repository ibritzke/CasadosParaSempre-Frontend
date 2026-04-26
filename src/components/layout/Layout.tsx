// src/components/layout/Layout.tsx
import React from 'react'
import styled from 'styled-components'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Avatar } from '@/components/ui/Avatar'
import { shared } from '@/styles/theme'

const AppShell = styled.div<{ $bg: string }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 430px;
  margin: 0 auto;
  background: ${p => p.$bg};
  position: relative;

  @media (min-width: 430px) {
    box-shadow: 0 0 60px rgba(0,0,0,0.12);
  }
`

const Header = styled.header<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  padding: 14px 20px 10px;
  border-bottom: 1px solid ${p => p.$border};
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const HeaderText = styled.div``
const HeaderTitle = styled.h1<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  color: ${p => p.$color};
  font-weight: 600;
`
const HeaderSub = styled.p<{ $color: string }>`
  font-size: 12px;
  color: ${p => p.$color};
  margin-top: 1px;
`

const Content = styled.main`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`

const BottomNav = styled.nav<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-top: 1px solid ${p => p.$border};
  display: flex;
  flex-shrink: 0;
  padding: 6px 0 env(safe-area-inset-bottom, 6px);
  height: ${shared.navHeight};
`

const NavItem = styled.button<{ $active: boolean; $color: string; $activeColor: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${p => p.$active ? p.$activeColor : p.$color};
  font-size: 10px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.2s;

  .icon {
    font-size: 22px;
    line-height: 1;
    transform: ${p => p.$active ? 'scale(1.1)' : 'scale(1)'};
    transition: transform 0.2s;
  }
`

const NAV_ITEMS = [
  { path: '/home', label: 'Início', icon: '🏠' },
  { path: '/pill', label: 'Pílula', icon: '💊' },
  { path: '/records', label: 'Registros', icon: '📖' },
  { path: '/calendar', label: 'Calendário', icon: '📅' },
]

const SUBTITLES: Record<string, string> = {
  '/home': 'Pílula da Semana',
  '/pill': 'Sorteio semanal',
  '/records': 'Sua jornada',
  '/calendar': 'Eventos do casal',
  '/profile': 'Minha conta',
  '/admin': 'Painel admin',
}

interface LayoutProps { children: React.ReactNode }

export function Layout({ children }: LayoutProps) {
  const { user, theme } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null

  const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('')
  const subtitle = SUBTITLES[location.pathname] || ''

  const navItems = [
    ...NAV_ITEMS,
    ...(user.isAdmin ? [{ path: '/admin', label: 'Admin', icon: '⭐' }] : []),
  ]

  return (
    <AppShell $bg={theme.cream}>
      <Header $bg={theme.white} $border={theme.border}>
        <HeaderText>
          <HeaderTitle $color={theme.primaryDark}>Casados Para Sempre</HeaderTitle>
          <HeaderSub $color={theme.textMuted}>{subtitle}</HeaderSub>
        </HeaderText>
        <Avatar
          size={38}
          $theme={theme}
          onClick={() => navigate('/profile')}
        >
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : initials
          }
        </Avatar>
      </Header>

      <Content>{children}</Content>

      <BottomNav $bg={theme.white} $border={theme.border}>
        {navItems.map(item => (
          <NavItem
            key={item.path}
            $active={location.pathname === item.path}
            $color={theme.textLight}
            $activeColor={theme.primary}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavItem>
        ))}
      </BottomNav>
    </AppShell>
  )
}
