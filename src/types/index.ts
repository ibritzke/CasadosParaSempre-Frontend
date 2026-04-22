// src/types/index.ts

export type UserRole = 'HUSBAND' | 'WIFE'
export type EventType = 'SEX' | 'PERIOD' | 'CYCLE' | 'NOTE'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  spouseName?: string
  coupleCode?: string
  avatarUrl?: string
  isAdmin: boolean
  createdAt: string
}

export interface Pill {
  id: number
  name: string
  description: string
  emoji: string
  color: string
}

export interface PillDraw {
  id: string
  userId: string
  pillId: number
  weekNumber: number
  year: number
  drawnAt: string
  expiresAt: string
  cancelled: boolean
  pill: Pill
  records?: PillRecord[]
}

export interface PillRecord {
  id: string
  drawId: string
  what: string
  when: string
  how?: string
  createdAt: string
}

export interface CalendarEvent {
  id: string
  userId: string
  type: EventType
  date: string
  note?: string
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  husbands: number
  wives: number
  couples: number
  totalDraws: number
  totalRecords: number
  totalEvents: number
}

export interface AdminUser extends User {
  isActive: boolean
  _count: { pillDraws: number; pillRecords: number }
}
