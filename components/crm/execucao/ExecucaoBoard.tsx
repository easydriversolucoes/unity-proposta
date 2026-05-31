'use client'
import { useState, useTransition, useEffect, useRef } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import Image from 'next/image'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { TarefaExecucao, EtapaTarefa, FaseRecurso, TipoProcesso, ProcessoRecurso } from '@/types/crm'
import { FASE_LABELS, TIPO_PROCESSO_LABELS } from '@/types/crm'
import {
  moveTarefaAction, arquivarTarefaAction, getTarefasAction,
  updateTarefaAction, agendarEnvioAction, agendarProtocoloAction,
  createTarefaComProcessoAction, getClientesPagamentoAction, getClienteProcessosAction,
} from '@/app/crm/execucao/actions'

// ─── Column definitions ───────────────────────────────────────────────────────

const EXEC_COLUMNS: Array<{ id: EtapaTarefa; label: string; color: string }> = [
  { id: 'a_redigir',             label: 'A redigir',              color: '#60A5FA' },
  { id: 'envio_agendado',        label: 'Envio agendado',         color: '#A78BFA' },
  { id: 'documentos_solicitados',label: 'Documentos solicitados', color: '#FBBF24' },
  { id: 'aguardando_protocolo',  label: 'Aguardando protocolo',   color: '#F97316' },
  { id: 'protocolado',           label: 'Protocolado',            color: '#6EE7B7' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from)
  let count = 0
  while (count < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) count++
  }
  return d
}

function toDateInput(d: Date) {
  return d.toISOString().split('T')[0]
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function isPrazoPast(prazo: string | null): boolean {
  if (!prazo) return false
  return new Date(prazo + 'T23:59:59') < new Date()
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  field: {
    width: '100%', padding: '10px 12px',
    background: 'rgba(26,86,219,0.05)', border: '1px solid rgba(26,86,219,0.18)',
    borderRadius: '8px', color: '#F0F6FF', fontSize: '0.85rem',
    outline: 'none', fontFamily: 'inherit',
  } as React.CSSProperties,
  label: {
    display: 'block', fontSize: '0.68rem', color: '#4D6A8A',
    letterSpacing: '0.08em', textTransform: 'uppercase' as const,
    marginBottom: '4px', fontWeight: 600,
  },
  overlay: {
    position: 'fixed' as const, inset: 0, background: 'rgba(4,12,24,0.82)',
    backdropFilter: 'blur(4px)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
  },
  modal: {
    background: '#060F1F', border: '1px solid rgba(26,86,219,0.25)',
    borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px',
    maxHeight: '90vh', overflowY: 'auto' as const,
  },
  btn: (variant: 'primary' | 'secondary' | 'danger' | 'success') => ({
    padding: '10px 16px', border: 'none', borderRadius: '8px',
    fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
    background: variant === 'primary' ? 'linear-gradient(135deg,#1A56DB,#1E40AF)'
      : variant === 'success' ? 'linear-gradient(135deg,#059669,#047857)'
      : variant === 'danger' ? 'rgba(239,68,68,0.15)'
      : 'transparent',
    border: variant === 'secondary' ? '1px solid rgba(26,86,219,0.25)' as string
      : variant === 'danger' ? '1px solid rgba(239,68,68,0.35)' as string
      : 'none',
    color: variant === 'secondary' ? '#8BA8CC'
      : variant === 'danger' ? '#FCA5A5'
      : 'white',
  } as React.CSSProperties),
}

// ─── Task card content ────────────────────────────────────────────────────────

function TarefaCardContent({
  tarefa, isOverlay, onWAClick,
}: {
  tarefa: TarefaExecucao
  isOverlay?: boolean
  onWAClick?: () => void
}) {
  const tipoLabel = tarefa.processos_recurso ? TIPO_PROCESSO_LABELS[tarefa.processos_recurso.tipo] : ''
  const faseLabel = FASE_LABELS[tarefa.fase]
  const prazoAtrasado = isPrazoPast(tarefa.prazo)
  const waNum = (tarefa.clientes?.whatsapp ?? tarefa.clientes?.telefone ?? '').replace(/\D/g, '')

  return (
    <div style={{
      background: tarefa.urgente ? 'rgba(239,68,68,0.06)' : 'rgba(9,24,48,0.85)',
      border: tarefa.urgente ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(26,86,219,0.2)',
      borderRadius: '10px', padding: '14px', marginBottom: '8px',
      cursor: isOverlay ? 'grabbing' : 'grab', userSelect: 'none',
    }}>
      {/* Tags row */}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '7px' }}>
        {tarefa.urgente && (
          <span style={{ fontSize: '0.63rem', fontWeight: 700, background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', borderRadius: '6px', padding: '2px 7px' }}>
            ⚡ URGENTE
          </span>
        )}
        <span style={{ fontSize: '0.63rem', fontWeight: 700, background: 'rgba(26,86,219,0.12)', border: '1px solid rgba(26,86,219,0.25)', color: '#60A5FA', borderRadius: '6px', padding: '2px 7px' }}>
          {faseLabel}
        </span>
        {tipoLabel && (
          <span style={{ fontSize: '0.63rem', fontWeight: 700, background: 'rgba(196,146,42,0.1)', border: '1px solid rgba(196,146,42,0.25)', color: '#E8B84B', borderRadius: '6px', padding: '2px 7px' }}>
            {tipoLabel}
          </span>
        )}
      </div>

      {/* Name */}
      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F0F6FF', marginBottom: '3px' }}>
        {tarefa.clientes?.nome ?? '—'}
      </div>
      {tarefa.clientes?.ait && <div style={{ fontSize: '0.72rem', color: '#8BA8CC' }}>AIT: {tarefa.clientes.ait}</div>}
      {tarefa.clientes?.tipo_infracao && <div style={{ fontSize: '0.72rem', color: '#4D6A8A', marginTop: '1px' }}>{tarefa.clientes.tipo_infracao}</div>}

      {/* Responsavel */}
      <div style={{ fontSize: '0.7rem', color: '#60A5FA', marginTop: '6px' }}>👤 {tarefa.responsavel}</div>

      {/* Prazo */}
      {tarefa.prazo && (
        <div style={{ fontSize: '0.7rem', marginTop: '4px', color: prazoAtrasado ? '#FCA5A5' : '#FBBF24', fontWeight: prazoAtrasado ? 700 : 400 }}>
          ⏰ {prazoAtrasado ? 'Atrasado: ' : 'Prazo: '}{fmtDate(tarefa.prazo)}
        </div>
      )}

      {/* Envio agendado */}
      {tarefa.data_agendamento_envio && (
        <div style={{ fontSize: '0.7rem', color: '#A78BFA', marginTop: '4px' }}>
          📤 Envio: {fmtDateTime(tarefa.data_agendamento_envio)}
        </div>
      )}

      {/* Protocolo agendado */}
      {tarefa.data_agendamento_protocolo && tarefa.etapa === 'aguardando_protocolo' && (
        <div style={{ fontSize: '0.7rem', color: '#F97316', marginTop: '4px', fontWeight: 600 }}>
          📅 Cadastro: {fmtDate(tarefa.data_agendamento_protocolo)}
        </div>
      )}

      {/* WA button (aguardando_protocolo) */}
      {tarefa.etapa === 'aguardando_protocolo' && waNum && tarefa.data_agendamento_protocolo && onWAClick && (
        <div style={{ marginTop: '8px' }} onClick={(e) => { e.stopPropagation() }}>
          <a
            href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Olá ${tarefa.clientes?.nome}! Informamos que o cadastro do seu recurso está agendado para o dia ${fmtDate(tarefa.data_agendamento_protocolo)}. Por favor, esteja disponível nessa data. Qualquer dúvida, estamos à disposição! — Unity Multas`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '6px', color: '#34D399', fontSize: '0.68rem', fontWeight: 600, textDecoration: 'none' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.101 22l4.949-1.302A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.522 2 12 2z"/></svg>
            Avisar cadastro
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Draggable wrapper ────────────────────────────────────────────────────────

function DraggableTarefa({ tarefa, onClick }: { tarefa: TarefaExecucao; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: tarefa.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined, opacity: isDragging ? 0.4 : 1, touchAction: 'none' }}
      {...listeners}
      {...attributes}
      onClick={onClick}
    >
      <TarefaCardContent tarefa={tarefa} onWAClick={onClick} />
    </div>
  )
}

// ─── Droppable column ─────────────────────────────────────────────────────────

function DroppableExecColumn({
  col, tarefas, onCardClick,
}: {
  col: typeof EXEC_COLUMNS[number]
  tarefas: TarefaExecucao[]
  onCardClick: (t: TarefaExecucao) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  const sorted = [...tarefas].sort((a, b) => {
    if (col.id === 'a_redigir') {
      if (a.urgente !== b.urgente) return a.urgente ? -1 : 1
      if (a.prazo && b.prazo) return a.prazo.localeCompare(b.prazo)
      if (a.prazo) return -1
      if (b.prazo) return 1
      return 0
    }
    if (col.id === 'aguardando_protocolo') {
      if (a.data_agendamento_protocolo && b.data_agendamento_protocolo)
        return a.data_agendamento_protocolo.localeCompare(b.data_agendamento_protocolo)
      if (a.data_agendamento_protocolo) return -1
      if (b.data_agendamento_protocolo) return 1
      return 0
    }
    return 0
  })

  return (
    <div style={{ width: '260px', minWidth: '260px', flexShrink: 0 }}>
      <div style={{
        padding: '10px 12px', borderRadius: '10px 10px 0 0',
        background: `${col.color}14`, border: `1px solid ${col.color}30`, borderBottom: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: col.color }}>{col.label}</span>
        <span style={{ fontSize: '0.68rem', color: '#4D6A8A', fontWeight: 600 }}>{tarefas.length}</span>
      </div>
      <div
        ref={setNodeRef}
        style={{
          minHeight: '200px', padding: '10px 8px',
          background: isOver ? 'rgba(26,86,219,0.06)' : 'rgba(9,24,48,0.5)',
          border: `1px solid ${isOver ? col.color + '50' : 'rgba(26,86,219,0.12)'}`,
          borderRadius: '0 0 10px 10px', transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {sorted.map((t) => (
          <DraggableTarefa key={t.id} tarefa={t} onClick={() => onCardClick(t)} />
        ))}
        {tarefas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: '#2A3F5A', fontSize: '0.75rem' }}>Nenhuma tarefa</div>
        )}
      </div>
    </div>
  )
}

// ─── Detail / Edit modal (a_redigir click) ────────────────────────────────────

function TarefaDetailModal({
  tarefa, onClose, onSaved, isPending, startTransition,
}: {
  tarefa: TarefaExecucao
  onClose: () => void
  onSaved: (updated: Partial<TarefaExecucao>) => void
  isPending: boolean
  startTransition: (fn: () => Promise<void>) => void
}) {
  const [urgente, setUrgente] = useState(tarefa.urgente)
  const [responsavel, setResponsavel] = useState(tarefa.responsavel || 'Pablo')
  const [prazo, setPrazo] = useState(tarefa.prazo ?? '')
  const [envio, setEnvio] = useState(tarefa.data_agendamento_envio ? tarefa.data_agendamento_envio.slice(0, 16) : '')
  const [notas, setNotas] = useState(tarefa.notas ?? '')

  const isARediger = tarefa.etapa === 'a_redigir'

  function handleSave() {
    startTransition(async () => {
      await updateTarefaAction(tarefa.id, { urgente, responsavel, prazo: prazo || null, notas: notas || null })
      onSaved({ urgente, responsavel, prazo: prazo || null, notas: notas || null })
      onClose()
    })
  }

  function handleAgendarEnvio() {
    if (!envio) return
    startTransition(async () => {
      await agendarEnvioAction(tarefa.id, new Date(envio).toISOString())
      onSaved({ data_agendamento_envio: new Date(envio).toISOString(), etapa: 'envio_agendado' })
      onClose()
    })
  }

  function set3DiasUteis() {
    setPrazo(toDateInput(addBusinessDays(new Date(), 3)))
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.68rem', color: '#60A5FA', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            {FASE_LABELS[tarefa.fase]} · {tarefa.processos_recurso ? TIPO_PROCESSO_LABELS[tarefa.processos_recurso.tipo] : ''}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF' }}>{tarefa.clientes?.nome ?? '—'}</h3>
          {tarefa.clientes?.ait && <div style={{ fontSize: '0.78rem', color: '#8BA8CC', marginTop: '2px' }}>AIT: {tarefa.clientes.ait}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          {/* Urgente */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div
              onClick={() => setUrgente(!urgente)}
              style={{ width: '36px', height: '20px', borderRadius: '100px', background: urgente ? '#EF4444' : 'rgba(26,86,219,0.2)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', top: '3px', left: urgente ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: '0.83rem', color: urgente ? '#FCA5A5' : '#8BA8CC' }}>⚡ Recurso urgente (sobe para topo)</span>
          </label>

          {/* Responsavel */}
          <label>
            <span style={S.label}>Responsável</span>
            <input style={S.field} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </label>

          {/* Prazo */}
          <div>
            <span style={S.label}>Prazo de conclusão</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="date" style={{ ...S.field, flex: 1 }} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
              <button
                type="button"
                onClick={set3DiasUteis}
                style={{ padding: '0 12px', background: 'rgba(26,86,219,0.12)', border: '1px solid rgba(26,86,219,0.3)', borderRadius: '8px', color: '#60A5FA', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                3 dias úteis
              </button>
            </div>
          </div>

          {/* Notas */}
          <label>
            <span style={S.label}>Observações</span>
            <textarea style={{ ...S.field, minHeight: '64px', resize: 'vertical' }} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observações internas..." />
          </label>

          {/* Agendar envio (only in a_redigir) */}
          {isARediger && (
            <div style={{ borderTop: '1px solid rgba(26,86,219,0.12)', paddingTop: '13px' }}>
              <span style={S.label}>Data/hora de agendamento do envio por e-mail</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="datetime-local"
                  style={{ ...S.field, flex: 1 }}
                  value={envio}
                  onChange={(e) => setEnvio(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAgendarEnvio}
                  disabled={!envio || isPending}
                  style={{ padding: '0 14px', background: envio ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : 'rgba(26,86,219,0.1)', border: 'none', borderRadius: '8px', color: envio ? 'white' : '#4D6A8A', fontSize: '0.78rem', fontWeight: 700, cursor: envio ? 'pointer' : 'not-allowed', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                >
                  Agendar → Envio
                </button>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#4D6A8A', marginTop: '5px' }}>Ao confirmar, a tarefa move automaticamente para "Envio agendado".</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ ...S.btn('secondary'), flex: 1 }}>Cancelar</button>
          <button onClick={handleSave} disabled={isPending} style={{ ...S.btn('primary'), flex: 2 }}>
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Agendamento protocolo modal ──────────────────────────────────────────────

function AgendamentoProtocoloModal({
  tarefa, onClose, onConfirm, isPending,
}: {
  tarefa: TarefaExecucao
  onClose: () => void
  onConfirm: (data: string) => void
  isPending: boolean
}) {
  const [data, setData] = useState('')
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.68rem', color: '#F97316', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Aguardando protocolo</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF' }}>{tarefa.clientes?.nome}</h3>
        </div>
        <label>
          <span style={S.label}>Data de agendamento do cadastro *</span>
          <input type="date" style={S.field} value={data} onChange={(e) => setData(e.target.value)} min={new Date().toISOString().split('T')[0]} />
        </label>
        <p style={{ fontSize: '0.78rem', color: '#8BA8CC', margin: '12px 0' }}>
          O card ficará exibido nesta data. Você poderá enviar WhatsApp para avisar o cliente.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ ...S.btn('secondary'), flex: 1 }}>Cancelar</button>
          <button onClick={() => { if (data) onConfirm(data) }} disabled={!data || isPending} style={{ ...S.btn('primary'), flex: 2 }}>
            {isPending ? 'Salvando...' : 'Confirmar agendamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Protocolado modal ────────────────────────────────────────────────────────

function ProtocoladoModal({
  tarefa, onClose, onConfirm, isPending,
}: {
  tarefa: TarefaExecucao
  onClose: () => void
  onConfirm: (protocoladoPor: string, numero: string) => void
  isPending: boolean
}) {
  const [por, setPor] = useState<'equipe' | 'cliente'>('equipe')
  const [numero, setNumero] = useState('')
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.68rem', color: '#6EE7B7', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Protocolar recurso</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF' }}>{tarefa.clientes?.nome}</h3>
          <p style={{ fontSize: '0.78rem', color: '#8BA8CC', marginTop: '4px' }}>{FASE_LABELS[tarefa.fase]} · {tarefa.processos_recurso ? TIPO_PROCESSO_LABELS[tarefa.processos_recurso.tipo] : ''}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          <div>
            <span style={S.label}>Quem realizou o protocolo?</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['equipe', 'cliente'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setPor(v)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: 600,
                    background: por === v ? (v === 'equipe' ? 'rgba(96,165,250,0.15)' : 'rgba(52,211,153,0.12)') : 'rgba(9,24,48,0.6)',
                    border: `1px solid ${por === v ? (v === 'equipe' ? '#60A5FA' : '#34D399') : 'rgba(26,86,219,0.2)'}`,
                    color: por === v ? (v === 'equipe' ? '#60A5FA' : '#34D399') : '#8BA8CC',
                  }}
                >
                  {v === 'equipe' ? '👥 Nossa equipe' : '👤 Próprio cliente'}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span style={S.label}>Número do protocolo (opcional)</span>
            <input style={S.field} value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 2024/123456" />
          </label>
        </div>

        <p style={{ fontSize: '0.78rem', color: '#8BA8CC', margin: '12px 0' }}>
          A tarefa será arquivada e o processo passará para <strong style={{ color: '#FBBF24' }}>Aguardando resultado</strong>.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ ...S.btn('secondary'), flex: 1 }}>Cancelar</button>
          <button onClick={() => onConfirm(por, numero)} disabled={isPending} style={{ ...S.btn('success'), flex: 2 }}>
            {isPending ? 'Arquivando...' : '✓ Confirmar protocolo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create task modal ────────────────────────────────────────────────────────

type ClienteSimples = { id: string; nome: string; ait: string | null; tem_suspensao: boolean; pagamento_realizado_at: string | null }
type ProcessoSimples = { id: string; tipo: TipoProcesso; fase_atual: FaseRecurso; status: string }

function CreateTarefaModal({
  onClose, onCreated, isPending, startTransition,
}: {
  onClose: () => void
  onCreated: () => void
  isPending: boolean
  startTransition: (fn: () => Promise<void>) => void
}) {
  const [clientes, setClientes] = useState<ClienteSimples[]>([])
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [clienteId, setClienteId] = useState('')
  const [tipo, setTipo] = useState<TipoProcesso>('infracao')
  const [fase, setFase] = useState<FaseRecurso>('defesa_previa')
  const [responsavel, setResponsavel] = useState('Pablo')
  const [prazo, setPrazo] = useState(toDateInput(addBusinessDays(new Date(), 3)))
  const [urgente, setUrgente] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getClientesPagamentoAction().then((data) => {
      setClientes(data as ClienteSimples[])
      setLoadingClientes(false)
    }).catch(() => setLoadingClientes(false))
  }, [])

  function handleSubmit() {
    if (!clienteId) { setError('Selecione um cliente.'); return }
    setError(null)
    startTransition(async () => {
      const res = await createTarefaComProcessoAction({ clienteId, tipo, fase, responsavel, prazo: prazo || undefined, urgente })
      if (res.ok) onCreated()
      else setError('Erro ao criar tarefa.')
    })
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '18px', color: '#F0F6FF' }}>Nova tarefa manual</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          <label>
            <span style={S.label}>Cliente (com pagamento) *</span>
            {loadingClientes ? (
              <div style={{ color: '#4D6A8A', fontSize: '0.82rem', padding: '10px 0' }}>Carregando...</div>
            ) : (
              <select style={{ ...S.field, cursor: 'pointer' }} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="" style={{ background: '#040C18' }}>Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: '#040C18' }}>
                    {c.nome}{c.ait ? ` — AIT: ${c.ait}` : ''}
                  </option>
                ))}
              </select>
            )}
          </label>

          <div>
            <span style={S.label}>Instância</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['infracao', 'suspensao'] as TipoProcesso[]).map((v) => (
                <button key={v} onClick={() => setTipo(v)} style={{
                  flex: 1, padding: '9px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
                  background: tipo === v ? 'rgba(196,146,42,0.15)' : 'rgba(9,24,48,0.6)',
                  border: `1px solid ${tipo === v ? '#E8B84B' : 'rgba(26,86,219,0.2)'}`,
                  color: tipo === v ? '#E8B84B' : '#8BA8CC',
                }}>
                  {TIPO_PROCESSO_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          <label>
            <span style={S.label}>Fase</span>
            <select style={{ ...S.field, cursor: 'pointer' }} value={fase} onChange={(e) => setFase(e.target.value as FaseRecurso)}>
              {(Object.entries(FASE_LABELS) as [FaseRecurso, string][]).map(([k, v]) => (
                <option key={k} value={k} style={{ background: '#040C18' }}>{v}</option>
              ))}
            </select>
          </label>

          <label>
            <span style={S.label}>Responsável</span>
            <input style={S.field} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
          </label>

          <label>
            <span style={S.label}>Prazo</span>
            <input type="date" style={S.field} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div onClick={() => setUrgente(!urgente)} style={{ width: '36px', height: '20px', borderRadius: '100px', background: urgente ? '#EF4444' : 'rgba(26,86,219,0.2)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '3px', left: urgente ? '18px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: '0.83rem', color: urgente ? '#FCA5A5' : '#8BA8CC' }}>⚡ Urgente</span>
          </label>
        </div>

        {error && <div style={{ marginTop: '10px', padding: '9px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.8rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ ...S.btn('secondary'), flex: 1 }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={isPending} style={{ ...S.btn('primary'), flex: 2 }}>
            {isPending ? 'Criando...' : 'Criar tarefa'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main board ───────────────────────────────────────────────────────────────

type ModalState =
  | { type: 'detail'; tarefa: TarefaExecucao }
  | { type: 'protocolo'; tarefa: TarefaExecucao }
  | { type: 'protocolado'; tarefa: TarefaExecucao }
  | { type: 'create' }
  | null

export default function ExecucaoBoard({ initialTarefas }: { initialTarefas: TarefaExecucao[] }) {
  const [tarefas, setTarefas] = useState<TarefaExecucao[]>(initialTarefas)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [isPending, startTransition] = useTransition()
  const draggingRef = useRef(false)

  useEffect(() => {
    const id = setInterval(async () => {
      if (draggingRef.current) return
      try { setTarefas(await getTarefasAction()) } catch { /* ignored */ }
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  function handleDragStart(e: DragStartEvent) {
    draggingRef.current = true
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    draggingRef.current = false
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const tarefaId = String(active.id)
    const targetEtapa = String(over.id) as EtapaTarefa
    const tarefa = tarefas.find((t) => t.id === tarefaId)
    if (!tarefa || tarefa.etapa === targetEtapa) return

    if (targetEtapa === 'protocolado') { setModal({ type: 'protocolado', tarefa }); return }
    if (targetEtapa === 'aguardando_protocolo') { setModal({ type: 'protocolo', tarefa }); return }

    setTarefas((prev) => prev.map((t) => t.id === tarefaId ? { ...t, etapa: targetEtapa } : t))
    startTransition(async () => {
      const res = await moveTarefaAction(tarefaId, targetEtapa)
      if (!res.ok) setTarefas((prev) => prev.map((t) => t.id === tarefaId ? { ...t, etapa: tarefa.etapa } : t))
    })
  }

  function handleProtocoloConfirm(data: string) {
    if (modal?.type !== 'protocolo') return
    const { tarefa } = modal
    setTarefas((prev) => prev.map((t) => t.id === tarefa.id ? { ...t, etapa: 'aguardando_protocolo', data_agendamento_protocolo: data } : t))
    setModal(null)
    startTransition(async () => {
      const res = await agendarProtocoloAction(tarefa.id, data)
      if (!res.ok) setTarefas((prev) => prev.map((t) => t.id === tarefa.id ? { ...t, etapa: tarefa.etapa } : t))
    })
  }

  function handleProtocoladoConfirm(protocoladoPor: string, numero: string) {
    if (modal?.type !== 'protocolado') return
    const { tarefa } = modal
    setTarefas((prev) => prev.filter((t) => t.id !== tarefa.id))
    setModal(null)
    startTransition(async () => {
      const res = await arquivarTarefaAction(tarefa.id, tarefa.processo_id, numero || undefined, protocoladoPor)
      if (!res.ok) setTarefas((prev) => [tarefa, ...prev])
    })
  }

  const activeTarefa = activeId ? tarefas.find((t) => t.id === activeId) : null

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      <header style={{ background: 'rgba(4,12,24,0.95)', borderBottom: '1px solid rgba(26,86,219,0.15)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Image src="/logo.png" alt="Unity Multas" width={32} height={32} style={{ objectFit: 'contain', height: '32px', width: 'auto' }} priority />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unity Multas</span>
          </div>
          <AdminNav />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.74rem', color: '#4D6A8A' }}>{tarefas.length} tarefa{tarefas.length !== 1 ? 's' : ''} ativa{tarefas.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => setModal({ type: 'create' })}
            style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(26,86,219,0.4)' }}
          >
            + Nova tarefa
          </button>
        </div>
      </header>

      <div style={{ padding: '10px 24px', background: 'rgba(9,24,48,0.4)', borderBottom: '1px solid rgba(26,86,219,0.08)', fontSize: '0.73rem', color: '#4D6A8A' }}>
        Clique em um card para editar · Arraste para mover de coluna · <span style={{ color: '#FCA5A5' }}>⚡ Urgente</span> sobe para o topo de <strong style={{ color: '#60A5FA' }}>A redigir</strong>
      </div>

      <div style={{ overflowX: 'auto', padding: '24px' }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
            {EXEC_COLUMNS.map((col) => (
              <DroppableExecColumn
                key={col.id}
                col={col}
                tarefas={tarefas.filter((t) => t.etapa === col.id)}
                onCardClick={(t) => setModal({ type: 'detail', tarefa: t })}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTarefa && <TarefaCardContent tarefa={activeTarefa} isOverlay />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {modal?.type === 'detail' && (
        <TarefaDetailModal
          tarefa={modal.tarefa}
          onClose={() => setModal(null)}
          isPending={isPending}
          startTransition={startTransition as (fn: () => Promise<void>) => void}
          onSaved={(updated) => setTarefas((prev) => prev.map((t) => t.id === modal.tarefa.id ? { ...t, ...updated } : t))}
        />
      )}
      {modal?.type === 'protocolo' && (
        <AgendamentoProtocoloModal
          tarefa={modal.tarefa}
          onClose={() => { setModal(null); setTarefas((prev) => prev.map((t) => t.id === modal.tarefa.id ? { ...t, etapa: modal.tarefa.etapa } : t)) }}
          onConfirm={handleProtocoloConfirm}
          isPending={isPending}
        />
      )}
      {modal?.type === 'protocolado' && (
        <ProtocoladoModal
          tarefa={modal.tarefa}
          onClose={() => setModal(null)}
          onConfirm={handleProtocoladoConfirm}
          isPending={isPending}
        />
      )}
      {modal?.type === 'create' && (
        <CreateTarefaModal
          onClose={() => setModal(null)}
          isPending={isPending}
          startTransition={startTransition as (fn: () => Promise<void>) => void}
          onCreated={async () => {
            setModal(null)
            try { setTarefas(await getTarefasAction()) } catch { /* ignored */ }
          }}
        />
      )}
    </div>
  )
}
