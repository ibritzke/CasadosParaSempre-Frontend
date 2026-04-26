// src/components/ui/Modal.tsx
import React from 'react'
import styled, { keyframes } from 'styled-components'
import { AppTheme } from '@/styles/theme'

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 500;
  display: flex;
  align-items: flex-end;
  animation: ${fadeIn} 0.2s ease;
  backdrop-filter: blur(3px);
`

const Sheet = styled.div<{ $theme?: AppTheme }>`
  background: ${p => p.$theme?.white || '#fff'};
  border-radius: 24px 24px 0 0;
  padding: 24px 20px 36px;
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideUp} 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
`

const Handle = styled.div`
  width: 36px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 0 auto 20px;
`

const ModalTitle = styled.h2<{ $theme?: AppTheme }>`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${p => p.$theme?.primaryDark || '#5C1F3E'};
  margin-bottom: 20px;
`

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  theme?: AppTheme
  children: React.ReactNode
}

export function Modal({ open, onClose, title, theme, children }: ModalProps) {
  if (!open) return null
  return (
    <Overlay onClick={onClose}>
      <Sheet $theme={theme} onClick={e => e.stopPropagation()}>
        <Handle />
        {title && <ModalTitle $theme={theme}>{title}</ModalTitle>}
        {children}
      </Sheet>
    </Overlay>
  )
}
