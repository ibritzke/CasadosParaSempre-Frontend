import styled, { keyframes } from 'styled-components'

 const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`

export const Page = styled.div<{ $bg: string }>`
  padding: 20px;
  min-height: 100%;
  background: ${p => p.$bg};
  animation: ${fadeUp} 0.3s ease;
`

export const SectionTitle = styled.h2<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${p => p.$color};
  margin-bottom: 14px;
`

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
`

export const StatCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 14px;
  border: 1px solid ${p => p.$border};
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`

export const StatNum = styled.div<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 30px;
  color: ${p => p.$color};
  line-height: 1;
`

export const StatLabel = styled.div<{ $color: string }>`
  font-size: 12px;
  color: ${p => p.$color};
  margin-top: 4px;
`

export const SearchInput = styled.input<{ $border: string; $primary: string }>`
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

export const UserCard = styled.div<{ $bg: string; $border: string; $disabled?: boolean }>`
  background: ${p => p.$bg};
  border-radius: 14px;
  border: 1px solid ${p => p.$border};
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  opacity: ${p => p.$disabled ? 0.55 : 1};
`

export const UserTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

export const UserAvatar = styled.div<{ $bg: string; $color: string }>`
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

export const UserInfo = styled.div` flex: 1; `

export const UserName = styled.div<{ $color: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.$color};
`

export const UserEmail = styled.div<{ $color: string }>`
  font-size: 12px;
  color: ${p => p.$color};
  margin-top: 1px;
`

export const TagRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
`

export const Tag = styled.span<{ $bg: string; $color: string }>`
  background: ${p => p.$bg};
  color: ${p => p.$color};
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
`

export const ActionRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
`

export const SmallBtn = styled.button<{ $bg: string; $color: string }>`
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

export const PillStatCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 12px;
  border: 1px solid ${p => p.$border};
  padding: 12px 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
`

export const PillColorDot = styled.div<{ $color: string }>`
  width: 36px;
  height: 18px;
  border-radius: 9px;
  background: ${p => p.$color};
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  &::before { content:''; position:absolute; left:0; top:0; width:50%; height:100%; background:rgba(255,255,255,0.3); }
`

export const BarWrap = styled.div<{ $bg: string }>`
  flex: 1;
  height: 6px;
  background: ${p => p.$bg};
  border-radius: 3px;
  overflow: hidden;
`

export const Bar = styled.div<{ $color: string; $pct: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.$color};
  border-radius: 3px;
  transition: width 0.8s ease;
`