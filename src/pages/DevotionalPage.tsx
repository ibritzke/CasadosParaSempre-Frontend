import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { userApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'

import devHomens from '@/components/Devocionais/devocionais_homens.json'
import devMulheres from '@/components/Devocionais/devocionais_mulheres.json'

const fadeUp = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`

const Page = styled.div<{ $bg: string }>`
  padding: 20px;
  background: ${p => p.$bg};
  min-height: 100%;
  animation: ${fadeUp} 0.35s ease;
  padding-bottom: 100px;
  overflow-y: auto;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`

const BackBtn = styled.button<{ $bg: string; $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;
  &:active { opacity: 0.7; }
`

const PageTitle = styled.h1<{ $color: string }>`
  font-family: 'DM Sans', sans-serif;
  font-size: 22px;
  color: ${p => p.$color};
  font-weight: 700;
  letter-spacing: -0.5px;
`

const DevotionalCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 20px;
  border: 1px solid ${p => p.$border};
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
`

const DevTitle = styled.h2<{ $color: string }>`
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  letter-spacing: -0.3px;
  font-size: 22px;
  color: ${p => p.$color};
  margin-bottom: 8px;
  line-height: 1.3;
`

const ReferenceBadge = styled.div<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 20px;
`

const SectionTitle = styled.h3<{ $color: string }>`
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.$color};
  margin-top: 24px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const Paragraph = styled.p<{ $color: string }>`
  font-size: 15px;
  color: ${p => p.$color};
  line-height: 1.6;
  margin-bottom: 14px;
`

const CompleteBtn = styled.button<{ $primary: string; $done: boolean }>`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: ${p => p.$done ? 'default' : 'pointer'};
  margin-top: 32px;
  background: ${p => p.$done ? '#10B981' : p.$primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: ${p => p.$done ? 'none' : `0 4px 12px ${p.$primary}40`};

  &:active { transform: ${p => p.$done ? 'none' : 'scale(0.98)'}; }
`

function getDayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export default function DevotionalPage() {
  const { user, theme, setUser, token } = useAuthStore()
  const navigate = useNavigate()
  const { show } = useToast()
  
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const dayOfYear = getDayOfYear()
  const devArray = user.role === 'WIFE' ? devMulheres : devHomens
  const dailyDev = devArray[(dayOfYear - 1) % devArray.length]

  const isDevotionalRead = user.lastDevotionalReadAt && new Date(user.lastDevotionalReadAt).toDateString() === new Date().toDateString()

  const handleComplete = async () => {
    if (isDevotionalRead || loading) return
    setLoading(true)
    try {
      const res = await userApi.updateDevotionalRead()
      // update local user state
      setUser({ ...user, lastDevotionalReadAt: res.data.user.lastDevotionalReadAt }, token!)
      show('Devocional concluído! 🙏')
    } catch (err) {
      show('Erro ao marcar devocional como lido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page $bg={theme.cream}>
      <HeaderRow>
        <BackBtn $bg={theme.white} $color={theme.primaryDark} onClick={() => navigate(-1)}>‹</BackBtn>
        <PageTitle $color={theme.primaryDark}>Devocional Diário</PageTitle>
      </HeaderRow>

      <DevotionalCard $bg={theme.white} $border={theme.border}>
        <DevTitle $color={theme.text}>{dailyDev.titulo}</DevTitle>
        <ReferenceBadge $bg={theme.primaryLight} $color={theme.primary}>
          📖 {dailyDev.versiculo_base}
        </ReferenceBadge>

        <SectionTitle $color={theme.primaryDark}>Meditação</SectionTitle>
        <Paragraph $color={theme.textMuted}>{dailyDev.meditacao}</Paragraph>

        <SectionTitle $color={theme.primaryDark}>Aplicação Prática</SectionTitle>
        <Paragraph $color={theme.textMuted}>{dailyDev.aplicacao_pratica}</Paragraph>

        <SectionTitle $color={theme.primaryDark}>Oração</SectionTitle>
        <Paragraph $color={theme.textMuted}><i>"{dailyDev.oracao}"</i></Paragraph>

        <CompleteBtn $primary={theme.primary} $done={isDevotionalRead} onClick={handleComplete} disabled={isDevotionalRead || loading}>
          {isDevotionalRead ? '✅ Concluído Hoje' : 'Marcar como Lido'}
        </CompleteBtn>
      </DevotionalCard>
    </Page>
  )
}
