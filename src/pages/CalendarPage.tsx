// src/pages/CalendarPage.tsx
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuthStore } from '@/store/auth.store'
import { calendarApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { CalendarEvent, EventType } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const fadeUp = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div<{ $bg: string }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${p => p.$bg};
  animation: ${fadeUp} 0.3s ease;
`

const CalHeader = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-bottom: 1px solid ${p => p.$border};
  padding: 14px 18px 10px;
  flex-shrink: 0;
`

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const MonthTitle = styled.h2<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: ${p => p.$color};
  font-weight: 600;
`

const NavBtn = styled.button<{ $bg: string; $color: string }>`
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  &:active { filter: brightness(0.9); }
`

const CalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 10px 14px 6px;
  background: inherit;
  flex-shrink: 0;
`

const DayHeader = styled.div<{ $color: string }>`
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: ${p => p.$color};
  padding: 4px 0;
  text-transform: uppercase;
`

const CalDay = styled.div<{ $today: boolean; $otherMonth: boolean; $primary: string; $light: string }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 3px 2px;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: background 0.12s;
  min-height: 40px;
  background: ${p => p.$today ? p.$primary : 'transparent'};
  opacity: ${p => p.$otherMonth ? 0.35 : 1};

  &:hover { background: ${p => p.$today ? p.$primary : p.$light}; }

  .day-num {
    font-size: 13px;
    color: ${p => p.$today ? '#fff' : 'inherit'};
    line-height: 1;
    font-weight: ${p => p.$today ? 600 : 400};
  }
`

const DotsRow = styled.div`
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 3px;
  max-width: 28px;
`

const Dot = styled.div<{ $color: string }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`

const ListSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 80px;
`

const ListMonthTitle = styled.h3<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  color: ${p => p.$color};
  margin-bottom: 12px;
`

const ListItem = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 12px;
  border: 1px solid ${p => p.$border};
  padding: 13px 14px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
`

const ListIcon = styled.div<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${p => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`

const ListInfo = styled.div``

const ListTitle = styled.div<{ $color: string }>`
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.$color};
`

const ListNote = styled.p<{ $color: string }>`
  font-size: 12px;
  color: ${p => p.$color};
  margin-top: 2px;
  line-height: 1.4;
`

const ListDate = styled.div<{ $color: string }>`
  font-size: 11px;
  color: ${p => p.$color};
  margin-top: 4px;
`

const DeleteListBtn = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.35;
  padding: 4px;
  flex-shrink: 0;
  transition: opacity 0.15s;
  &:hover { opacity: 0.7; }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 0;
  .icon { font-size: 40px; margin-bottom: 10px; opacity: 0.4; }
  p { font-size: 13px; color: #94A3B8; line-height: 1.6; }
`

// Event type config
const EVENT_CONFIG: Record<EventType, { icon: string; label: string; color: string; bg: string }> = {
  SEX:    { icon: '🌹', label: 'Intimidade',   color: '#E87C6B', bg: '#FEF0EE' },
  PERIOD: { icon: '🌸', label: 'Menstruação',  color: '#C9973A', bg: '#FBF3E4' },
  CYCLE:  { icon: '🔄', label: 'Ciclo',        color: '#9B7BB5', bg: '#F3EFFA' },
  NOTE:   { icon: '📝', label: 'Nota',         color: '#6BA3BE', bg: '#EEF4F9' },
}

// Modal styled
const EventTypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
`

const EventTypeBtn = styled.button<{ $selected: boolean; $border: string; $primary: string; $light: string }>`
  padding: 14px 10px;
  border: 2px solid ${p => p.$selected ? p.$primary : p.$border};
  border-radius: 12px;
  background: ${p => p.$selected ? p.$light : '#fafafa'};
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  .icon { font-size: 24px; margin-bottom: 4px; display: block; }
  span { font-size: 13px; color: #374151; font-family: 'DM Sans', sans-serif; }
  &:active { transform: scale(0.97); }
`

const ModalTextarea = styled.textarea<{ $border: string; $primary: string }>`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${p => p.$border};
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  resize: none;
  min-height: 80px;
  margin-bottom: 16px;
  transition: border-color 0.2s;
  &:focus { border-color: ${p => p.$primary}; }
  &::placeholder { color: #94a3b8; }
`

const ModalBtnRow = styled.div`
  display: flex;
  gap: 10px;
`

const ModalSaveBtn = styled.button<{ $color: string }>`
  flex: 1;
  padding: 13px;
  background: ${p => p.$color};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  &:active { opacity: 0.85; }
  &:disabled { opacity: 0.6; }
`

const ModalCancelBtn = styled.button`
  padding: 13px 18px;
  background: #FEE2E2;
  color: #DC2626;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  &:active { opacity: 0.85; }
`

const FAB = styled.button<{ $color: string }>`
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${p => p.$color};
  color: #fff;
  font-size: 24px;
  border: none;
  box-shadow: 0 6px 18px ${p => p.$color}55;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  transition: transform 0.2s;
  &:active { transform: scale(0.92); }
`

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_PT   = ['D','S','T','Q','Q','S','S']

export default function CalendarPage() {
  const { theme } = useAuthStore()
  const { show } = useToast()

  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedType, setSelectedType] = useState<EventType | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const loadEvents = async () => {
    try {
      const { data } = await calendarApi.getEvents(viewDate.getMonth(), viewDate.getFullYear())
      setEvents(data.events || [])
    } catch { show('Erro ao carregar eventos') }
  }

  useEffect(() => { loadEvents() }, [viewDate])

  const openModal = (day: Date) => {
    setSelectedDay(day)
    setSelectedType(null)
    setNote('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!selectedType || !selectedDay) { show('Selecione o tipo de evento'); return }
    setSaving(true)
    try {
      const date = new Date(selectedDay)
      date.setHours(12, 0, 0, 0)
      await calendarApi.createEvent({ type: selectedType, date: date.toISOString(), note: note.trim() || undefined })
      setModalOpen(false)
      show('Evento salvo! 📅')
      loadEvents()
    } catch { show('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este evento?')) return
    try {
      await calendarApi.deleteEvent(id)
      show('Evento removido')
      loadEvents()
    } catch { show('Erro ao remover') }
  }

  // Calendar days
  const firstDay = startOfMonth(viewDate)
  const lastDay = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startOffset = getDay(firstDay) // 0=Sun

  const getEventsForDay = (d: Date) =>
    events.filter(e => isSameDay(new Date(e.date), d))

  // List events for the month (sorted)
  const monthEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <Page $bg={theme.cream}>
      {/* Calendar Header */}
      <CalHeader $bg={theme.white} $border={theme.border}>
        <MonthNav>
          <NavBtn $bg={theme.primaryLight} $color={theme.primary} onClick={prevMonth}>‹</NavBtn>
          <MonthTitle $color={theme.primaryDark}>{MONTHS_PT[viewDate.getMonth()]} {viewDate.getFullYear()}</MonthTitle>
          <NavBtn $bg={theme.primaryLight} $color={theme.primary} onClick={nextMonth}>›</NavBtn>
        </MonthNav>
      </CalHeader>

      {/* Day headers */}
      <CalGrid style={{ background: theme.white, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>
        {DAYS_PT.map((d, i) => <DayHeader key={i} $color={theme.textLight}>{d}</DayHeader>)}
      </CalGrid>

      {/* Calendar grid */}
      <CalGrid style={{ background: theme.white }}>
        {/* Empty slots before first day */}
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}

        {days.map(day => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isOther = !isSameMonth(day, viewDate)
          return (
            <CalDay
              key={day.toISOString()}
              $today={isToday}
              $otherMonth={isOther}
              $primary={theme.primary}
              $light={theme.primaryLight}
              onClick={() => openModal(day)}
            >
              <span className="day-num">{day.getDate()}</span>
              {dayEvents.length > 0 && (
                <DotsRow>
                  {dayEvents.slice(0, 4).map(e => (
                    <Dot key={e.id} $color={EVENT_CONFIG[e.type]?.color || '#ccc'} />
                  ))}
                </DotsRow>
              )}
            </CalDay>
          )
        })}
      </CalGrid>

      {/* Event list */}
      <ListSection>
        <ListMonthTitle $color={theme.primaryDark}>{MONTHS_PT[viewDate.getMonth()]}</ListMonthTitle>

        {monthEvents.length === 0 ? (
          <EmptyState>
            <div className="icon">📅</div>
            <p>Nenhum evento em {MONTHS_PT[viewDate.getMonth()]}.<br />Toque em um dia para adicionar!</p>
          </EmptyState>
        ) : (
          monthEvents.map(ev => {
            const cfg = EVENT_CONFIG[ev.type]
            const evDate = new Date(ev.date)
            return (
              <ListItem key={ev.id} $bg={theme.white} $border={theme.border}>
                <ListIcon $bg={cfg.bg}>{cfg.icon}</ListIcon>
                <ListInfo>
                  <ListTitle $color={theme.text}>{cfg.label}</ListTitle>
                  {ev.note && <ListNote $color={theme.textMuted}>{ev.note}</ListNote>}
                  <ListDate $color={theme.textLight}>
                    {format(evDate, "d 'de' MMMM", { locale: ptBR })}
                  </ListDate>
                </ListInfo>
                <DeleteListBtn onClick={() => handleDelete(ev.id)}>🗑</DeleteListBtn>
              </ListItem>
            )
          })
        )}
      </ListSection>

      {/* FAB */}
      <FAB $color={theme.primary} onClick={() => openModal(today)}>+</FAB>

      {/* Add Event Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedDay ? `${selectedDay.getDate()} de ${MONTHS_PT[selectedDay.getMonth()]}` : 'Adicionar evento'}
        theme={theme}
      >
        <EventTypeGrid>
          {(Object.entries(EVENT_CONFIG) as [EventType, typeof EVENT_CONFIG[EventType]][]).map(([type, cfg]) => (
            <EventTypeBtn
              key={type}
              $selected={selectedType === type}
              $border={theme.border}
              $primary={theme.primary}
              $light={theme.primaryLight}
              onClick={() => setSelectedType(type)}
            >
              <span className="icon">{cfg.icon}</span>
              <span>{cfg.label}</span>
            </EventTypeBtn>
          ))}
        </EventTypeGrid>

        <ModalTextarea
          placeholder="Observação (opcional)..."
          value={note}
          onChange={e => setNote(e.target.value)}
          $border={theme.border}
          $primary={theme.primary}
        />

        <ModalBtnRow>
          <ModalSaveBtn $color={theme.primary} onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </ModalSaveBtn>
          <ModalCancelBtn onClick={() => setModalOpen(false)}>Cancelar</ModalCancelBtn>
        </ModalBtnRow>
      </Modal>
    </Page>
  )
}
