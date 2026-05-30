'use client'
import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import Image from 'next/image'
import type { Cliente } from '@/types/crm'
import { ETAPA_LABELS } from '@/types/crm'
import { registrarContatoAction, reagendarFollowUpAction } from '@/app/crm/actions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today0(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

function parseFU(dateStr: string): Date {
  const d = new Date(dateStr + 'T12:00:00'); d.setHours(0, 0, 0, 0); return d
}

function diffDays(dateStr: string): number {
  return Math.round((parseFU(dateStr).getTime() - today0().getTime()) / 86400000)
}

function fmtDate(dateStr: string) {
  return parseFU(dateStr).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function urgencyInfo(diff: number): { label: string; border: string; bg: string; text: string } {
  if (diff < 0) return {
    label: `${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? 's' : ''} atrasado`,
    border: '#EF4444', bg: 'rgba(239,68,68,0.05)', text: '#FCA5A5',
  }
  if (diff === 0) return { label: 'Hoje', border: '#F97316', bg: 'rgba(249,115,22,0.05)', text: '#FDBA74' }
  if (diff === 1) return { label: 'Amanhã', border: '#EAB308', bg: 'rgba(234,179,8,0.05)', text: '#FDE68A' }
  return { label: `em ${diff} dias`, border: 'rgba(26,86,219,0.25)', bg: 'rgba(9,24,48,0.7)', text: '#8BA8CC' }
}

// ─── Field styles ──────────────────────────────────────────────────────────────

const FIELD: React.CSSProperties = {
  width: '100%', padding: '11px 13px',
  background: 'rgba(26,86,219,0.05)', border: '1px solid rgba(26,86,219,0.2)',
  borderRadius: '9px', color: '#F0F6FF', fontSize: '0.88rem',
  outline: 'none', fontFamily: 'inherit',
}
const LBL: React.CSSProperties = {
  display: 'block', fontSize: '0.67rem', color: '#4D6A8A',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600,
}
const OVERLAY: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(4,12,24,0.8)',
  backdropFilter: 'blur(4px)', zIndex: 200,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
}
const MODAL: React.CSSProperties = {
  background: '#060F1F', border: '1px solid rgba(26,86,219,0.25)',
  borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '460px',
}

// ─── Registrar contato modal ───────────────────────────────────────────────────

function RegistrarModal({ cliente, onClose, onDone }: {
  cliente: Cliente
  onClose: () => void
  onDone: (clienteId: string, novaData?: string) => void
}) {
  const [nota, setNota] = useState('')
  const [reagendar, setReagendar] = useState(false)
  const [novaData, setNovaData] = useState('')
  const [novoCanal, setNovoCanal] = useState(cliente.followup_canal ?? 'WhatsApp')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (reagendar && !novaData) { setError('Informe a data do próximo follow-up.'); return }
    startTransition(async () => {
      const res = await registrarContatoAction(
        cliente.id,
        nota,
        reagendar ? { followup_data: novaData, followup_canal: novoCanal } : undefined,
      )
      if (res.ok) onDone(cliente.id, reagendar ? novaData : undefined)
      else setError(res.error)
    })
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={MODAL} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.68rem', color: '#34D399', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Registrar contato
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F0F6FF' }}>{cliente.nome}</h3>
          {cliente.followup_canal && (
            <p style={{ fontSize: '0.78rem', color: '#8BA8CC', marginTop: '3px' }}>
              via {cliente.followup_canal} · {cliente.followup_contagem}ª tentativa
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label>
            <span style={LBL}>Nota do contato (opcional)</span>
            <textarea
              style={{ ...FIELD, minHeight: '80px', resize: 'vertical' }}
              placeholder="Ex: Falei com o cliente, vai dar resposta amanhã..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </label>

          {/* Reagendar toggle */}
          <button
            type="button"
            onClick={() => setReagendar(!reagendar)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: reagendar ? 'rgba(251,191,36,0.08)' : 'rgba(26,86,219,0.04)',
              border: `1px solid ${reagendar ? 'rgba(251,191,36,0.35)' : 'rgba(26,86,219,0.15)'}`,
              borderRadius: '9px', padding: '12px 14px', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            <div style={{ width: '34px', height: '19px', borderRadius: '100px', background: reagendar ? '#C4922A' : 'rgba(26,86,219,0.2)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '2.5px', left: reagendar ? '17px' : '2.5px', width: '14px', height: '14px', borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
            </div>
            <span style={{ fontSize: '0.83rem', color: reagendar ? '#E8B84B' : '#8BA8CC', fontWeight: reagendar ? 600 : 400 }}>
              Agendar novo follow-up
            </span>
          </button>

          {reagendar && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                <span style={LBL}>Data *</span>
                <input type="date" style={FIELD} value={novaData} onChange={(e) => setNovaData(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
              </label>
              <label>
                <span style={LBL}>Canal *</span>
                <select style={{ ...FIELD, cursor: 'pointer' }} value={novoCanal} onChange={(e) => setNovoCanal(e.target.value)}>
                  {['WhatsApp', 'Telefone', 'E-mail'].map((c) => (
                    <option key={c} value={c} style={{ background: '#040C18' }}>{c}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {error && <p style={{ fontSize: '0.78rem', color: '#FCA5A5' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '9px', color: '#8BA8CC', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#059669,#047857)', border: 'none', borderRadius: '9px', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: isPending ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: isPending ? 0.7 : 1 }}
            >
              {isPending ? 'Registrando...' : '✓ Registrar contato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Reagendar modal ───────────────────────────────────────────────────────────

function ReagendarModal({ cliente, onClose, onDone }: {
  cliente: Cliente
  onClose: () => void
  onDone: (clienteId: string, novaData: string) => void
}) {
  const [data, setData] = useState(cliente.followup_data ?? '')
  const [canal, setCanal] = useState(cliente.followup_canal ?? 'WhatsApp')
  const [nota, setNota] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data) return
    startTransition(async () => {
      const res = await reagendarFollowUpAction(cliente.id, data, canal, nota)
      if (res.ok) onDone(cliente.id, data)
      else setError(res.error)
    })
  }

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={MODAL} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.68rem', color: '#FBBF24', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Reagendar follow-up
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F0F6FF' }}>{cliente.nome}</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              <span style={LBL}>Nova data *</span>
              <input type="date" style={FIELD} required value={data} onChange={(e) => setData(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </label>
            <label>
              <span style={LBL}>Canal *</span>
              <select style={{ ...FIELD, cursor: 'pointer' }} value={canal} onChange={(e) => setCanal(e.target.value)}>
                {['WhatsApp', 'Telefone', 'E-mail'].map((c) => (
                  <option key={c} value={c} style={{ background: '#040C18' }}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span style={LBL}>Nota (opcional)</span>
            <input style={FIELD} placeholder="Ex: Ligou ocupado, tentar novamente..." value={nota} onChange={(e) => setNota(e.target.value)} />
          </label>

          {error && <p style={{ fontSize: '0.78rem', color: '#FCA5A5' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '9px', color: '#8BA8CC', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !data}
              style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', border: 'none', borderRadius: '9px', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: (!data || isPending) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (!data || isPending) ? 0.5 : 1 }}
            >
              {isPending ? 'Salvando...' : '📅 Confirmar reagendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Follow-up card ────────────────────────────────────────────────────────────

function FollowUpCard({ cliente, onRegistrar, onReagendar }: {
  cliente: Cliente
  onRegistrar: () => void
  onReagendar: () => void
}) {
  const diff = diffDays(cliente.followup_data!)
  const { label, border, bg, text } = urgencyInfo(diff)

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: '12px',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F0F6FF' }}>{cliente.nome}</div>
          <div style={{ fontSize: '0.74rem', color: '#8BA8CC', marginTop: '3px' }}>
            {cliente.ait ? `AIT: ${cliente.ait}` : ''}
            {cliente.ait && cliente.tipo_infracao ? ' · ' : ''}
            {cliente.tipo_infracao ?? ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Urgency badge */}
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: text,
            background: `${border}18`, border: `1px solid ${border}40`,
            borderRadius: '100px', padding: '3px 10px', whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
          {/* Attempt badge */}
          {cliente.followup_contagem > 0 && (
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8BA8CC', background: 'rgba(26,86,219,0.08)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '100px', padding: '3px 9px', whiteSpace: 'nowrap' }}>
              {cliente.followup_contagem}ª tent.
            </span>
          )}
        </div>
      </div>

      {/* Middle row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.78rem', color: '#8BA8CC' }}>
        <span>
          📅 {fmtDate(cliente.followup_data!)}
        </span>
        {cliente.followup_canal && (
          <span>
            {cliente.followup_canal === 'WhatsApp' ? '💬' : cliente.followup_canal === 'Telefone' ? '📞' : '📧'}
            {' '}{cliente.followup_canal}
          </span>
        )}
        <span style={{ color: '#4D6A8A' }}>
          Etapa: {ETAPA_LABELS[cliente.etapa]}
        </span>
        {cliente.whatsapp && (
          <a
            href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#34D399', textDecoration: 'none', fontWeight: 600 }}
          >
            Abrir WhatsApp ↗
          </a>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
        <button
          onClick={onRegistrar}
          style={{ flex: 1, padding: '9px 12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', color: '#34D399', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ✓ Registrar contato
        </button>
        <button
          onClick={onReagendar}
          style={{ flex: 1, padding: '9px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '8px', color: '#FBBF24', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          📅 Reagendar
        </button>
        <a
          href={`/crm`}
          style={{ padding: '9px 12px', background: 'rgba(26,86,219,0.08)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '8px', color: '#60A5FA', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          Ver no CRM
        </a>
      </div>
    </div>
  )
}

// ─── Filters ───────────────────────────────────────────────────────────────────

type Filter = 'todos' | 'vencidos' | 'hoje' | 'semana' | 'proximos'

function filterClientes(clientes: Cliente[], f: Filter): Cliente[] {
  return clientes.filter((c) => {
    if (!c.followup_data) return false
    const diff = diffDays(c.followup_data)
    switch (f) {
      case 'vencidos': return diff < 0
      case 'hoje': return diff === 0
      case 'semana': return diff >= 0 && diff <= 7
      case 'proximos': return diff > 7
      default: return true
    }
  })
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function FollowUpsPage({
  initialClientes,
  notifCount,
}: {
  initialClientes: Cliente[]
  notifCount?: number
}) {
  const router = useRouter()
  const [clientes, setClientes] = useState(initialClientes)
  const [filter, setFilter] = useState<Filter>('todos')
  const [modal, setModal] = useState<{ type: 'registrar' | 'reagendar'; clienteId: string } | null>(null)

  const filtered = useMemo(() => filterClientes(clientes, filter), [clientes, filter])

  const counts = useMemo(() => ({
    todos: filterClientes(clientes, 'todos').length,
    vencidos: filterClientes(clientes, 'vencidos').length,
    hoje: filterClientes(clientes, 'hoje').length,
    semana: filterClientes(clientes, 'semana').length,
    proximos: filterClientes(clientes, 'proximos').length,
  }), [clientes])

  const activeCliente = modal ? clientes.find((c) => c.id === modal.clienteId) : null

  function handleRegistrarDone(clienteId: string, novaData?: string) {
    if (novaData) {
      setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, followup_data: novaData } : c))
    } else {
      setClientes((prev) => prev.filter((c) => c.id !== clienteId))
    }
    setModal(null)
    router.refresh()
  }

  function handleReagendarDone(clienteId: string, novaData: string) {
    setClientes((prev) => prev.map((c) => c.id === clienteId ? { ...c, followup_data: novaData } : c))
    setModal(null)
    router.refresh()
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'vencidos', label: 'Vencidos' },
    { key: 'hoje', label: 'Hoje' },
    { key: 'semana', label: 'Esta semana' },
    { key: 'proximos', label: 'Próximos' },
  ]

  const FILTER_COLORS: Record<Filter, string> = {
    todos: '#60A5FA',
    vencidos: '#EF4444',
    hoje: '#F97316',
    semana: '#FBBF24',
    proximos: '#A78BFA',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      {/* Header */}
      <header style={{ background: 'rgba(4,12,24,0.95)', borderBottom: '1px solid rgba(26,86,219,0.15)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Image src="/logo.png" alt="Unity Multas" width={32} height={32} style={{ objectFit: 'contain', height: '32px', width: 'auto' }} priority />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unity Multas</span>
        </div>
        <AdminNav notifCount={notifCount} />
      </header>

      {/* Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Follow-ups</h1>
          <p style={{ fontSize: '0.82rem', color: '#8BA8CC', marginTop: '6px' }}>
            {counts.todos} contato{counts.todos !== 1 ? 's' : ''} agendado{counts.todos !== 1 ? 's' : ''}{counts.vencidos > 0 ? ` · ${counts.vencidos} atrasado${counts.vencidos !== 1 ? 's' : ''}` : ''}
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {FILTERS.map(({ key, label }) => {
            const active = filter === key
            const count = counts[key]
            const color = FILTER_COLORS[key]
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '7px 14px',
                  background: active ? `${color}18` : 'rgba(9,24,48,0.6)',
                  border: `1px solid ${active ? color + '50' : 'rgba(26,86,219,0.15)'}`,
                  borderRadius: '100px',
                  color: active ? color : '#8BA8CC',
                  fontSize: '0.78rem', fontWeight: active ? 700 : 400,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '18px', height: '18px', padding: '0 5px',
                    background: active ? color : 'rgba(26,86,219,0.15)',
                    borderRadius: '100px', fontSize: '0.62rem', fontWeight: 700,
                    color: active ? (key === 'todos' ? '#040C18' : '#040C18') : '#8BA8CC',
                    lineHeight: 1,
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(9,24,48,0.5)', border: '1px solid rgba(26,86,219,0.1)', borderRadius: '12px', color: '#2A3F5A', fontSize: '0.85rem' }}>
            {filter === 'todos' ? 'Nenhum follow-up agendado.' : `Nenhum follow-up na categoria "${FILTERS.find(f => f.key === filter)?.label}".`}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((c) => (
              <FollowUpCard
                key={c.id}
                cliente={c}
                onRegistrar={() => setModal({ type: 'registrar', clienteId: c.id })}
                onReagendar={() => setModal({ type: 'reagendar', clienteId: c.id })}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal?.type === 'registrar' && activeCliente && (
        <RegistrarModal
          cliente={activeCliente}
          onClose={() => setModal(null)}
          onDone={handleRegistrarDone}
        />
      )}
      {modal?.type === 'reagendar' && activeCliente && (
        <ReagendarModal
          cliente={activeCliente}
          onClose={() => setModal(null)}
          onDone={handleReagendarDone}
        />
      )}
    </div>
  )
}
