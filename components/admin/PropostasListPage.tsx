'use client'
import { useState, useTransition, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import Image from 'next/image'
import type { Proposal, ProposalStatus } from '@/types/proposal'
import { approveProposalAction, getProposalsAction, notificarWhatsAppAction } from '@/app/admin/actions'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<ProposalStatus, { label: string; color: string }> = {
  enviada:     { label: 'Enviada',     color: '#60A5FA' },
  visualizada: { label: 'Visualizada', color: '#FBBF24' },
  em_analise:  { label: 'Em análise',  color: '#A78BFA' },
  aprovada:    { label: 'Aprovada',    color: '#34D399' },
  contratada:  { label: 'Contratada',  color: '#6EE7B7' },
  expirada:    { label: 'Expirada',    color: '#4D6A8A' },
}

const ALL_STATUSES: ProposalStatus[] = ['enviada', 'visualizada', 'em_analise', 'aprovada', 'contratada', 'expirada']

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function fmtDateShort(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  initialProposals: Proposal[]
  baseUrl: string
  clienteTelefones: Record<string, string | null>
  notifCount?: number
}

export default function PropostasListPage({ initialProposals, baseUrl, clienteTelefones, notifCount }: Props) {
  const router = useRouter()
  const [proposals, setProposals] = useState(initialProposals)
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'todas'>('todas')
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const id = setInterval(async () => {
      const updated = await getProposalsAction()
      setProposals(updated)
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  const filtered = useMemo(() => {
    let list = proposals
    if (statusFilter !== 'todas') list = list.filter((p) => p.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        p.nome_cliente.toLowerCase().includes(q) ||
        p.ait.toLowerCase().includes(q) ||
        p.tipo_infracao.toLowerCase().includes(q),
      )
    }
    return list
  }, [proposals, statusFilter, search])

  const countByStatus = useMemo(() => {
    const m: Record<string, number> = { todas: proposals.length }
    for (const s of ALL_STATUSES) m[s] = proposals.filter((p) => p.status === s).length
    return m
  }, [proposals])

  function copyLink(id: string) {
    navigator.clipboard.writeText(`${baseUrl}/p/${id}`)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleApprove(id: string) {
    startTransition(async () => {
      const res = await approveProposalAction(id)
      if (res.ok) {
        const updated = await getProposalsAction()
        setProposals(updated)
        router.refresh()
      }
    })
  }

  function handleWhatsApp(id: string, waUrl: string) {
    window.open(waUrl, '_blank', 'noopener,noreferrer')
    startTransition(async () => {
      await notificarWhatsAppAction(id)
      const updated = await getProposalsAction()
      setProposals(updated)
      router.refresh()
    })
  }

  const FILTER_TABS: Array<{ key: ProposalStatus | 'todas'; label: string }> = [
    { key: 'todas', label: 'Todas' },
    ...ALL_STATUSES.map((s) => ({ key: s, label: STATUS_META[s].label })),
  ]

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

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Propostas</h1>
            <p style={{ fontSize: '0.82rem', color: '#8BA8CC', marginTop: '6px' }}>
              {proposals.length} proposta{proposals.length !== 1 ? 's' : ''} no total
            </p>
          </div>
          <a
            href="/crm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', background: 'rgba(26,86,219,0.1)', border: '1px solid rgba(26,86,219,0.3)', borderRadius: '9px', color: '#60A5FA', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
            Nova proposta (via CRM)
          </a>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#4D6A8A' }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            style={{ width: '100%', padding: '11px 14px 11px 36px', background: 'rgba(26,86,219,0.04)', border: '1px solid rgba(26,86,219,0.18)', borderRadius: '9px', color: '#F0F6FF', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            placeholder="Buscar por nome, AIT ou tipo de infração..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '2px' }}>
          {FILTER_TABS.map(({ key, label }) => {
            const active = statusFilter === key
            const count = countByStatus[key] ?? 0
            const color = key === 'todas' ? '#60A5FA' : STATUS_META[key as ProposalStatus].color
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 13px', whiteSpace: 'nowrap',
                  background: active ? `${color}18` : 'rgba(9,24,48,0.6)',
                  border: `1px solid ${active ? color + '50' : 'rgba(26,86,219,0.15)'}`,
                  borderRadius: '100px', color: active ? color : '#8BA8CC',
                  fontSize: '0.76rem', fontWeight: active ? 700 : 400,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{ background: active ? color : 'rgba(26,86,219,0.15)', color: active ? '#040C18' : '#8BA8CC', borderRadius: '100px', padding: '1px 6px', fontSize: '0.6rem', fontWeight: 700, lineHeight: '16px' }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', background: 'rgba(9,24,48,0.5)', border: '1px solid rgba(26,86,219,0.1)', borderRadius: '12px', color: '#2A3F5A', fontSize: '0.85rem' }}>
            {search ? 'Nenhuma proposta encontrada para essa busca.' : 'Nenhuma proposta neste status.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((p) => {
              const meta = STATUS_META[p.status] ?? { label: p.status, color: '#8BA8CC' }
              const link = `${baseUrl}/p/${p.id}`
              const telefone = clienteTelefones[p.id]
              const canApprove = ['enviada', 'visualizada', 'em_analise'].includes(p.status)
              const hasContractData = !!p.dados_contrato
              const waNumber = telefone?.replace(/\D/g, '')
              const waPropostaMsg = encodeURIComponent(
                `Olá ${p.nome_cliente}! Preparamos uma proposta personalizada para o seu recurso de multa. Acesse o link abaixo para visualizar todas as opções e valores: ${link} — Unity Multas`
              )
              const waContratoMsg = encodeURIComponent(
                `Olá ${p.nome_cliente}! Seu contrato foi enviado para o e-mail ${p.dados_contrato?.email ?? ''} via ClickSign para assinatura. Por favor, verifique sua caixa de entrada (e spam) e assine o quanto antes. Qualquer dúvida, estamos à disposição! — Unity Multas`
              )

              return (
                <div
                  key={p.id}
                  style={{
                    background: 'rgba(9,24,48,0.75)',
                    border: '1px solid rgba(26,86,219,0.15)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                  }}
                >
                  {/* Row 1: name + status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F0F6FF' }}>{p.nome_cliente}</div>
                      <div style={{ fontSize: '0.74rem', color: '#8BA8CC', marginTop: '3px' }}>
                        AIT: <span style={{ color: '#F0F6FF', fontWeight: 600 }}>{p.ait}</span>
                        <span style={{ color: '#4D6A8A' }}> · {p.tipo_infracao}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}35`, borderRadius: '100px', padding: '3px 11px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Row 2: meta info */}
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.74rem', color: '#4D6A8A', marginBottom: '12px' }}>
                    <span>📅 Criada em {fmtDateShort(p.created_at)}</span>
                    <span style={{ color: '#60A5FA' }}>PIX: {fmt(p.valor_essencial_pix)}</span>
                    {telefone && <span style={{ color: '#60A5FA' }}>📱 {telefone}</span>}
                    {p.viewed_at && <span>👁 Vista em {fmtDate(p.viewed_at)}</span>}
                    {p.accepted_at && <span style={{ color: '#34D399' }}>✓ Aprovada em {fmtDate(p.accepted_at)}</span>}
                    {p.prazo_validade && <span>Validade: {fmtDateShort(p.prazo_validade)}</span>}
                  </div>

                  {/* Row 3: actions */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Contract actions — only when contract data is filled */}
                    {hasContractData && (
                      <a
                        href={`/api/contrato/${p.id}`}
                        download
                        style={{ padding: '7px 12px', background: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.35)', borderRadius: '7px', color: '#E8B84B', fontSize: '0.74rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Baixar contrato PDF
                      </a>
                    )}
                    {hasContractData && waNumber && (
                      <button
                        onClick={() => handleWhatsApp(p.id, `https://wa.me/${waNumber}?text=${waContratoMsg}`)}
                        disabled={isPending}
                        style={{ padding: '7px 12px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '7px', color: '#34D399', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.101 22l4.949-1.302A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.522 2 12 2z"/></svg>
                        Avisar no WhatsApp
                      </button>
                    )}

                    <div style={{ width: '1px', background: 'rgba(26,86,219,0.15)', margin: '0 2px', display: hasContractData ? 'block' : 'none' }} />

                    {canApprove && (
                      <button
                        onClick={() => handleApprove(p.id)}
                        disabled={isPending}
                        style={{ padding: '7px 12px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '7px', color: '#34D399', fontSize: '0.74rem', fontWeight: 600, cursor: isPending ? 'wait' : 'pointer', fontFamily: 'inherit' }}
                      >
                        ✓ Aprovar
                      </button>
                    )}
                    {waNumber && (
                      <a
                        href={`https://wa.me/${waNumber}?text=${waPropostaMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '7px 12px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)', borderRadius: '7px', color: '#34D399', fontSize: '0.74rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.101 22l4.949-1.302A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.522 2 12 2z"/></svg>
                        Enviar proposta
                      </a>
                    )}
                    <button
                      onClick={() => copyLink(p.id)}
                      style={{ padding: '7px 12px', background: copied === p.id ? 'rgba(52,211,153,0.1)' : 'rgba(26,86,219,0.08)', border: `1px solid ${copied === p.id ? 'rgba(52,211,153,0.3)' : 'rgba(26,86,219,0.2)'}`, borderRadius: '7px', color: copied === p.id ? '#34D399' : '#60A5FA', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      {copied === p.id ? '✓ Copiado' : 'Copiar link'}
                    </button>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '7px 12px', background: 'rgba(26,86,219,0.08)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '7px', color: '#60A5FA', fontSize: '0.74rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Abrir ↗
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
