// src/components/ui/Button.tsx
import styled, { css } from 'styled-components'
import { AppTheme } from '@/styles/theme'

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  $theme?: AppTheme
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
  text-decoration: none;
  white-space: nowrap;

  ${({ size = 'md' }) =>
    size === 'sm' ? css`padding: 9px 16px; font-size: 13px;` :
    size === 'lg' ? css`padding: 17px 24px; font-size: 16px; border-radius: 12px;` :
    css`padding: 13px 20px; font-size: 15px;`}

  ${({ fullWidth }) => fullWidth && css`width: 100%;`}

  ${({ variant = 'primary', $theme }) => {
    const primary = $theme?.primary || '#8B3A62'
    const primaryDark = $theme?.primaryDark || '#5C1F3E'
    const primaryLight = $theme?.primaryLight || '#F5E6EE'

    switch (variant) {
      case 'primary':
        return css`
          background: linear-gradient(135deg, ${primary}, ${primaryDark});
          color: #fff;
          box-shadow: 0 4px 14px ${primary}40;
          &:hover { opacity: 0.9; transform: translateY(-1px); }
          &:active { transform: scale(0.97); opacity: 0.85; }
          &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        `
      case 'outline':
        return css`
          background: transparent;
          color: ${primary};
          border: 1.5px solid ${primary};
          &:hover { background: ${primaryLight}; }
          &:active { transform: scale(0.97); }
        `
      case 'ghost':
        return css`
          background: ${primaryLight};
          color: ${primary};
          &:hover { filter: brightness(0.95); }
          &:active { transform: scale(0.97); }
        `
      case 'danger':
        return css`
          background: #FEE2E2;
          color: #DC2626;
          &:hover { background: #FECACA; }
          &:active { transform: scale(0.97); }
        `
    }
  }}
`
