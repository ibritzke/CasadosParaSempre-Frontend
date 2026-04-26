// src/components/ui/LoadingSpinner.tsx
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuthStore } from '@/store/auth.store'

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Container = styled.div<{ $bg?: string; $fullPage?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 24px;
  min-height: ${p => p.$fullPage ? '100%' : 'auto'};
  background: ${p => p.$bg || 'transparent'};
  animation: ${fadeIn} 0.3s ease;
`

const SpinnerRing = styled.div<{ $color: string; $size?: number }>`
  width: ${p => p.$size || 40}px;
  height: ${p => p.$size || 40}px;
  border: 3px solid ${p => p.$color}22;
  border-top: 3px solid ${p => p.$color};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

const LoadingText = styled.p<{ $color: string }>`
  font-size: 14px;
  color: ${p => p.$color};
  animation: ${pulse} 1.5s ease-in-out infinite;
`

const PillIcon = styled.span`
  font-size: 28px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`

interface LoadingSpinnerProps {
  message?: string
  fullPage?: boolean
  showIcon?: boolean
  size?: number
}

export default function LoadingSpinner({ message = 'Carregando...', fullPage = false, showIcon = false, size }: LoadingSpinnerProps) {
  const { theme } = useAuthStore()

  return (
    <Container $bg={fullPage ? theme.cream : undefined} $fullPage={fullPage}>
      {showIcon && <PillIcon>💊</PillIcon>}
      <SpinnerRing $color={theme.primary} $size={size} />
      <LoadingText $color={theme.textMuted}>{message}</LoadingText>
    </Container>
  )
}

// Inline overlay spinner for buttons and actions
const OverlayWrapper = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(3px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`

const OverlayCard = styled.div`
  background: #fff;
  border-radius: 20px;
  padding: 32px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.2);
`

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Processando...' }: LoadingOverlayProps) {
  const { theme } = useAuthStore()

  return (
    <OverlayWrapper>
      <OverlayCard>
        <SpinnerRing $color={theme.primary} $size={44} />
        <LoadingText $color={theme.text}>{message}</LoadingText>
      </OverlayCard>
    </OverlayWrapper>
  )
}
