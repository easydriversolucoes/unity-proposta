'use client'
import { useState, useEffect } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import Image from 'next/image'
import type { Cliente, ProcessoRecurso, FaseRecursoRecord } from '@/types/crm'
import type { Proposal } from '@/types/proposal'
import { FASE_LABELS, TIPO_PROCESSO_LABELS } from '@/types/crm'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProcessoComFases = ProcessoRecurso & { fases: FaseRecursoRecord[] }
type ContratoItem = { cliente: Cliente; proposta: Proposal | null; processos: ProcessoComFases[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }
function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_COLORS: Record<string, string> = {
  em_andamento: '#60A5FA',
  aguardando_resultado: '#FBBF24',
  deferido: '#34D399',
  indeferido: '#F87171',
}

const RESULTADO_COLORS: Record<string, string> = {
  deferido: '#34D399',
  indeferido: '#F87171',
}

// ─── Client card ─────────────────────────────────────────────────────────────

function ContratoCard({ item, search }: { item: ContratoItem; search: string }) {
  const [open, setOpen] = useState(false)
  const { cliente, proposta, processos } = item

  const highlight = search.trim().toLowerCase()
  const matches = !highlight
    || cliente.nome.toLowerCase().includes(highlight)
    || (cliente.ait ?? '').toLowerCase().includes(highlight)
    || (cliente.cpf ?? '').toLowerCase().includes(highlight)
    || (cliente.placa ?? '').toLowerCase().includes(highlight)

  if (!matches) return null

  const plano = proposta?.plano_aceito ?? null
  const valorPix = proposta?.valor_essencial_pix

  return (
    <div style={{ background: 'rgba(9,24,48,0.75)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
      {/* Header row */}
      <div
        onClick={() => setOpen(!open)}
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F0F6FF' }}>{cliente.nome}</div>
          <div style={{ fontSize: '0.74rem', color: '#8BA8CC', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {cliente.ait && <span>AIT: <strong style={{ color: '#F0F6FF' }}>{cliente.ait}</strong></span>}
            {cliente.tipo_infracao && <span style={{ color: '#4D6A8A' }}>{cliente.tipo_infracao}</span>}
            {cliente.placa && <span>Placa: {cliente.placa}</span>}
            {cliente.pagamento_realizado_at && <span style={{ color: '#34D399' }}>💰 Pago em {fmtDate(cliente.pagamento_realizado_at)}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {valorPix && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#60A5FA' }}>{fmt(valorPix)}</span>}
          {plano && <span style={{ fontSize: '0.68rem', background: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.3)', color: '#E8B84B', borderRadius: '100px', padding: '2px 9px', fontWeight: 700 }}>{plano.toUpperCase()}</span>}
          <span style={{ color: '#4D6A8A', fontSize: '0.8rem' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(26,86,219,0.1)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Client data */}
          <div>
            <div style={{ fontSize: '0.65rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Dados do cliente</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '6px 16px', fontSize: '0.78rem' }}>
              {([['CPF', cliente.cpf], ['Placa', cliente.placa], ['Tel.', cliente.telefone ?? cliente.whatsapp], ['Órgão', cliente.orgao], ['Origem', cliente.origem]] as [string, string | null][]).map(([lbl, val]) =>
                val ? <div key={lbl}><span style={{ color: '#4D6A8A' }}>{lbl}: </span><span style={{ color: '#F0F6FF' }}>{val}</span></div> : null
              )}
              {cliente.tem_suspensao && <div style={{ gridColumn: '1/-1' }}><span style={{ background: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.3)', color: '#E8B84B', borderRadius: '100px', padding: '2px 9px', fontSize: '0.68rem', fontWeight: 700 }}>Tem suspensão da CNH</span></div>}
            </div>
          </div>

          {/* Proposta / contrato data */}
          {proposta && (
            <div>
              <div style={{ fontSize: '0.65rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Contrato</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '6px 16px', fontSize: '0.78rem' }}>
                <div><span style={{ color: '#4D6A8A' }}>PIX: </span><span style={{ color: '#60A5FA', fontWeight: 700 }}>{fmt(proposta.valor_essencial_pix)}</span></div>
                <div><span style={{ color: '#4D6A8A' }}>Plano: </span><span style={{ color: '#E8B84B' }}>{proposta.plano_aceito ?? '—'}</span></div>
                <div><span style={{ color: '#4D6A8A' }}>Aceito em: </span><span style={{ color: '#F0F6FF' }}>{fmtDateTime(proposta.accepted_at ?? proposta.created_at)}</span></div>
                {proposta.dados_contrato && (
                  <>
                    <div><span style={{ color: '#4D6A8A' }}>E-mail: </span><span style={{ color: '#F0F6FF' }}>{proposta.dados_contrato.email}</span></div>
                    <div><span style={{ color: '#4D6A8A' }}>CEP: </span><span style={{ color: '#F0F6FF' }}>{proposta.dados_contrato.cep}</span></div>
                    <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#4D6A8A' }}>Endereço: </span><span style={{ color: '#F0F6FF' }}>{proposta.dados_contrato.endereco}, {proposta.dados_contrato.numero} — {proposta.dados_contrato.bairro}, {proposta.dados_contrato.cidade}/{proposta.dados_contrato.estado}</span></div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Processos */}
          {processos.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Fases do recurso</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {processos.map((proc) => (
                  <div key={proc.id} style={{ background: 'rgba(4,12,24,0.6)', border: '1px solid rgba(26,86,219,0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(196,146,42,0.1)', border: '1px solid rgba(196,146,42,0.25)', color: '#E8B84B', borderRadius: '6px', padding: '2px 8px' }}>
                        {TIPO_PROCESSO_LABELS[proc.tipo]}
                      </span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: STATUS_COLORS[proc.status] ?? '#8BA8CC' }}>
                        {proc.status.replace(/_/g, ' ')}
                      </span>
                      {proc.numero_protocolo && (
                        <span style={{ fontSize: '0.72rem', color: '#8BA8CC' }}>Protocolo: {proc.numero_protocolo}</span>
                      )}
                    </div>
                    {/* Fases */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {proc.fases.length === 0 ? (
                        <span style={{ fontSize: '0.72rem', color: '#2A3F5A', fontStyle: 'italic' }}>Nenhuma fase registrada ainda</span>
                      ) : proc.fases.map((f) => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(9,24,48,0.8)', border: `1px solid ${f.resultado ? RESULTADO_COLORS[f.resultado] + '50' : 'rgba(26,86,219,0.15)'}`, borderRadius: '7px', padding: '4px 9px', fontSize: '0.7rem' }}>
                          <span style={{ color: '#8BA8CC' }}>{FASE_LABELS[f.fase]}</span>
                          {f.resultado && (
                            <span style={{ fontWeight: 700, color: RESULTADO_COLORS[f.resultado] }}>→ {f.resultado}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ContratosPage({ data, notifCount }: { data: ContratoItem[]; notifCount?: number }) {
  const [search, setSearch] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      <header style={{ background: 'rgba(4,12,24,0.95)', borderBottom: '1px solid rgba(26,86,219,0.15)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Image src="/logo.png" alt="Unity Multas" width={32} height={32} style={{ objectFit: 'contain', height: '32px', width: 'auto' }} priority />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unity Multas</span>
        </div>
        <AdminNav notifCount={notifCount} />
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Contratos ativos</h1>
          <p style={{ fontSize: '0.82rem', color: '#8BA8CC', marginTop: '6px' }}>
            {data.length} cliente{data.length !== 1 ? 's' : ''} com pagamento registrado
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#4D6A8A' }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            style={{ width: '100%', padding: '11px 14px 11px 36px', background: 'rgba(26,86,219,0.04)', border: '1px solid rgba(26,86,219,0.18)', borderRadius: '9px', color: '#F0F6FF', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            placeholder="Buscar por nome, AIT, CPF ou placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {data.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(9,24,48,0.5)', border: '1px solid rgba(26,86,219,0.1)', borderRadius: '12px', color: '#2A3F5A', fontSize: '0.85rem' }}>
            Nenhum cliente com pagamento registrado ainda.
          </div>
        ) : (
          <div>
            {data.map((item) => (
              <ContratoCard key={item.cliente.id} item={item} search={search} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
