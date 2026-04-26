// src/pages/RecordsPage.tsx
import React, { useEffect, useState, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useAuthStore } from '@/store/auth.store'
import { pillApi } from '@/services/api'
import { useToast } from '@/components/ui/Toast'
import { PillDraw, PillRecord } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import LoadingSpinner, { LoadingOverlay } from '@/components/ui/LoadingSpinner'
import { shared } from '@/styles/theme'

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`

const Page = styled.div<{ $bg: string }>`
  padding: 20px;
  min-height: 100%;
  background: ${p => p.$bg};
  animation: ${fadeUp} 0.3s ease;
`

const FormCard = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  border-radius: 16px;
  border: 1px solid ${p => p.$border};
  padding: 20px;
  margin-bottom: 22px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
`

const CardTitle = styled.h3<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${p => p.$color};
  margin-bottom: 6px;
`

const PillRef = styled.p<{ $color: string }>`
  font-size: 13px;
  color: ${p => p.$color};
  margin-bottom: 16px;
`

const FormGroup = styled.div` margin-bottom: 14px; `

const Label = styled.label<{ $color: string }>`
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: ${p => p.$color};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`

const InputEl = styled.input<{ $border: string; $primary: string; $bg: string; $text: string }>`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1.5px solid ${p => p.$border};
  border-radius: 10px;
  font-size: 14px;
  color: ${p => p.$text};
  background: ${p => p.$bg};
  appearance: none;
  outline: none;
  transition: border-color 0.2s;
  &:focus { border-color: ${p => p.$primary}; }
`

const TextareaEl = styled.textarea<{ $border: string; $primary: string; $bg: string; $text: string }>`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${p => p.$border};
  border-radius: 10px;
  font-size: 14px;
  color: ${p => p.$text};
  background: ${p => p.$bg};
  outline: none;
  resize: none;
  min-height: 90px;
  transition: border-color 0.2s;
  &:focus { border-color: ${p => p.$primary}; }
  &::placeholder { color: ${p => p.$text}88; }
`

const SaveBtn = styled.button<{ $color: string }>`
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, ${p => p.$color}, ${p => p.$color}cc);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:active { opacity: 0.85; transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const SectionTitle = styled.h2<{ $color: string }>`
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: ${p => p.$color};
  margin-bottom: 14px;
`

const DrawBlock = styled.div<{ $border: string; $accent: string }>`
  border-radius: 14px;
  border: 1px solid ${p => p.$border};
  border-left: 4px solid ${p => p.$accent};
  overflow: hidden;
  margin-bottom: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`

const DrawHeader = styled.div<{ $bg: string }>`
  background: ${p => p.$bg};
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`

const DrawHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const PillDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${p => p.$color};
  flex-shrink: 0;
`

const WeekTag = styled.span<{ $bg: string; $color: string }>`
  font-size: 11px;
  background: ${p => p.$bg};
  color: ${p => p.$color};
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
`

const RecordItem = styled.div<{ $bg: string; $border: string }>`
  background: ${p => p.$bg};
  padding: 14px 16px;
  border-top: 1px solid ${p => p.$border};
  position: relative;
`

const RecordDate = styled.div<{ $color: string }>`
  font-size: 11px;
  font-weight: 600;
  color: ${p => p.$color};
  margin-bottom: 4px;
`

const RecordText = styled.p<{ $color: string }>`
  font-size: 13px;
  color: ${p => p.$color};
  line-height: 1.55;
`

const RecordHow = styled.p<{ $color: string }>`
  font-size: 12px;
  color: ${p => p.$color};
  font-style: italic;
  margin-top: 4px;
`

const ActionBtns = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
`

const ActionBtn = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.15s;
  padding: 4px;
  &:hover { opacity: 0.8; }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  .icon { font-size: 44px; margin-bottom: 10px; opacity: 0.4; }
  p { font-size: 14px; color: #94A3B8; line-height: 1.6; }
`

const FAB = styled.button<{ $color: string }>`
  position: fixed;
  right: 20px;
  bottom: calc(${shared.navHeight} + 16px);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${p => p.$color};
  color: #fff;
  font-size: 22px;
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

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 999;
  display: flex; align-items: center; justify-content: center; padding: 20px;
`
const ModalCard = styled.div<{ $bg: string }>`
  background: ${p => p.$bg}; border-radius: 16px; padding: 20px; width: 100%; max-width: 380px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`

export default function RecordsPage() {
  const { theme } = useAuthStore()
  const { show } = useToast()
  const formRef = useRef<HTMLDivElement>(null)

  const [currentDraw, setCurrentDraw] = useState<PillDraw | null>(null)
  const [history, setHistory] = useState<PillDraw[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedDraw, setExpandedDraw] = useState<string | null>(null)

  const [what, setWhat] = useState('')
  const [when, setWhen] = useState(() => {
    const now = new Date()
    now.setSeconds(0)
    return now.toISOString().slice(0, 16)
  })
  const [how, setHow] = useState('')

  const [editRecord, setEditRecord] = useState<PillRecord | null>(null)
  const [editWhat, setEditWhat] = useState('')
  const [editWhen, setEditWhen] = useState('')
  const [editHow, setEditHow] = useState('')

  const loadData = async () => {
    try {
      const [curr, hist] = await Promise.all([
        pillApi.getCurrent(),
        pillApi.getHistory(),
      ])
      setCurrentDraw(curr.data.draw)
      const draws: PillDraw[] = hist.data.draws || []
      setHistory(draws)
      if (draws.length > 0) setExpandedDraw(draws[0].id)
    } catch { show('Erro ao carregar dados') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async () => {
    if (!what.trim()) { show('Descreva o que você fez'); return }
    if (!currentDraw) return
    setSaving(true)
    try {
      await pillApi.createRecord({ drawId: currentDraw.id, what, when: new Date(when).toISOString(), how: how.trim() || undefined })
      setWhat(''); setHow('')
      show('Registro salvo! 💕')
      loadData()
    } catch { show('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const handleDelete = async (recordId: string) => {
    if (!window.confirm('Remover este registro?')) return
    setDeleting(recordId)
    try {
      await pillApi.deleteRecord(recordId)
      show('Registro removido')
      loadData()
    } catch { show('Erro ao remover') }
    finally { setDeleting(null) }
  }

  const handleEditOpen = (rec: PillRecord) => {
    setEditRecord(rec)
    setEditWhat(rec.what)
    setEditWhen(new Date(rec.when).toISOString().slice(0, 16))
    setEditHow(rec.how || '')
  }

  const handleEditSave = async () => {
    if (!editRecord || !editWhat.trim()) return
    setSaving(true)
    try {
      await pillApi.updateRecord(editRecord.id, {
        what: editWhat,
        when: new Date(editWhen).toISOString(),
        how: editHow.trim() || undefined
      })
      show('Registro atualizado! 💕')
      setEditRecord(null)
      loadData()
    } catch { show('Erro ao atualizar') }
    finally { setSaving(false) }
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => {
      const textareas = formRef.current?.getElementsByTagName('textarea')
      if (textareas && textareas.length > 0) {
        textareas[0].focus()
      }
    }, 400)
  }

  const fmtDate = (d: string) => format(new Date(d), "d 'de' MMM, HH:mm", { locale: ptBR })

  if (loading) return (
    <Page $bg={theme.cream}>
      <LoadingSpinner message="Carregando registros..." fullPage showIcon />
    </Page>
  )

  return (
    <Page $bg={theme.cream}>
      {/* Saving overlay */}
      {saving && <LoadingOverlay message="Salvando registro..." />}
      {/* Deleting overlay */}
      {deleting && <LoadingOverlay message="Removendo registro..." />}

      {/* FORM */}
      {currentDraw && (
        <div ref={formRef}>
          <FormCard $bg={theme.white} $border={theme.border}>
            <CardTitle $color={theme.primaryDark}>Registrar experiência</CardTitle>
            <PillRef $color={theme.primary}>{currentDraw.pill.emoji} {currentDraw.pill.name} — Semana {currentDraw.weekNumber}</PillRef>

            <FormGroup>
              <Label $color={theme.textMuted}>O que você fez? *</Label>
              <TextareaEl
                placeholder="Descreva o que realizou..."
                value={what}
                onChange={e => setWhat(e.target.value)}
                $border={theme.border}
                $primary={theme.primary}
                $bg={theme.cream}
                $text={theme.text}
              />
            </FormGroup>
            <FormGroup>
              <Label $color={theme.textMuted}>Quando foi?</Label>
              <InputEl
                type="datetime-local"
                value={when}
                onChange={e => setWhen(e.target.value)}
                $border={theme.border}
                $primary={theme.primary}
                $bg={theme.cream}
                $text={theme.text}
              />
            </FormGroup>
            <FormGroup>
              <Label $color={theme.textMuted}>Como foi? (opcional)</Label>
              <TextareaEl
                placeholder="Como se sentiu, o que aconteceu..."
                value={how}
                onChange={e => setHow(e.target.value)}
                $border={theme.border}
                $primary={theme.primary}
                $bg={theme.cream}
                $text={theme.text}
                style={{ minHeight: 70 }}
              />
            </FormGroup>
            <SaveBtn $color={theme.primary} onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : '💕 Salvar registro'}
            </SaveBtn>
          </FormCard>
        </div>
      )}

      {/* HISTORY */}
      <SectionTitle $color={theme.primaryDark}>Histórico de pílulas</SectionTitle>

      {history.length === 0 ? (
        <EmptyState>
          <div className="icon">💊</div>
          <p>Seu histórico de pílulas<br />e registros aparecerá aqui.</p>
        </EmptyState>
      ) : (
        history.map(draw => (
          <DrawBlock key={draw.id} $border={theme.border} $accent={draw.pill.color}>
            <DrawHeader
              $bg={theme.white}
              onClick={() => setExpandedDraw(expandedDraw === draw.id ? null : draw.id)}
            >
              <DrawHeaderLeft>
                <PillDot $color={draw.pill.color} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: theme.text }}>{draw.pill.emoji} {draw.pill.name}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                    {fmtDate(draw.drawnAt)} · {draw.records?.length || 0} registro{draw.records?.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </DrawHeaderLeft>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <WeekTag $bg={theme.primaryLight} $color={theme.primary}>Sem. {draw.weekNumber}</WeekTag>
                <span style={{ color: theme.textLight, fontSize: 16 }}>{expandedDraw === draw.id ? '▲' : '▼'}</span>
              </div>
            </DrawHeader>

            {expandedDraw === draw.id && (
              <>
                {(!draw.records || draw.records.length === 0) ? (
                  <RecordItem $bg={theme.cream} $border={theme.border}>
                    <p style={{ fontSize: 13, color: theme.textMuted, textAlign: 'center', padding: '8px 0' }}>Nenhum registro para esta pílula.</p>
                  </RecordItem>
                ) : (
                  (draw.records as PillRecord[]).map(rec => (
                    <RecordItem key={rec.id} $bg={theme.cream} $border={theme.border}>
                      <RecordDate $color={theme.primary}>📝 {fmtDate(rec.when)}</RecordDate>
                      <RecordText $color={theme.text}>{rec.what}</RecordText>
                      {rec.how && <RecordHow $color={theme.textMuted}>{rec.how}</RecordHow>}
                      <ActionBtns>
                        <ActionBtn onClick={() => handleEditOpen(rec)}>✏️</ActionBtn>
                        <ActionBtn onClick={() => handleDelete(rec.id)} disabled={deleting === rec.id}>
                          {deleting === rec.id ? '⏳' : '🗑'}
                        </ActionBtn>
                      </ActionBtns>
                    </RecordItem>
                  ))
                )}
              </>
            )}
          </DrawBlock>
        ))
      )}

      {currentDraw && (
        <FAB $color={theme.primary} onClick={scrollToForm} title="Novo registro">➕</FAB>
      )}

      {/* EDIT MODAL */}
      {editRecord && (
        <ModalOverlay onClick={() => setEditRecord(null)}>
          <ModalCard $bg={theme.white} onClick={e => e.stopPropagation()}>
            <CardTitle $color={theme.primaryDark}>Editar registro</CardTitle>
            <FormGroup style={{ marginTop: 14 }}>
              <Label $color={theme.textMuted}>O que você fez? *</Label>
              <TextareaEl
                value={editWhat}
                onChange={e => setEditWhat(e.target.value)}
                $border={theme.border} $primary={theme.primary} $bg={theme.cream} $text={theme.text}
              />
            </FormGroup>
            <FormGroup>
              <Label $color={theme.textMuted}>Quando foi?</Label>
              <InputEl
                type="datetime-local"
                value={editWhen}
                onChange={e => setEditWhen(e.target.value)}
                $border={theme.border} $primary={theme.primary} $bg={theme.cream} $text={theme.text}
              />
            </FormGroup>
            <FormGroup>
              <Label $color={theme.textMuted}>Como foi? (opcional)</Label>
              <TextareaEl
                value={editHow}
                onChange={e => setEditHow(e.target.value)}
                $border={theme.border} $primary={theme.primary} $bg={theme.cream} $text={theme.text}
                style={{ minHeight: 70 }}
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <SaveBtn $color={theme.textMuted} onClick={() => setEditRecord(null)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.text }}>
                Cancelar
              </SaveBtn>
              <SaveBtn $color={theme.primary} onClick={handleEditSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </SaveBtn>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  )
}
