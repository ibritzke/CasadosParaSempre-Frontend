// src/components/ui/Input.tsx
import styled from 'styled-components'
import { AppTheme } from '@/styles/theme'

interface InputProps { $theme?: AppTheme }

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`

export const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${p => p.theme?.textMuted || '#7A5C68'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const Input = styled.input<InputProps>`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid ${p => p.$theme?.border || 'rgba(139,58,98,0.15)'};
  border-radius: 10px;
  font-size: 15px;
  color: ${p => p.$theme?.text || '#2A1A1F'};
  background: ${p => p.$theme?.cream || '#FDF8F4'};
  outline: none;
  transition: border-color 0.2s;

  &:focus { border-color: ${p => p.$theme?.primary || '#8B3A62'}; }
  &::placeholder { color: ${p => p.$theme?.textLight || '#B09AA6'}; }
`

export const Select = styled.select<InputProps>`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid ${p => p.$theme?.border || 'rgba(139,58,98,0.15)'};
  border-radius: 10px;
  font-size: 15px;
  color: ${p => p.$theme?.text || '#2A1A1F'};
  background: ${p => p.$theme?.cream || '#FDF8F4'};
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A5C68' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  cursor: pointer;
  &:focus { border-color: ${p => p.$theme?.primary || '#8B3A62'}; }
`

export const Textarea = styled.textarea<InputProps>`
  width: 100%;
  padding: 13px 16px;
  border: 1.5px solid ${p => p.$theme?.border || 'rgba(139,58,98,0.15)'};
  border-radius: 10px;
  font-size: 15px;
  color: ${p => p.$theme?.text || '#2A1A1F'};
  background: ${p => p.$theme?.cream || '#FDF8F4'};
  outline: none;
  resize: none;
  min-height: 90px;
  transition: border-color 0.2s;
  &:focus { border-color: ${p => p.$theme?.primary || '#8B3A62'}; }
  &::placeholder { color: ${p => p.$theme?.textLight || '#B09AA6'}; }
`
