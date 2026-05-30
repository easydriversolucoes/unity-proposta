'use client'
import { useState, useTransition, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import Image from 'next/image'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Cliente, EtapaCRM, Atividade } from '@/types/crm'
import { CRM_COLUMNS, ETAPA_LABELS } from '@/types/crm'
import {
  moveClienteAction,
  createClienteAction,
  addAtividadeAction,
  getAtividadesAction,
  updateClienteAction,
  scheduleFollowUpAction,
} from '@/app/crm/actions'

// ─── Style helpers ────────────────────────────────────────────────────────────

const S = {
  field: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(26,86,219,0.05)',
    border: '1px solid rgba(26,86,219,0.18)',
    borderRadius: '8px',
    color: '#F0F6FF',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.68rem',
    color: '#4D6A8A',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(4,12,24,0.8)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    background: '#060F1F',
    border: '1px solid rgba(26,86,219,0.25)',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ─── Urgency border ───────────────────────────────────────────────────────────

function urgencyStyle(followupData: string | null, etapa: EtapaCRM): React.CSSProperties {
  if (etapa !== 'aguardando_resposta' || !followupData) return {}
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(followupData + 'T12:00:00'); due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return { borderColor: '#EF4444', boxShadow: '0 0 0 1px #EF444440' }
  if (diff === 0) return { borderColor: '#F97316', boxShadow: '0 0 0 1px #F9731640' }
  if (diff === 1) return { borderColor: '#EAB308', boxShadow: '0 0 0 1px #EAB30840' }
  return {}
}

function overdueLabel(followupData: string | null, etapa: EtapaCRM): string | null {
  if (etapa !== 'aguardando_resposta' || !followupData) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(followupData + 'T12:00:00'); due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? 's' : ''} atrasado`
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return null
}

// ─── Draggable card ───────────────────────────────────────────────────────────

function DraggableCard({ cliente, onClick }: { cliente: Cliente; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: cliente.id })
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
    touchAction: 'none',
  }
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <CardContent cliente={cliente} onClick={onClick} />
    </div>
  )
}

function CardContent({ cliente, onClick, isOverlay }: { cliente: Cliente; onClick?: () => void; isOverlay?: boolean }) {
  const urgency = urgencyStyle(cliente.followup_data, cliente.etapa)
  const label = overdueLabel(cliente.followup_data, cliente.etapa)
  const tentativa = cliente.etapa === 'aguardando_resposta' && cliente.followup_contagem > 0
    ? `${cliente.followup_contagem}ª tentativa`
    : null

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(9,24,48,0.85)',
        border: `1px solid rgba(26,86,219,0.2)`,
        ...urgency,
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '8px',
        cursor: isOverlay ? 'grabbing' : 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F0F6FF', lineHeight: 1.3 }}>{cliente.nome}</div>
        {tentativa && (
          <span style={{ fontSize: '0.65rem', background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', color: '#FDE68A', borderRadius: '100px', padding: '2px 7px', whiteSpace: 'nowrap', fontWeight: 600 }}>
            {tentativa}
          </span>
        )}
      </div>
      {cliente.ait && <div style={{ fontSize: '0.73rem', color: '#8BA8CC', marginTop: '4px' }}>AIT: {cliente.ait}</div>}
      {cliente.tipo_infracao && <div style={{ fontSize: '0.73rem', color: '#4D6A8A', marginTop: '2px' }}>{cliente.tipo_infracao}</div>}
      {cliente.telefone && <div style={{ fontSize: '0.73rem', color: '#4D6A8A', marginTop: '2px' }}>{cliente.telefone}</div>}
      {label && (
        <div style={{
          marginTop: '8px', fontSize: '0.7rem', fontWeight: 700,
          color: label === 'Hoje' ? '#FB923C' : label === 'Amanhã' ? '#FDE68A' : '#FCA5A5',
        }}>
          ⏰ {label}
        </div>
      )}
    </div>
  )
}

// ─── Droppable column ─────────────────────────────────────────────────────────

function DroppableColumn({
  col,
  clientes,
  onCardClick,
}: {
  col: typeof CRM_COLUMNS[number]
  clientes: Cliente[]
  onCardClick: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div
      style={{
        width: '260px',
        minWidth: '260px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Column header */}
      <div style={{
        padding: '10px 12px',
        borderRadius: '10px 10px 0 0',
        background: `${col.color}14`,
        border: `1px solid ${col.color}30`,
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: col.color, letterSpacing: '0.04em' }}>
          {col.label}
        </span>
        <span style={{ fontSize: '0.68rem', color: '#4D6A8A', fontWeight: 600 }}>{clientes.length}</span>
      </div>

      {/* Drop area */}
      <div
        ref={setNodeRef}
        style={{
          flex: 1,
          minHeight: '200px',
          padding: '10px 8px',
          background: isOver ? 'rgba(26,86,219,0.06)' : 'rgba(9,24,48,0.5)',
          border: `1px solid ${isOver ? col.color + '50' : 'rgba(26,86,219,0.12)'}`,
          borderRadius: '0 0 10px 10px',
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {clientes.map((c) => (
          <DraggableCard key={c.id} cliente={c} onClick={() => onCardClick(c.id)} />
        ))}
        {clientes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: '#2A3F5A', fontSize: '0.75rem' }}>
            Nenhum cliente
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Follow-up Modal ──────────────────────────────────────────────────────────

function FollowUpModal({
  clienteNome,
  onClose,
  onSubmit,
  isPending,
}: {
  clienteNome: string
  onClose: () => void
  onSubmit: (data: { followup_data: string; followup_canal: string; nota: string }) => void
  isPending: boolean
}) {
  const [date, setDate] = useState('')
  const [canal, setCanal] = useState('WhatsApp')
  const [nota, setNota] = useState('')

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.7rem', color: '#FBBF24', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Follow-up Obrigatório
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF' }}>Aguardando Resposta</h3>
          <p style={{ fontSize: '0.8rem', color: '#8BA8CC', marginTop: '4px' }}>{clienteNome}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            <span style={S.label}>Data do follow-up *</span>
            <input type="date" required style={S.field} value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </label>

          <label>
            <span style={S.label}>Canal *</span>
            <select style={{ ...S.field, cursor: 'pointer' }} value={canal} onChange={(e) => setCanal(e.target.value)}>
              {['WhatsApp', 'Telefone', 'E-mail'].map((c) => (
                <option key={c} value={c} style={{ background: '#040C18' }}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            <span style={S.label}>Nota (opcional)</span>
            <textarea
              style={{ ...S.field, minHeight: '72px', resize: 'vertical' }}
              placeholder="Ex: Cliente disse que vai pensar até quinta-feira..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '8px', color: '#8BA8CC', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button
            onClick={() => { if (date) onSubmit({ followup_data: date, followup_canal: canal, nota }) }}
            disabled={!date || isPending}
            style={{ flex: 2, padding: '11px', background: !date ? 'rgba(26,86,219,0.3)' : 'linear-gradient(135deg,#1A56DB,#1E40AF)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: !date ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {isPending ? 'Salvando...' : 'Confirmar follow-up'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Cliente Modal ─────────────────────────────────────────────────────

function capWords(s: string) {
  return s.replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

function CreateClienteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Cliente) => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nome: '', whatsapp: '', placa: '',
    ait: '', tipo_infracao: '', orgao: '', origem: '', tem_suspensao: false,
  })
  const f = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await createClienteAction({
        nome: form.nome.trim(),
        whatsapp: form.whatsapp || undefined,
        placa: form.placa || undefined,
        ait: form.ait || undefined,
        tipo_infracao: form.tipo_infracao || undefined,
        orgao: form.orgao || undefined,
        origem: form.origem || undefined,
        tem_suspensao: form.tem_suspensao,
      })
      if (res.ok) onCreated(res.cliente)
      else setError(res.error)
    })
  }

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', color: '#F0F6FF' }}>Novo Cliente</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ gridColumn: '1/-1' }}>
              <span style={S.label}>Nome *</span>
              <input style={S.field} required value={form.nome} onChange={(e) => f('nome', capWords(e.target.value))} placeholder="Nome completo" />
            </label>
            <label>
              <span style={S.label}>WhatsApp</span>
              <input style={S.field} value={form.whatsapp} onChange={(e) => f('whatsapp', e.target.value)} placeholder="(11) 99999-9999" />
            </label>
            <label>
              <span style={S.label}>Placa</span>
              <input style={S.field} value={form.placa} onChange={(e) => f('placa', e.target.value.toUpperCase())} placeholder="ABC1D23" />
            </label>
            <label>
              <span style={S.label}>AIT</span>
              <input style={S.field} value={form.ait} onChange={(e) => f('ait', e.target.value.toUpperCase())} placeholder="Ex: 4F8K29XX" />
            </label>
            <label>
              <span style={S.label}>Tipo de infração</span>
              <select style={{ ...S.field, cursor: 'pointer' }} value={form.tipo_infracao} onChange={(e) => f('tipo_infracao', e.target.value)}>
                <option value="" style={{ background: '#040C18' }}>Selecione...</option>
                {['Lei Seca — Recusa ao Teste', 'Lei Seca — Etilômetro', 'Outro'].map((t) => (
                  <option key={t} value={t} style={{ background: '#040C18' }}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={S.label}>Órgão autuador</span>
              <input style={S.field} value={form.orgao} onChange={(e) => f('orgao', e.target.value.toUpperCase())} placeholder="DETRAN, PRF, PMSP..." />
            </label>
            <label>
              <span style={S.label}>Origem</span>
              <input style={S.field} value={form.origem} onChange={(e) => f('origem', e.target.value)} placeholder="Instagram, indicação..." />
            </label>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', cursor: 'pointer' }}>
            <div
              style={{
                width: '36px', height: '20px', borderRadius: '100px',
                background: form.tem_suspensao ? '#C4922A' : 'rgba(26,86,219,0.2)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
              onClick={() => f('tem_suspensao', !form.tem_suspensao)}
            >
              <div style={{
                position: 'absolute', top: '3px',
                left: form.tem_suspensao ? '18px' : '3px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
              }} />
            </div>
            <span style={{ fontSize: '0.83rem', color: form.tem_suspensao ? '#E8B84B' : '#8BA8CC' }}>
              Tem suspensão da CNH (gera recurso paralelo)
            </span>
          </label>

          {error && (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: '#FCA5A5' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '8px', color: '#8BA8CC', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isPending} style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: isPending ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
              {isPending ? 'Criando...' : 'Criar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Cliente Modal (details + activity) ──────────────────────────────────────

function ClienteModal({ clienteId, clientes, onClose, onUpdate, onScheduleFollowUp }: {
  clienteId: string
  clientes: Cliente[]
  onClose: () => void
  onUpdate: (updated: Partial<Cliente> & { id: string }) => void
  onScheduleFollowUp: (clienteId: string) => void
}) {
  const cliente = clientes.find((c) => c.id === clienteId)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [loadingAts, setLoadingAts] = useState(true)
  const [notaTexto, setNotaTexto] = useState('')
  const [isPending, startTransition] = useTransition()
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Cliente>>(cliente ?? {})

  const loadAtividades = useCallback(async () => {
    setLoadingAts(true)
    const data = await getAtividadesAction(clienteId)
    setAtividades(data)
    setLoadingAts(false)
  }, [clienteId])

  useEffect(() => { loadAtividades() }, [loadAtividades])

  if (!cliente) return null

  function addNota() {
    if (!notaTexto.trim()) return
    startTransition(async () => {
      await addAtividadeAction(clienteId, notaTexto.trim())
      setNotaTexto('')
      await loadAtividades()
    })
  }

  function saveEdit() {
    startTransition(async () => {
      await updateClienteAction(clienteId, editForm)
      onUpdate({ id: clienteId, ...editForm })
      setEditMode(false)
    })
  }

  const tipoIcone: Record<string, string> = {
    follow_up: '📞', nota: '📝', proposta: '📄', contato: '💬', resultado: '⚖️',
  }

  const adminUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#60A5FA', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              {ETAPA_LABELS[cliente.etapa]}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F0F6FF' }}>{cliente.nome}</h3>
            {cliente.ait && <div style={{ fontSize: '0.78rem', color: '#8BA8CC', marginTop: '2px' }}>AIT: {cliente.ait} · {cliente.tipo_infracao}</div>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{ padding: '7px 12px', background: 'rgba(26,86,219,0.1)', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '7px', color: '#60A5FA', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {editMode ? 'Cancelar' : 'Editar'}
            </button>
            <button onClick={onClose} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '7px', color: '#4D6A8A', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              ✕
            </button>
          </div>
        </div>

        {editMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {([['nome', 'Nome'], ['telefone', 'Telefone'], ['whatsapp', 'WhatsApp'], ['cpf', 'CPF'], ['placa', 'Placa'], ['ait', 'AIT'], ['tipo_infracao', 'Tipo de infração'], ['origem', 'Origem']] as [keyof Cliente, string][]).map(([k, lbl]) => (
              <label key={k}>
                <span style={S.label}>{lbl}</span>
                <input
                  style={S.field}
                  value={String(editForm[k] ?? '')}
                  onChange={(e) => setEditForm((p) => ({ ...p, [k]: e.target.value }))}
                />
              </label>
            ))}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
              <button onClick={saveEdit} disabled={isPending} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {isPending ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: '16px', fontSize: '0.8rem' }}>
            {cliente.telefone && <div><span style={{ color: '#4D6A8A' }}>Tel: </span><span style={{ color: '#F0F6FF' }}>{cliente.telefone}</span></div>}
            {cliente.whatsapp && <div><span style={{ color: '#4D6A8A' }}>WhatsApp: </span><span style={{ color: '#F0F6FF' }}>{cliente.whatsapp}</span></div>}
            {cliente.cpf && <div><span style={{ color: '#4D6A8A' }}>CPF: </span><span style={{ color: '#F0F6FF' }}>{cliente.cpf}</span></div>}
            {cliente.placa && <div><span style={{ color: '#4D6A8A' }}>Placa: </span><span style={{ color: '#F0F6FF' }}>{cliente.placa}</span></div>}
            {cliente.orgao && <div><span style={{ color: '#4D6A8A' }}>Órgão: </span><span style={{ color: '#F0F6FF' }}>{cliente.orgao}</span></div>}
            {cliente.followup_data && (
              <div style={{ gridColumn: '1/-1' }}>
                <span style={{ color: '#4D6A8A' }}>Próximo follow-up: </span>
                <span style={{ color: '#FBBF24' }}>
                  {new Date(cliente.followup_data + 'T12:00:00').toLocaleDateString('pt-BR')} via {cliente.followup_canal}
                </span>
              </div>
            )}
            {cliente.tem_suspensao && (
              <div style={{ gridColumn: '1/-1' }}>
                <span style={{ background: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.35)', color: '#E8B84B', borderRadius: '100px', padding: '2px 10px', fontSize: '0.68rem', fontWeight: 600 }}>
                  Tem suspensão da CNH
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <a
            href={`/admin?nome=${encodeURIComponent(cliente.nome)}&ait=${encodeURIComponent(cliente.ait ?? '')}&cliente_id=${cliente.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            style={{
              flex: 1, display: 'block', textAlign: 'center', padding: '10px',
              background: 'rgba(196,146,42,0.1)', border: '1px solid rgba(196,146,42,0.3)',
              borderRadius: '8px', color: '#E8B84B', fontSize: '0.8rem', fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            📄 Gerar proposta
          </a>
          <button
            onClick={() => { onScheduleFollowUp(cliente.id); onClose() }}
            style={{ flex: 1, padding: '10px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', color: '#FBBF24', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ⏰ Agendar follow-up
          </button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(26,86,219,0.12)', margin: '0 0 16px' }} />

        {/* Activity feed */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.68rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
            Histórico de atividades
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              style={{ ...S.field, flex: 1 }}
              placeholder="Adicionar nota..."
              value={notaTexto}
              onChange={(e) => setNotaTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addNota() }}
            />
            <button
              onClick={addNota}
              disabled={isPending || !notaTexto.trim()}
              style={{ padding: '10px 14px', background: 'rgba(26,86,219,0.1)', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '8px', color: '#60A5FA', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            >
              + Nota
            </button>
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {loadingAts && <div style={{ color: '#4D6A8A', fontSize: '0.8rem', textAlign: 'center', padding: '12px' }}>Carregando...</div>}
            {!loadingAts && atividades.length === 0 && (
              <div style={{ color: '#4D6A8A', fontSize: '0.8rem', textAlign: 'center', padding: '12px' }}>Nenhuma atividade registrada.</div>
            )}
            {atividades.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px', background: 'rgba(9,24,48,0.6)', borderRadius: '8px', border: '1px solid rgba(26,86,219,0.1)' }}>
                <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{tipoIcone[a.tipo] ?? '📝'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: '#D1E0F0', lineHeight: 1.4 }}>{a.texto}</div>
                  <div style={{ fontSize: '0.68rem', color: '#4D6A8A', marginTop: '3px' }}>{fmtDate(a.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Board ───────────────────────────────────────────────────────────────

export default function CRMBoard({ initialClientes }: { initialClientes: Cliente[] }) {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingDrop, setPendingDrop] = useState<{ clienteId: string } | null>(null)
  const [openClienteId, setOpenClienteId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [followUpStandaloneId, setFollowUpStandaloneId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Sync local state when server data refreshes
  useEffect(() => { setClientes(initialClientes) }, [initialClientes])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const clienteId = String(active.id)
    const targetEtapa = String(over.id) as EtapaCRM
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente || cliente.etapa === targetEtapa) return

    if (targetEtapa === 'aguardando_resposta') {
      setPendingDrop({ clienteId })
      return
    }

    // Optimistic update
    setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, etapa: targetEtapa } : c))
    startTransition(async () => {
      const res = await moveClienteAction(clienteId, targetEtapa)
      if (!res.ok) {
        setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, etapa: cliente.etapa } : c))
      } else {
        router.refresh()
      }
    })
  }

  function handleFollowUpSubmit(data: { followup_data: string; followup_canal: string; nota: string }) {
    if (!pendingDrop) return
    const { clienteId } = pendingDrop
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) return

    const newContagem = cliente.followup_contagem + 1
    setClientes((prev) => prev.map((c) =>
      c.id === clienteId
        ? { ...c, etapa: 'aguardando_resposta', followup_data: data.followup_data, followup_canal: data.followup_canal, followup_contagem: newContagem }
        : c,
    ))
    setPendingDrop(null)

    startTransition(async () => {
      const res = await moveClienteAction(clienteId, 'aguardando_resposta', data)
      if (!res.ok) {
        setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, etapa: cliente.etapa } : c))
      } else {
        router.refresh()
      }
    })
  }

  function handleStandaloneFollowUpSubmit(data: { followup_data: string; followup_canal: string; nota: string }) {
    if (!followUpStandaloneId) return
    const clienteId = followUpStandaloneId
    setFollowUpStandaloneId(null)
    setClientes((prev) => prev.map((c) =>
      c.id === clienteId
        ? { ...c, followup_data: data.followup_data, followup_canal: data.followup_canal, followup_contagem: c.followup_contagem + 1 }
        : c,
    ))
    startTransition(async () => {
      await scheduleFollowUpAction(clienteId, data)
      router.refresh()
    })
  }

  const activeCliente = activeId ? clientes.find((c) => c.id === activeId) : null
  const pendingCliente = pendingDrop ? clientes.find((c) => c.id === pendingDrop.clienteId) : null

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      {/* Header */}
      <header style={{ background: 'rgba(4,12,24,0.95)', borderBottom: '1px solid rgba(26,86,219,0.15)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <Image src="/logo.png" alt="Unity Multas" width={32} height={32} style={{ objectFit: 'contain', height: '32px', width: 'auto' }} priority />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unity Multas</span>
          </div>
          <AdminNav />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(26,86,219,0.4)', flexShrink: 0 }}
        >
          + Novo cliente
        </button>
      </header>

      {/* Kanban board */}
      <div style={{ overflowX: 'auto', padding: '24px' }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
            {CRM_COLUMNS.map((col) => (
              <DroppableColumn
                key={col.id}
                col={col}
                clientes={clientes.filter((c) => c.etapa === col.id)}
                onCardClick={(id) => setOpenClienteId(id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeCliente && <CardContent cliente={activeCliente} isOverlay />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {pendingDrop && pendingCliente && (
        <FollowUpModal
          clienteNome={pendingCliente.nome}
          onClose={() => setPendingDrop(null)}
          onSubmit={handleFollowUpSubmit}
          isPending={isPending}
        />
      )}

      {followUpStandaloneId && (() => {
        const c = clientes.find((x) => x.id === followUpStandaloneId)
        return c ? (
          <FollowUpModal
            clienteNome={c.nome}
            onClose={() => setFollowUpStandaloneId(null)}
            onSubmit={handleStandaloneFollowUpSubmit}
            isPending={isPending}
          />
        ) : null
      })()}

      {openClienteId && (
        <ClienteModal
          clienteId={openClienteId}
          clientes={clientes}
          onClose={() => setOpenClienteId(null)}
          onUpdate={(updated) => {
            setClientes((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c))
            router.refresh()
          }}
          onScheduleFollowUp={(id) => setFollowUpStandaloneId(id)}
        />
      )}

      {showCreate && (
        <CreateClienteModal
          onClose={() => setShowCreate(false)}
          onCreated={(c) => {
            setClientes((prev) => [c, ...prev])
            setShowCreate(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
