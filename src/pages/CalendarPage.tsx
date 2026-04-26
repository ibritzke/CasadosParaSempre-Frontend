// src/pages/CalendarPage.tsx
import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuthStore } from '@/store/auth.store'
import { calendarApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { CalendarEvent, EventType } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, isWithinInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LoadingOverlay } from '@/components/ui/LoadingSpinner'
import { shared } from '@/styles/theme'

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

const CycleInfo = styled.div<{ $bg: string; $color: string }>`
  margin-top: 8px;
  padding: 6px 12px;
  background: ${p => p.$bg};
  border-radius: 20px;
  font-size: 12px;
  color: ${p => p.$color};
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
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

const CalDay = styled.div<{
  $today: boolean
  $otherMonth: boolean
  $primary: string
  $light: string
  $periodColor: string
  $periodPos: 'start' | 'mid' | 'end' | 'single' | null
  $isPredicted: boolean
}>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 3px 2px;
  border-radius: ${p =>
    p.$periodPos === 'start' ? '10px 0 0 10px' :
    p.$periodPos === 'end' ? '0 10px 10px 0' :
    p.$periodPos === 'mid' ? '0' :
    '10px'};
  cursor: pointer;
  position: relative;
  transition: background 0.12s;
  min-height: 40px;
  background: ${p =>
    p.$periodPos ? p.$periodColor + (p.$isPredicted ? '40' : '30') :
    p.$today ? p.$primary : 'transparent'};
  opacity: ${p => p.$otherMonth ? 0.35 : 1};
  border: ${p => p.$isPredicted && p.$periodPos ? `1px dashed ${p.$periodColor}99` : 'none'};

  &:hover { background: ${p => p.$periodPos ? p.$periodColor + '55' : p.$today ? p.$primary : p.$light}; }

  .day-num {
    font-size: 13px;
    color: ${p => p.$today ? '#fff' : p.$periodPos ? p.$periodColor : 'inherit'};
    line-height: 1;
    font-weight: ${p => p.$today || p.$periodPos ? 600 : 400};
    position: relative;
    z-index: 1;
  }
`

const DotsRow = styled.div`
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 3px;
  max-width: 28px;
  position: relative;
  z-index: 1;
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

// Event config — 3 types only
const EVENT_CONFIG: Record<EventType, { icon: string; label: string; color: string; bg: string }> = {
  SEX:    { icon: '🌹', label: 'Intimidade',   color: '#E87C6B', bg: '#FEF0EE' },
  PERIOD: { icon: '🌸', label: 'Menstruação',  color: '#D1477A', bg: '#FCE4EE' },
  NOTE:   { icon: '📝', label: 'Nota',         color: '#6BA3BE', bg: '#EEF4F9' },
}

// Modal styled
const EventTypeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
`

const EventTypeBtn = styled.button<{ $selected: boolean; $border: string; $primary: string; $light: string }>`
  padding: 14px 8px;
  border: 2px solid ${p => p.$selected ? p.$primary : p.$border};
  border-radius: 12px;
  background: ${p => p.$selected ? p.$light : '#fafafa'};
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  .icon { font-size: 22px; margin-bottom: 4px; display: block; }
  span { font-size: 12px; color: #374151; font-family: 'DM Sans', sans-serif; }
  &:active { transform: scale(0.97); }
`

const DateRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
`

const DateCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const DateLabel = styled.label<{ $color: string }>`
  font-size: 11px;
  font-weight: 500;
  color: ${p => p.$color};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const DateInput = styled.input<{ $border: string; $primary: string }>`
  padding: 10px 12px;
  border: 1.5px solid ${p => p.$border};
  border-radius: 10px;
  font-size: 13px;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  &:focus { border-color: ${p => p.$primary}; }
`

const InfoBox = styled.div<{ $bg: string; $color: string }>`
  background: ${p => p.$bg};
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  color: ${p => p.$color};
  margin-bottom: 14px;
  line-height: 1.5;
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

const FABWrapper = styled.div`
  position: fixed;
  bottom: calc(${shared.navHeight} + 16px);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  pointer-events: none;
  z-index: 50;
`

const FAB = styled.button<{ $color: string }>`
  position: absolute;
  right: 20px;
  bottom: 0;
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
  pointer-events: auto;
  transition: transform 0.2s;
  &:active { transform: scale(0.92); }
`

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_PT   = ['D','S','T','Q','Q','S','S']

// Format a Date to "yyyy-MM-dd" for input[type=date]
function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

export default function CalendarPage() {
  const { theme } = useAuthStore()
  const { show } = useToast()

  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [avgCycleDays, setAvgCycleDays] = useState<number | null>(null)
  const [nextPeriodDate, setNextPeriodDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedType, setSelectedType] = useState<EventType | null>(null)
  const [note, setNote] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const loadEvents = async () => {
    try {
      const { data } = await calendarApi.getEvents(viewDate.getMonth(), viewDate.getFullYear())
      setEvents(data.events || [])
      setAvgCycleDays(data.avgCycleDays || null)
      setNextPeriodDate(data.nextPeriodDate || null)
    } catch { show('Erro ao carregar eventos') }
  }

  useEffect(() => { loadEvents() }, [viewDate])

  const openModal = (day: Date) => {
    setSelectedDay(day)
    setSelectedType(null)
    setNote('')
    setPeriodStart(toDateInputValue(day))
    setPeriodEnd(toDateInputValue(day))
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!selectedType || !selectedDay) { show('Selecione o tipo de evento'); return }
    setSaving(true)
    try {
      if (selectedType === 'PERIOD') {
        const startDate = parseLocalDate(periodStart)
        const endDate = periodEnd ? parseLocalDate(periodEnd) : null
        if (endDate && endDate < startDate) { show('A data de término não pode ser antes do início'); setSaving(false); return }

        await calendarApi.createEvent({
          type: 'PERIOD',
          date: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : null,
          note: note.trim() || undefined,
        })
      } else {
        const date = new Date(selectedDay)
        date.setHours(12, 0, 0, 0)
        await calendarApi.createEvent({ type: selectedType, date: date.toISOString(), note: note.trim() || undefined })
      }
      setModalOpen(false)
      show('Evento salvo! 📅')
      loadEvents()
    } catch { show('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este evento?')) return
    setDeleting(true)
    try {
      await calendarApi.deleteEvent(id)
      show('Evento removido')
      loadEvents()
    } catch { show('Erro ao remover') }
    finally { setDeleting(false) }
  }

  // Calendar days
  const firstDay = startOfMonth(viewDate)
  const lastDay = endOfMonth(viewDate)
  const days = eachDayOfInterval({ start: firstDay, end: lastDay })
  const startOffset = getDay(firstDay)

  const getEventsForDay = (d: Date) =>
    events.filter(e => {
      if (isSameDay(parseISO(e.date), d)) return true
      if (e.endDate && !isSameDay(parseISO(e.date), parseISO(e.endDate))) {
        return isWithinInterval(d, { start: parseISO(e.date), end: parseISO(e.endDate) })
      }
      return false
    })

  // Determine period position for a day (for visual range rendering)
  const getPeriodInfo = (d: Date): { color: string; pos: 'start' | 'mid' | 'end' | 'single' | null; isPredicted: boolean } => {
    // Check predicted period
    if (nextPeriodDate && avgCycleDays) {
      const np = parseISO(nextPeriodDate)
      // Predict 5-day period
      const npEnd = new Date(np.getTime() + 4 * 24 * 60 * 60 * 1000)
      if (isWithinInterval(d, { start: np, end: npEnd })) {
        const isStart = isSameDay(d, np)
        const isEnd = isSameDay(d, npEnd)
        return {
          color: EVENT_CONFIG.PERIOD.color,
          pos: isStart && isEnd ? 'single' : isStart ? 'start' : isEnd ? 'end' : 'mid',
          isPredicted: true,
        }
      }
    }

    const periodEvents = events.filter(e => e.type === 'PERIOD')
    for (const ev of periodEvents) {
      const start = parseISO(ev.date)
      const end = ev.endDate ? parseISO(ev.endDate) : start

      if (isWithinInterval(d, { start, end }) || isSameDay(d, start)) {
        const isStart = isSameDay(d, start)
        const isEnd = isSameDay(d, end)
        return {
          color: EVENT_CONFIG.PERIOD.color,
          pos: isStart && isEnd ? 'single' : isStart ? 'start' : isEnd ? 'end' : 'mid',
          isPredicted: false,
        }
      }
    }
    return { color: '', pos: null, isPredicted: false }
  }

  const monthEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  return (
    <Page $bg={theme.cream}>
      {saving && <LoadingOverlay message="Salvando evento..." />}
      {deleting && <LoadingOverlay message="Removendo evento..." />}

      {/* Calendar Header */}
      <CalHeader $bg={theme.white} $border={theme.border}>
        <MonthNav>
          <NavBtn $bg={theme.primaryLight} $color={theme.primary} onClick={prevMonth}>‹</NavBtn>
          <MonthTitle $color={theme.primaryDark}>{MONTHS_PT[viewDate.getMonth()]} {viewDate.getFullYear()}</MonthTitle>
          <NavBtn $bg={theme.primaryLight} $color={theme.primary} onClick={nextMonth}>›</NavBtn>
        </MonthNav>

        {/* Cycle info */}
        {avgCycleDays && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <CycleInfo $bg="#FCE4EE" $color="#D1477A">
              🔄 Ciclo médio: {avgCycleDays} dias
            </CycleInfo>
            {nextPeriodDate && (
              <CycleInfo $bg="#FBF3E4" $color="#C9973A">
                📅 Próx.: {format(parseISO(nextPeriodDate), "d 'de' MMM", { locale: ptBR })} (previsão)
              </CycleInfo>
            )}
          </div>
        )}
      </CalHeader>

      {/* Day headers */}
      <CalGrid style={{ background: theme.white, paddingBottom: 8, borderBottom: `1px solid ${theme.border}` }}>
        {DAYS_PT.map((d, i) => <DayHeader key={i} $color={theme.textLight}>{d}</DayHeader>)}
      </CalGrid>

      {/* Calendar grid */}
      <CalGrid style={{ background: theme.white }}>
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}

        {days.map(day => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isOther = !isSameMonth(day, viewDate)
          const periodInfo = getPeriodInfo(day)
          const nonPeriodEvents = dayEvents.filter(e => e.type !== 'PERIOD')
          return (
            <CalDay
              key={day.toISOString()}
              $today={isToday && !periodInfo.pos}
              $otherMonth={isOther}
              $primary={theme.primary}
              $light={theme.primaryLight}
              $periodColor={EVENT_CONFIG.PERIOD.color}
              $periodPos={periodInfo.pos}
              $isPredicted={periodInfo.isPredicted}
              onClick={() => openModal(day)}
            >
              <span className="day-num">{day.getDate()}</span>
              {nonPeriodEvents.length > 0 && (
                <DotsRow>
                  {nonPeriodEvents.slice(0, 3).map(e => (
                    <Dot key={e.id} $color={EVENT_CONFIG[e.type]?.color || '#ccc'} />
                  ))}
                </DotsRow>
              )}
            </CalDay>
          )
        })}
      </CalGrid>

      {/* Legend */}
      <div style={{ padding: '8px 18px', display: 'flex', gap: 12, flexWrap: 'wrap', background: theme.white, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: theme.textMuted }}>
          <div style={{ width: 18, height: 10, background: EVENT_CONFIG.PERIOD.color + '55', borderRadius: 3 }} />
          Menstruação
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: theme.textMuted }}>
          <div style={{ width: 18, height: 10, background: EVENT_CONFIG.PERIOD.color + '30', border: `1px dashed ${EVENT_CONFIG.PERIOD.color}88`, borderRadius: 3 }} />
          Previsão
        </div>
      </div>

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
            const evDate = parseISO(ev.date)
            const evEndDate = ev.endDate ? parseISO(ev.endDate) : null
            return (
              <ListItem key={ev.id} $bg={theme.white} $border={theme.border}>
                <ListIcon $bg={cfg.bg}>{cfg.icon}</ListIcon>
                <ListInfo>
                  <ListTitle $color={theme.text}>{cfg.label}</ListTitle>
                  {ev.note && <ListNote $color={theme.textMuted}>{ev.note}</ListNote>}
                  <ListDate $color={theme.textLight}>
                    {ev.type === 'PERIOD' && evEndDate && !isSameDay(evDate, evEndDate)
                      ? `${format(evDate, "d 'de' MMM", { locale: ptBR })} → ${format(evEndDate, "d 'de' MMM", { locale: ptBR })}`
                      : format(evDate, "d 'de' MMMM", { locale: ptBR })
                    }
                  </ListDate>
                </ListInfo>
                <DeleteListBtn onClick={() => handleDelete(ev.id)}>🗑</DeleteListBtn>
              </ListItem>
            )
          })
        )}
      </ListSection>

      {/* FAB — positioned securely above nav bar & constrained to 430px */}
      <FABWrapper>
        <FAB $color={theme.primary} onClick={() => openModal(today)}>+</FAB>
      </FABWrapper>

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

        {/* Period range picker */}
        {selectedType === 'PERIOD' && (
          <>
            <InfoBox $bg="#FCE4EE" $color="#D1477A">
              🌸 Selecione o <strong>início</strong> e o <strong>término</strong> da menstruação. O ciclo será calculado automaticamente!
            </InfoBox>
            <DateRow>
              <DateCol>
                <DateLabel $color={theme.textMuted}>Início *</DateLabel>
                <DateInput
                  type="date"
                  value={periodStart}
                  onChange={e => setPeriodStart(e.target.value)}
                  $border={theme.border}
                  $primary={theme.primary}
                />
              </DateCol>
              <DateCol>
                <DateLabel $color={theme.textMuted}>Término</DateLabel>
                <DateInput
                  type="date"
                  value={periodEnd}
                  min={periodStart}
                  onChange={e => setPeriodEnd(e.target.value)}
                  $border={theme.border}
                  $primary={theme.primary}
                />
              </DateCol>
            </DateRow>
          </>
        )}

        <ModalTextarea
          placeholder={selectedType === 'PERIOD' ? 'Observação (cólicas, fluxo, humor...)' : 'Observação (opcional)...'}
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
