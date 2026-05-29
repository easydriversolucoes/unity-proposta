'use client'
import { useState } from 'react'
import { RevealWrapper } from './RevealWrapper'

interface ModalitiesSectionProps {
  valorEssencialPix: number
  valorEssencialCartao: number
  parcelasEssencial: number
  valorGestaoPix: number
  valorGestaoCartao: number
  parcelasGestao: number
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const essencialItems = [
  'Análise técnica do processo',
  'Estruturação estratégica da defesa',
  'Elaboração dos recursos administrativos',
  'Protocolo administrativo',
  'Orientação processual',
]

const gestaoItems = [
  'Monitoramento contínuo do processo',
  'Gestão operacional de prazos',
  'Alertas proativos de movimentações',
  'Relatórios periódicos do andamento',
  'Acompanhamento do histórico processual',
  'Centralização completa — você não precisa acessar portais',
]

function CheckIcon({ color = '#60A5FA' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PriceBlock({ pix, cartao, parcelas }: { pix: number; cartao: number; parcelas: number }) {
  const valorParcela = cartao / parcelas
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.65rem', color: '#6EE7B7', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Via PIX</div>
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F0F6FF' }}>{fmt(pix)}</div>
      </div>
      <div style={{ background: 'rgba(26,86,219,0.06)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '10px', padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.65rem', color: '#60A5FA', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Via Cartão</div>
        {parcelas > 1 ? (
          <>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F0F6FF' }}>{parcelas}x de {fmt(valorParcela)}</div>
            <div style={{ fontSize: '0.68rem', color: '#4D6A8A', marginTop: '2px' }}>Total: {fmt(cartao)}</div>
          </>
        ) : (
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F0F6FF' }}>{fmt(cartao)}</div>
        )}
      </div>
    </div>
  )
}

export function ModalitiesSection({
  valorEssencialPix,
  valorEssencialCartao,
  parcelasEssencial,
  valorGestaoPix,
  valorGestaoCartao,
  parcelasGestao,
}: ModalitiesSectionProps) {
  const [gestaoVisible, setGestaoVisible] = useState(false)

  return (
    <section style={{ padding: '80px 24px', background: '#040C18' }} id="modalidades">
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <RevealWrapper>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="badge-gold" style={{ marginBottom: '16px' }}>Modalidades de Atendimento</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#F0F6FF', letterSpacing: '-0.02em', marginTop: '12px', marginBottom: '16px' }}>
              O que está incluído na sua proposta
            </h2>
          </div>
        </RevealWrapper>

        {/* ── Card Principal: Defesa Estratégica ── */}
        <RevealWrapper>
          <div
            style={{
              background: 'rgba(9, 24, 48, 0.9)',
              border: '1px solid rgba(26, 86, 219, 0.45)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 0 0 1px rgba(26,86,219,0.2), 0 16px 48px rgba(26,86,219,0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ background: 'rgba(26,86,219,0.15)', border: '1px solid rgba(26,86,219,0.35)', color: '#60A5FA', borderRadius: '100px', padding: '5px 14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Serviço Principal
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '100px', padding: '4px 12px', fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 600 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                Incluso nesta proposta
              </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '8px' }}>Defesa Estratégica</h3>
            <p style={{ fontSize: '0.9rem', color: '#8BA8CC', lineHeight: 1.6, marginBottom: '28px' }}>
              Elaboração técnica completa da defesa administrativa — atuação baseada no método proprietário{' '}
              <strong style={{ color: '#C4922A' }}>Código do Deferimento™</strong>.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {essencialItems.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckIcon />
                  <span style={{ fontSize: '0.9rem', color: '#D0E4FF' }}>{item}</span>
                </li>
              ))}
            </ul>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(26,86,219,0.15)', margin: '0 0 24px' }} />
            <p style={{ fontSize: '0.78rem', color: '#4D6A8A', fontStyle: 'italic', lineHeight: 1.65, marginBottom: '28px' }}>
              O acompanhamento do andamento processual após a elaboração da defesa permanece sob responsabilidade do cliente através do portal do órgão.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.72rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>Investimento</div>
              <PriceBlock pix={valorEssencialPix} cartao={valorEssencialCartao} parcelas={parcelasEssencial} />
            </div>

            <a href="#assinar" className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '15px 28px' }}>
              Contratar Defesa Estratégica
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </RevealWrapper>

        {/* ── Trigger do upsell ── */}
        <RevealWrapper delay={100}>
          <div style={{ marginTop: '28px' }}>
            {!gestaoVisible ? (
              <button
                onClick={() => setGestaoVisible(true)}
                style={{
                  width: '100%',
                  background: 'rgba(196, 146, 42, 0.05)',
                  border: '1px dashed rgba(196, 146, 42, 0.35)',
                  borderRadius: '14px',
                  padding: '20px 28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(196,146,42,0.09)'
                  e.currentTarget.style.borderColor = 'rgba(196,146,42,0.55)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(196,146,42,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(196,146,42,0.35)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
                  <div style={{ width: '40px', height: '40px', flexShrink: 0, background: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#E8B84B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#E8B84B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E8B84B', marginBottom: '2px' }}>
                      Precisa da gestão das notificações do processo?
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8BA8CC' }}>
                      Contrate também a Gestão de Notificações — monitoramento contínuo para você.
                    </div>
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.3)', borderRadius: '100px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#E8B84B', whiteSpace: 'nowrap' }}>
                  Ver detalhes
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#E8B84B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            ) : (
              /* ── Card Upsell: Gestão de Notificações ── */
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(196,146,42,0.07) 0%, rgba(120,80,10,0.06) 100%)',
                  border: '1px solid rgba(196, 146, 42, 0.4)',
                  borderRadius: '20px',
                  padding: '36px 40px',
                  boxShadow: '0 0 0 1px rgba(196,146,42,0.1), 0 12px 40px rgba(196,146,42,0.08)',
                  animation: 'fade-up 0.35s ease forwards',
                }}
              >
                {/* Header do card */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(196,146,42,0.15)', border: '1px solid rgba(196,146,42,0.35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#E8B84B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#E8B84B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span style={{ background: 'rgba(196,146,42,0.12)', border: '1px solid rgba(196,146,42,0.3)', color: '#E8B84B', borderRadius: '100px', padding: '4px 12px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Adicional Opcional
                    </span>
                  </div>
                  <button
                    onClick={() => setGestaoVisible(false)}
                    style={{ background: 'transparent', border: 'none', color: '#4D6A8A', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Fechar
                  </button>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '6px' }}>
                  + Gestão de Notificações
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#8BA8CC', lineHeight: 1.65, marginBottom: '24px' }}>
                  Para quem prefere não acessar portais ou acompanhar movimentações. Nossa equipe cuida de tudo para você.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {gestaoItems.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckIcon color="#E8B84B" />
                      <span style={{ fontSize: '0.88rem', color: '#C8A86A' }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#8A6A30', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                    Investimento adicional
                  </div>
                  {/* PriceBlock com cores douradas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: 'rgba(196,146,42,0.08)', border: '1px solid rgba(196,146,42,0.25)', borderRadius: '10px', padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#E8B84B', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Via PIX</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F0F6FF' }}>{fmt(valorGestaoPix)}</div>
                    </div>
                    <div style={{ background: 'rgba(196,146,42,0.08)', border: '1px solid rgba(196,146,42,0.25)', borderRadius: '10px', padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: '#E8B84B', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Via Cartão</div>
                      {parcelasGestao > 1 ? (
                        <>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F0F6FF' }}>{parcelasGestao}x de {fmt(valorGestaoCartao / parcelasGestao)}</div>
                          <div style={{ fontSize: '0.68rem', color: '#8A6A30', marginTop: '2px' }}>Total: {fmt(valorGestaoCartao)}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F0F6FF' }}>{fmt(valorGestaoCartao)}</div>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href="#assinar"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', padding: '15px 28px',
                    background: 'linear-gradient(135deg, rgba(196,146,42,0.25) 0%, rgba(120,80,10,0.2) 100%)',
                    border: '1px solid rgba(196,146,42,0.5)',
                    borderRadius: '10px',
                    color: '#E8B84B',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,146,42,0.35) 0%, rgba(120,80,10,0.3) 100%)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,146,42,0.25) 0%, rgba(120,80,10,0.2) 100%)' }}
                >
                  Contratar com Gestão de Notificações
                </a>
              </div>
            )}
          </div>
        </RevealWrapper>

      </div>
    </section>
  )
}
