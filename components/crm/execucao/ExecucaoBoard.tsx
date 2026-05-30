'use client'
import { useState, useTransition } from 'react'
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
import type { TarefaExecucao, EtapaTarefa, FaseRecurso } from '@/types/crm'
import { FASE_LABELS, TIPO_PROCESSO_LABELS } from '@/types/crm'
import { moveTarefaAction, arquivarTarefaAction } from '@/app/crm/execucao/actions'

const EXEC_COLUMNS: Array<{ id: EtapaTarefa; label: string; color: string }> = [
  { id: 'a_redigir', label: 'A redigir', color: '#60A5FA' },
  { id: 'em_redigicao', label: 'Em redigição', color: '#A78BFA' },
  { id: 'aguardando_protocolo', label: 'Aguardando protocolo', color: '#FBBF24' },
  { id: 'protocolado', label: 'Protocolado', color: '#6EE7B7' },
]

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
    maxWidth: '440px',
  },
}

function diasNaEtapa(createdAt: string): number {
  const d = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000)
  return d
}

// ─── Task card ────────────────────────────────────────────────────────────────

function TarefaCardContent({ tarefa, isOverlay }: { tarefa: TarefaExecucao; isOverlay?: boolean }) {
  const dias = diasNaEtapa(tarefa.created_at)
  const tipoLabel = tarefa.processos_recurso ? TIPO_PROCESSO_LABELS[tarefa.processos_recurso.tipo] : ''
  const faseLabel = FASE_LABELS[tarefa.fase]

  return (
    <div style={{
      background: 'rgba(9,24,48,0.85)',
      border: '1px solid rgba(26,86,219,0.2)',
      borderRadius: '10px',
      padding: '14px',
      marginBottom: '8px',
      cursor: isOverlay ? 'grabbing' : 'grab',
      userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(26,86,219,0.12)', border: '1px solid rgba(26,86,219,0.25)', color: '#60A5FA', borderRadius: '6px', padding: '2px 7px', letterSpacing: '0.04em' }}>
          {faseLabel}
        </span>
        {tipoLabel && (
          <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(196,146,42,0.1)', border: '1px solid rgba(196,146,42,0.25)', color: '#E8B84B', borderRadius: '6px', padding: '2px 7px' }}>
            {tipoLabel}
          </span>
        )}
      </div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F0F6FF', marginBottom: '4px' }}>
        {tarefa.clientes?.nome ?? '—'}
      </div>
      {tarefa.clientes?.ait && (
        <div style={{ fontSize: '0.73rem', color: '#8BA8CC' }}>AIT: {tarefa.clientes.ait}</div>
      )}
      {tarefa.clientes?.tipo_infracao && (
        <div style={{ fontSize: '0.73rem', color: '#4D6A8A', marginTop: '1px' }}>{tarefa.clientes.tipo_infracao}</div>
      )}
      {tarefa.prazo && (
        <div style={{ fontSize: '0.7rem', color: '#FBBF24', marginTop: '6px' }}>
          ⏰ Prazo: {new Date(tarefa.prazo + 'T12:00:00').toLocaleDateString('pt-BR')}
        </div>
      )}
      <div style={{ fontSize: '0.68rem', color: '#2A3F5A', marginTop: '6px' }}>
        {dias === 0 ? 'Hoje' : `${dias} dia${dias !== 1 ? 's' : ''} nesta etapa`}
      </div>
    </div>
  )
}

function DraggableTarefa({ tarefa }: { tarefa: TarefaExecucao }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: tarefa.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
      {...listeners}
      {...attributes}
    >
      <TarefaCardContent tarefa={tarefa} />
    </div>
  )
}

function DroppableExecColumn({ col, tarefas }: { col: typeof EXEC_COLUMNS[number]; tarefas: TarefaExecucao[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  return (
    <div style={{ width: '280px', minWidth: '280px', flexShrink: 0 }}>
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
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: col.color }}>{col.label}</span>
        <span style={{ fontSize: '0.68rem', color: '#4D6A8A', fontWeight: 600 }}>{tarefas.length}</span>
      </div>
      <div
        ref={setNodeRef}
        style={{
          minHeight: '200px',
          padding: '10px 8px',
          background: isOver ? 'rgba(26,86,219,0.06)' : 'rgba(9,24,48,0.5)',
          border: `1px solid ${isOver ? col.color + '50' : 'rgba(26,86,219,0.12)'}`,
          borderRadius: '0 0 10px 10px',
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {tarefas.map((t) => <DraggableTarefa key={t.id} tarefa={t} />)}
        {tarefas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 8px', color: '#2A3F5A', fontSize: '0.75rem' }}>
            Nenhuma tarefa
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Archive modal (protocolo) ────────────────────────────────────────────────

function ArchiveModal({
  tarefa,
  onClose,
  onConfirm,
  isPending,
}: {
  tarefa: TarefaExecucao
  onClose: () => void
  onConfirm: (numeroProtocolo: string) => void
  isPending: boolean
}) {
  const [protocolo, setProtocolo] = useState('')
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.7rem', color: '#6EE7B7', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Protocolar recurso
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF' }}>{tarefa.clientes?.nome}</h3>
          <p style={{ fontSize: '0.78rem', color: '#8BA8CC', marginTop: '4px' }}>
            {FASE_LABELS[tarefa.fase]} · {tarefa.processos_recurso ? TIPO_PROCESSO_LABELS[tarefa.processos_recurso.tipo] : ''}
          </p>
        </div>
        <label style={{ marginBottom: '16px', display: 'block' }}>
          <span style={S.label}>Número do protocolo (opcional)</span>
          <input style={S.field} value={protocolo} onChange={(e) => setProtocolo(e.target.value)} placeholder="Ex: 2024/123456" />
        </label>
        <p style={{ fontSize: '0.78rem', color: '#8BA8CC', marginBottom: '20px' }}>
          A tarefa será arquivada e o processo passará para <strong style={{ color: '#FBBF24' }}>Aguardando resultado</strong>. O cliente será notificado para verificar e informar o resultado.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '8px', color: '#8BA8CC', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(protocolo)}
            disabled={isPending}
            style={{ flex: 2, padding: '11px', background: 'linear-gradient(135deg,#059669,#047857)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: isPending ? 'wait' : 'pointer', fontFamily: 'inherit' }}
          >
            {isPending ? 'Arquivando...' : '✓ Confirmar protocolo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main board ───────────────────────────────────────────────────────────────

export default function ExecucaoBoard({ initialTarefas }: { initialTarefas: TarefaExecucao[] }) {
  const [tarefas, setTarefas] = useState<TarefaExecucao[]>(initialTarefas)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingArchive, setPendingArchive] = useState<TarefaExecucao | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const tarefaId = String(active.id)
    const targetEtapa = String(over.id) as EtapaTarefa
    const tarefa = tarefas.find((t) => t.id === tarefaId)
    if (!tarefa || tarefa.etapa === targetEtapa) return

    if (targetEtapa === 'protocolado') {
      setPendingArchive(tarefa)
      return
    }

    setTarefas((prev) => prev.map((t) => t.id === tarefaId ? { ...t, etapa: targetEtapa } : t))
    startTransition(async () => {
      const res = await moveTarefaAction(tarefaId, targetEtapa)
      if (!res.ok) setTarefas((prev) => prev.map((t) => t.id === tarefaId ? { ...t, etapa: tarefa.etapa } : t))
    })
  }

  function handleArchiveConfirm(numeroProtocolo: string) {
    if (!pendingArchive) return
    const { id, processo_id } = pendingArchive
    setTarefas((prev) => prev.filter((t) => t.id !== id))
    setPendingArchive(null)

    startTransition(async () => {
      const res = await arquivarTarefaAction(id, processo_id, numeroProtocolo || undefined)
      if (!res.ok) setTarefas((prev) => [pendingArchive, ...prev])
    })
  }

  const activeTarefa = activeId ? tarefas.find((t) => t.id === activeId) : null

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      {/* Header */}
      <header style={{ background: 'rgba(4,12,24,0.95)', borderBottom: '1px solid rgba(26,86,219,0.15)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unity Multas</span>
          </div>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { href: '/admin', label: 'Propostas' },
              { href: '/crm', label: 'CRM' },
              { href: '/crm/execucao', label: 'Execução' },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', color: item.href === '/crm/execucao' ? '#60A5FA' : '#8BA8CC', background: item.href === '/crm/execucao' ? 'rgba(26,86,219,0.12)' : 'transparent', textDecoration: 'none', fontWeight: item.href === '/crm/execucao' ? 600 : 400 }}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#4D6A8A' }}>
          {tarefas.length} tarefa{tarefas.length !== 1 ? 's' : ''} ativa{tarefas.length !== 1 ? 's' : ''}
        </div>
      </header>

      {/* Legend */}
      <div style={{ padding: '12px 24px', background: 'rgba(9,24,48,0.4)', borderBottom: '1px solid rgba(26,86,219,0.08)', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.73rem', color: '#4D6A8A' }}>
        <span>Arraste o card para a coluna correta.</span>
        <span style={{ color: '#6EE7B7' }}>Ao mover para <strong>Protocolado</strong>, a tarefa é arquivada e o cliente é avisado para verificar o resultado.</span>
      </div>

      {/* Kanban */}
      <div style={{ overflowX: 'auto', padding: '24px' }}>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: '12px', minWidth: 'max-content' }}>
            {EXEC_COLUMNS.map((col) => (
              <DroppableExecColumn
                key={col.id}
                col={col}
                tarefas={tarefas.filter((t) => t.etapa === col.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTarefa && <TarefaCardContent tarefa={activeTarefa} isOverlay />}
          </DragOverlay>
        </DndContext>
      </div>

      {pendingArchive && (
        <ArchiveModal
          tarefa={pendingArchive}
          onClose={() => setPendingArchive(null)}
          onConfirm={handleArchiveConfirm}
          isPending={isPending}
        />
      )}
    </div>
  )
}
