'use client'
import AdminNav from '@/components/admin/AdminNav'
import Image from 'next/image'
import type { Cliente, Atividade } from '@/types/crm'

interface Props {
  data: {
    followupsVencidos: Cliente[]
    followupsHoje: Cliente[]
    resultadosRecentes: Atividade[]
    propostasRecentes: { id: string; nome_cliente: string; accepted_at: string | null; valor_essencial_pix: number }[]
  }
  notifCount?: number
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function overdayCount(followupData: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(followupData + 'T12:00:00'); due.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - due.getTime()) / 86400000)
}

function Section({ title, count, color, children }: { title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F0F6FF', margin: 0 }}>{title}</h2>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700,
          background: `${color}18`, border: `1px solid ${color}40`,
          color, borderRadius: '100px', padding: '2px 10px',
        }}>
          {count}
        </span>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: '20px', background: 'rgba(9,24,48,0.5)', border: '1px solid rgba(26,86,219,0.1)', borderRadius: '10px', textAlign: 'center', fontSize: '0.82rem', color: '#2A3F5A' }}>
      {message}
    </div>
  )
}

export default function NotificacoesPage({ data, notifCount }: Props) {
  const { followupsVencidos, followupsHoje, resultadosRecentes, propostasRecentes } = data
  const totalUrgente = notifCount ?? (followupsVencidos.length + followupsHoje.length)

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      {/* Header */}
      <header style={{ background: 'rgba(4,12,24,0.95)', borderBottom: '1px solid rgba(26,86,219,0.15)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Image src="/logo.png" alt="Unity Multas" width={32} height={32} style={{ objectFit: 'contain', height: '32px', width: 'auto' }} priority />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unity Multas</span>
        </div>
        <AdminNav notifCount={totalUrgente} />
      </header>

      {/* Content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Notificações</h1>
          <p style={{ fontSize: '0.82rem', color: '#8BA8CC', marginTop: '6px' }}>
            Follow-ups pendentes, resultados informados e propostas contratadas.
          </p>
        </div>

        {/* Follow-ups vencidos */}
        <Section title="Follow-ups vencidos" count={followupsVencidos.length} color="#EF4444">
          {followupsVencidos.length === 0
            ? <EmptyState message="Nenhum follow-up atrasado." />
            : followupsVencidos.map((c) => {
                const dias = overdayCount(c.followup_data!)
                return (
                  <div key={c.id} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F0F6FF' }}>{c.nome}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8BA8CC', marginTop: '3px' }}>
                        {c.ait ? `AIT: ${c.ait} · ` : ''}{c.tipo_infracao ?? ''}
                        {c.followup_canal ? ` · via ${c.followup_canal}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FCA5A5' }}>
                        {dias} dia{dias !== 1 ? 's' : ''} atrasado
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#4D6A8A', marginTop: '2px' }}>
                        Era {fmtDate(c.followup_data!)}
                      </div>
                    </div>
                    <a href="/crm" style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '7px', color: '#FCA5A5', fontSize: '0.73rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                      Ver no CRM
                    </a>
                  </div>
                )
              })
          }
        </Section>

        {/* Follow-ups de hoje */}
        <Section title="Follow-ups de hoje" count={followupsHoje.length} color="#F97316">
          {followupsHoje.length === 0
            ? <EmptyState message="Nenhum follow-up agendado para hoje." />
            : followupsHoje.map((c) => (
                <div key={c.id} style={{ background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F0F6FF' }}>{c.nome}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8BA8CC', marginTop: '3px' }}>
                      {c.ait ? `AIT: ${c.ait} · ` : ''}{c.tipo_infracao ?? ''}
                      {c.followup_canal ? ` · via ${c.followup_canal}` : ''}
                      {c.followup_contagem > 0 ? ` · ${c.followup_contagem}ª tentativa` : ''}
                    </div>
                  </div>
                  <a href="/crm" style={{ padding: '7px 12px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '7px', color: '#FDBA74', fontSize: '0.73rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                    Ver no CRM
                  </a>
                </div>
              ))
          }
        </Section>

        {/* Resultados recentes */}
        <Section title="Resultados informados (7 dias)" count={resultadosRecentes.length} color="#A78BFA">
          {resultadosRecentes.length === 0
            ? <EmptyState message="Nenhum resultado informado nos últimos 7 dias." />
            : resultadosRecentes.map((a) => {
                const isDeferido = a.texto.includes('DEFERIDA') || a.texto.includes('DEFERIDO')
                return (
                  <div key={a.id} style={{ background: 'rgba(9,24,48,0.7)', border: `1px solid ${isDeferido ? 'rgba(110,231,183,0.2)' : 'rgba(248,113,113,0.2)'}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{isDeferido ? '✅' : '❌'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.83rem', color: '#D1E0F0', lineHeight: 1.5 }}>{a.texto}</div>
                      <div style={{ fontSize: '0.7rem', color: '#4D6A8A', marginTop: '4px' }}>{fmtDateTime(a.created_at)}</div>
                    </div>
                  </div>
                )
              })
          }
        </Section>

        {/* Propostas contratadas */}
        <Section title="Propostas contratadas (7 dias)" count={propostasRecentes.length} color="#6EE7B7">
          {propostasRecentes.length === 0
            ? <EmptyState message="Nenhuma proposta contratada nos últimos 7 dias." />
            : propostasRecentes.map((p) => (
                <div key={p.id} style={{ background: 'rgba(110,231,183,0.04)', border: '1px solid rgba(110,231,183,0.18)', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F0F6FF' }}>{p.nome_cliente}</div>
                    <div style={{ fontSize: '0.75rem', color: '#8BA8CC', marginTop: '3px' }}>
                      {p.accepted_at ? fmtDate(p.accepted_at) : '—'} · {fmtBRL(p.valor_essencial_pix)} PIX
                    </div>
                  </div>
                  <a href={`/p/${p.id}`} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 12px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: '7px', color: '#6EE7B7', fontSize: '0.73rem', fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                    Ver proposta
                  </a>
                </div>
              ))
          }
        </Section>
      </main>
    </div>
  )
}
