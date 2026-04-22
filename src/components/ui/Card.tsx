// src/components/ui/Card.tsx
import styled from 'styled-components'
import { AppTheme } from '@/styles/theme'

interface CardProps { $theme?: AppTheme }

export const Card = styled.div<CardProps>`
  background: ${p => p.$theme?.white || '#fff'};
  border-radius: 16px;
  border: 1px solid ${p => p.$theme?.border || 'rgba(139,58,98,0.15)'};
  box-shadow: ${p => p.$theme?.shadowSm || '0 2px 8px rgba(139,58,98,0.08)'};
  padding: 20px;
`

export const SectionTitle = styled.h2<{ $theme?: AppTheme }>`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${p => p.$theme?.primaryDark || '#5C1F3E'};
  margin-bottom: 16px;
  font-weight: 600;
`

export const Badge = styled.span<{ $theme?: AppTheme }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${p => p.$theme?.primaryLight || '#F5E6EE'};
  color: ${p => p.$theme?.primary || '#8B3A62'};
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`

export const Divider = styled.div<{ $theme?: AppTheme }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0;
  color: ${p => p.$theme?.textLight || '#B09AA6'};
  font-size: 13px;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${p => p.$theme?.border || 'rgba(139,58,98,0.15)'};
  }
`

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 24px;
  color: #94A3B8;

  .icon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }
  p { font-size: 14px; line-height: 1.6; }
`
