'use client'
import { useState, useTransition } from 'react'
import { createProposalAction, logoutAction, getProposalsAction } from '@/app/admin/actions'
import type { Proposal } from '@/types/proposal'

const INFRACTION_TYPES = [
  'Lei Seca — Recusa ao Teste',
  'Lei Seca — Etilômetro',
  'Outro',
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  enviada:     { label: 'Enviada',     color: '#60A5FA' },
  visualizada: { label: 'Visualizada', color: '#E8B84B' },
  em_analise:  { label: 'Em análise',  color: '#A78BFA' },
  contratada:  { label: 'Contratada',  color: '#6EE7B7' },
  expirada:    { label: 'Expirada',    color: '#4D6A8A' },
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(d))
}

interface ProposalFormProps {
  initialProposals: Proposal[]
  baseUrl: string
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(26, 86, 219, 0.05)',
  border: '1px solid rgba(26, 86, 219, 0.18)',
  borderRadius: '8px',
  color: '#F0F6FF',
  fontSize: '0.88rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  color: '#4D6A8A',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: '6px',
  fontWeight: 600,
}

const sectionTitle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#1A56DB',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  fontWeight: 700,
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '1px solid rgba(26,86,219,0.15)',
}

const FOCUS = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'rgba(26,86,219,0.5)'
}
const BLUR = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'rgba(26,86,219,0.18)'
}

export function ProposalForm({ initialProposals, baseUrl }: ProposalFormProps) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    nome_cliente: '',
    ait: '',
    tipo_infracao: INFRACTION_TYPES[0],
    valor_essencial_pix: '1100',
    valor_essencial_cartao: '1500',
    parcelas_essencial: '10',
    valor_gestao_pix: '',
    valor_gestao_cartao: '',
    parcelas_gestao: '10',
    mostrar_gestao: false,
    prazo_validade: '',
    observacoes: '',
  })

  function f(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function titleCase(str: string) {
    return str.replace(/(^|\s)\S/g, c => c.toUpperCase())
  }

  function toggleGestao() {
    setForm((prev) => ({ ...prev, mostrar_gestao: !prev.mostrar_gestao }))
  }

  function num(v: string) {
    return parseFloat(v.replace(',', '.')) || 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    startTransition(async () => {
      const result = await createProposalAction({
        nome_cliente: form.nome_cliente.trim(),
        ait: form.ait.trim().toUpperCase(),
        tipo_infracao: form.tipo_infracao,
        valor_essencial_pix:    num(form.valor_essencial_pix),
        valor_essencial_cartao: num(form.valor_essencial_cartao),
        parcelas_essencial:     parseInt(form.parcelas_essencial) || 1,
        valor_gestao_pix:       num(form.valor_gestao_pix),
        valor_gestao_cartao:    num(form.valor_gestao_cartao),
        parcelas_gestao:        parseInt(form.parcelas_gestao) || 1,
        mostrar_gestao:         form.mostrar_gestao,
        prazo_validade: form.prazo_validade || undefined,
        observacoes:   form.observacoes   || undefined,
      })
      if (result.ok && result.id) {
        setGeneratedLink(`${baseUrl}/p/${result.id}`)
        const updated = await getProposalsAction()
        setProposals(updated)
        setForm({
          nome_cliente: '', ait: '', tipo_infracao: INFRACTION_TYPES[0],
          valor_essencial_pix: '1100', valor_essencial_cartao: '1500', parcelas_essencial: '10',
          valor_gestao_pix: '', valor_gestao_cartao: '', parcelas_gestao: '10',
          mostrar_gestao: false,
          prazo_validade: '', observacoes: '',
        })
      } else {
        setSubmitError(result.error ?? 'Erro ao criar proposta. Verifique as variáveis de ambiente e o schema do Supabase.')
      }
    })
  }

  function copyLink() {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
      window.location.reload()
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      {/* Header */}
      <header
        style={{
          background: 'rgba(4, 12, 24, 0.95)',
          borderBottom: '1px solid rgba(26,86,219,0.15)',
          backdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 50,
          padding: '0 32px', height: '68px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
              borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Unity Multas
          </span>
          <span style={{ background: 'rgba(26,86,219,0.12)', border: '1px solid rgba(26,86,219,0.25)', color: '#60A5FA', borderRadius: '100px', padding: '2px 10px', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em' }}>
            Painel Interno
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid rgba(26,86,219,0.2)', color: '#8BA8CC', borderRadius: '8px', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Sair
        </button>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

          {/* Left — Form */}
          <div>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>Nova Proposta</h1>
              <p style={{ fontSize: '0.84rem', color: '#8BA8CC' }}>Preencha os dados para gerar o link da proposta.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ background: 'rgba(9,24,48,0.85)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Cliente */}
                <div>
                  <div style={sectionTitle}>Dados do Cliente</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label>
                      <span style={labelStyle}>Nome completo *</span>
                      <input style={fieldStyle} type="text" required placeholder="Ex: Carlos Henrique Silva"
                        value={form.nome_cliente} onChange={(e) => f('nome_cliente', titleCase(e.target.value))} onFocus={FOCUS} onBlur={BLUR} />
                    </label>
                    <label>
                      <span style={labelStyle}>Número do AIT *</span>
                      <input style={fieldStyle} type="text" required placeholder="Ex: 4F8K29XX"
                        value={form.ait} onChange={(e) => f('ait', e.target.value)} onFocus={FOCUS} onBlur={BLUR} />
                    </label>
                  </div>
                </div>

                {/* Processo */}
                <div>
                  <div style={sectionTitle}>Processo</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label>
                      <span style={labelStyle}>Tipo de infração *</span>
                      <select style={{ ...fieldStyle, cursor: 'pointer' }}
                        value={form.tipo_infracao} onChange={(e) => f('tipo_infracao', e.target.value)} onFocus={FOCUS} onBlur={BLUR}>
                        {INFRACTION_TYPES.map((t) => <option key={t} value={t} style={{ background: '#040C18' }}>{t}</option>)}
                      </select>
                    </label>
                    <label>
                      <span style={labelStyle}>Validade da proposta</span>
                      <input style={fieldStyle} type="date"
                        value={form.prazo_validade} onChange={(e) => f('prazo_validade', e.target.value)} onFocus={FOCUS} onBlur={BLUR} />
                    </label>
                  </div>
                </div>

                {/* Defesa Estratégica */}
                <div>
                  <div style={sectionTitle}>Defesa Estratégica — Valores</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <label>
                      <span style={labelStyle}>Valor PIX *</span>
                      <input style={fieldStyle} type="number" required placeholder="Ex: 800" min="0" step="0.01"
                        value={form.valor_essencial_pix} onChange={(e) => f('valor_essencial_pix', e.target.value)} onFocus={FOCUS} onBlur={BLUR} />
                    </label>
                    <label>
                      <span style={labelStyle}>Valor Cartão *</span>
                      <input style={fieldStyle} type="number" required placeholder="Ex: 900" min="0" step="0.01"
                        value={form.valor_essencial_cartao} onChange={(e) => f('valor_essencial_cartao', e.target.value)} onFocus={FOCUS} onBlur={BLUR} />
                    </label>
                    <label>
                      <span style={labelStyle}>Parcelas cartão</span>
                      <select style={{ ...fieldStyle, cursor: 'pointer' }}
                        value={form.parcelas_essencial} onChange={(e) => f('parcelas_essencial', e.target.value)} onFocus={FOCUS} onBlur={BLUR}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
                          <option key={n} value={n} style={{ background: '#040C18' }}>{n === 1 ? '1x (à vista)' : `${n}x`}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {/* Gestão de Notificações */}
                <div style={{ opacity: form.mostrar_gestao ? 1 : 0.4, pointerEvents: form.mostrar_gestao ? 'auto' : 'none', transition: 'opacity 0.2s ease' }}>
                  <div style={sectionTitle}>
                    Gestão de Notificações — Valores (adicional)
                    {!form.mostrar_gestao && (
                      <span style={{ fontSize: '0.65rem', color: '#4D6A8A', fontWeight: 400, letterSpacing: '0.04em', marginLeft: '8px', textTransform: 'none' }}>
                        — ative o toggle acima para habilitar
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <label>
                      <span style={labelStyle}>Valor PIX {form.mostrar_gestao ? '*' : ''}</span>
                      <input style={fieldStyle} type="number" required={form.mostrar_gestao} placeholder="Ex: 300" min="0" step="0.01"
                        value={form.valor_gestao_pix} onChange={(e) => f('valor_gestao_pix', e.target.value)} onFocus={FOCUS} onBlur={BLUR} />
                    </label>
                    <label>
                      <span style={labelStyle}>Valor Cartão {form.mostrar_gestao ? '*' : ''}</span>
                      <input style={fieldStyle} type="number" required={form.mostrar_gestao} placeholder="Ex: 350" min="0" step="0.01"
                        value={form.valor_gestao_cartao} onChange={(e) => f('valor_gestao_cartao', e.target.value)} onFocus={FOCUS} onBlur={BLUR} />
                    </label>
                    <label>
                      <span style={labelStyle}>Parcelas cartão</span>
                      <select style={{ ...fieldStyle, cursor: 'pointer' }}
                        value={form.parcelas_gestao} onChange={(e) => f('parcelas_gestao', e.target.value)} onFocus={FOCUS} onBlur={BLUR}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
                          <option key={n} value={n} style={{ background: '#040C18' }}>{n === 1 ? '1x (à vista)' : `${n}x`}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {/* Toggle upsell */}
                <div>
                  <div style={sectionTitle}>Upsell</div>
                  <button
                    type="button"
                    onClick={toggleGestao}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      background: form.mostrar_gestao ? 'rgba(196,146,42,0.08)' : 'rgba(26,86,219,0.04)',
                      border: `1px solid ${form.mostrar_gestao ? 'rgba(196,146,42,0.35)' : 'rgba(26,86,219,0.15)'}`,
                      borderRadius: '10px', padding: '14px 16px', cursor: 'pointer',
                      width: '100%', textAlign: 'left', transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Toggle pill */}
                    <div style={{
                      width: '40px', height: '22px', borderRadius: '100px', flexShrink: 0,
                      background: form.mostrar_gestao ? '#C4922A' : 'rgba(26,86,219,0.2)',
                      position: 'relative', transition: 'background 0.2s ease',
                    }}>
                      <div style={{
                        position: 'absolute', top: '3px',
                        left: form.mostrar_gestao ? '20px' : '3px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: 'white', transition: 'left 0.2s ease',
                      }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: form.mostrar_gestao ? '#E8B84B' : '#8BA8CC' }}>
                        Mostrar Gestão de Notificações
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4D6A8A', marginTop: '2px' }}>
                        {form.mostrar_gestao
                          ? 'O cliente verá a opção de contratar o upsell'
                          : 'O upsell ficará oculto nesta proposta'}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Observações */}
                <label>
                  <span style={labelStyle}>Observações internas</span>
                  <textarea style={{ ...fieldStyle, minHeight: '72px', resize: 'vertical' }}
                    placeholder="Notas para uso interno..."
                    value={form.observacoes} onChange={(e) => f('observacoes', e.target.value)} onFocus={FOCUS} onBlur={BLUR} />
                </label>

                {submitError && (
                  <div
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      fontSize: '0.82rem',
                      color: '#FCA5A5',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Erro:</strong> {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    padding: '14px', background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
                    color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.92rem', fontWeight: 700,
                    cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.7 : 1,
                    boxShadow: '0 4px 20px rgba(26,86,219,0.4)', transition: 'all 0.25s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {isPending ? 'Gerando...' : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      Gerar proposta
                    </>
                  )}
                </button>
              </div>
            </form>

            {generatedLink && (
              <div style={{ marginTop: '20px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '12px', padding: '20px 24px' }}>
                <div style={{ fontSize: '0.72rem', color: '#6EE7B7', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
                  ✓ Proposta gerada com sucesso
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <code style={{ flex: 1, background: 'rgba(9,24,48,0.8)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.82rem', color: '#60A5FA', wordBreak: 'break-all', display: 'block' }}>
                    {generatedLink}
                  </code>
                  <button
                    onClick={copyLink}
                    style={{ flexShrink: 0, padding: '10px 16px', background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(26,86,219,0.1)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(26,86,219,0.3)'}`, borderRadius: '8px', color: copied ? '#6EE7B7' : '#60A5FA', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {copied ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#4D6A8A', marginTop: '10px' }}>
                  Envie este link diretamente no WhatsApp do cliente.
                </p>
              </div>
            )}
          </div>

          {/* Right — Proposals list */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Propostas Recentes</h2>
              <p style={{ fontSize: '0.8rem', color: '#8BA8CC', marginTop: '4px' }}>
                {proposals.length} proposta{proposals.length !== 1 ? 's' : ''} no total
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: '4px' }}>
              {proposals.length === 0 && (
                <div style={{ background: 'rgba(9,24,48,0.6)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#4D6A8A', fontSize: '0.85rem' }}>
                  Nenhuma proposta ainda. Crie a primeira!
                </div>
              )}

              {proposals.map((p) => {
                const si = STATUS_LABELS[p.status] ?? { label: p.status, color: '#8BA8CC' }
                const link = `${baseUrl}/p/${p.id}`
                return (
                  <div key={p.id} style={{ background: 'rgba(9,24,48,0.7)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: '12px', padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F0F6FF' }}>{p.nome_cliente}</div>
                        <div style={{ fontSize: '0.76rem', color: '#4D6A8A', marginTop: '2px' }}>AIT: {p.ait} · {p.tipo_infracao}</div>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: si.color, background: `${si.color}18`, border: `1px solid ${si.color}30`, borderRadius: '100px', padding: '3px 10px', letterSpacing: '0.04em' }}>
                        {si.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.76rem', color: '#4D6A8A' }}>
                        {fmtDate(p.created_at)} · PIX {fmt(p.valor_essencial_pix)}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => navigator.clipboard.writeText(link)} style={{ background: 'transparent', border: '1px solid rgba(26,86,219,0.2)', color: '#60A5FA', borderRadius: '6px', padding: '5px 10px', fontSize: '0.72rem', cursor: 'pointer' }}>
                          Copiar link
                        </button>
                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ background: 'transparent', border: '1px solid rgba(26,86,219,0.2)', color: '#60A5FA', borderRadius: '6px', padding: '5px 10px', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'none' }}>
                          Abrir
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
