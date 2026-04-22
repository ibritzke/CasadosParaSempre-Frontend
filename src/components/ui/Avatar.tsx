// src/components/ui/Avatar.tsx
import styled from 'styled-components'
import { AppTheme } from '@/styles/theme'

interface AvatarProps { size?: number; $theme?: AppTheme }

export const Avatar = styled.div<AvatarProps>`
  width: ${p => p.size || 42}px;
  height: ${p => p.size || 42}px;
  border-radius: 50%;
  background: ${p => p.$theme?.primaryLight || '#F5E6EE'};
  border: 2px solid ${p => p.$theme?.primary || '#8B3A62'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${p => Math.round((p.size || 42) * 0.36)}px;
  font-weight: 600;
  color: ${p => p.$theme?.primary || '#8B3A62'};
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.15s;
  &:hover { transform: scale(1.05); }
`

// src/components/ui/Toast.tsx
export {}

// src/components/ui/Modal.tsx
export {}
