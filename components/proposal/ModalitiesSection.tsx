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

function PriceBlock({
  pix,
  cartao,
  parcelas,
}: {
  pix: number
  cartao: number
  parcelas: number
}) {
  const valorParcela = cartao / parcelas

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      {/* PIX */}
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
          padding: '14px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.65rem', color: '#6EE7B7', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Via PIX
        </div>
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F0F6FF' }}>{fmt(pix)}</div>
      </div>

      {/* Cartão */}
      <div
        style={{
          background: 'rgba(26, 86, 219, 0.06)',
          border: '1px solid rgba(26, 86, 219, 0.2)',
          borderRadius: '10px',
          padding: '14px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.65rem', color: '#60A5FA', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Via Cartão
        </div>
        {parcelas > 1 ? (
          <>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F0F6FF' }}>
              {parcelas}x de {fmt(valorParcela)}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#4D6A8A', marginTop: '2px' }}>
              Total: {fmt(cartao)}
            </div>
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
  return (
    <section style={{ padding: '80px 24px', background: '#040C18' }} id="modalidades">
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <RevealWrapper>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="badge-gold" style={{ marginBottom: '16px' }}>Modalidades de Atendimento</span>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#F0F6FF',
                letterSpacing: '-0.02em',
                marginTop: '12px',
                marginBottom: '16px',
              }}
            >
              O que está incluído na sua proposta
            </h2>
            <p style={{ fontSize: '1rem', color: '#8BA8CC', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
              A atuação principal é a Defesa Estratégica. A Gestão de Notificações é um serviço adicional para quem prefere praticidade.
            </p>
          </div>
        </RevealWrapper>

        {/* ── Card 1: Defesa Estratégica ── */}
        <RevealWrapper>
          <div
            style={{
              background: 'rgba(9, 24, 48, 0.9)',
              border: '1px solid rgba(26, 86, 219, 0.45)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: '0 0 0 1px rgba(26,86,219,0.2), 0 16px 48px rgba(26,86,219,0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span
                style={{
                  background: 'rgba(26,86,219,0.15)', border: '1px solid rgba(26,86,219,0.35)',
                  color: '#60A5FA', borderRadius: '100px', padding: '5px 14px',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}
              >
                Serviço Principal
              </span>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '100px', padding: '4px 12px',
                  fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 600,
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                Incluso nesta proposta
              </div>
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '8px' }}>
              Defesa Estratégica
            </h3>
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
              <div style={{ fontSize: '0.72rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                Investimento
              </div>
              <PriceBlock pix={valorEssencialPix} cartao={valorEssencialCartao} parcelas={parcelasEssencial} />
            </div>

            <a
              href="#assinar"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '15px 28px' }}
            >
              Contratar Defesa Estratégica
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </RevealWrapper>

        {/* ── Separador ── */}
        <RevealWrapper delay={100}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0', padding: '0 8px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(26,86,219,0.12)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#4D6A8A', whiteSpace: 'nowrap' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#4D6A8A" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Adicional opcional — pode ser contratado junto ou separadamente
            </div>
            <div style={{ flex: 1, height: '1px', background: 'rgba(26,86,219,0.12)' }} />
          </div>
        </RevealWrapper>

        {/* ── Card 2: Gestão de Notificações ── */}
        <RevealWrapper delay={150}>
          <div
            style={{
              background: 'rgba(9, 24, 48, 0.6)',
              border: '1px solid rgba(26, 86, 219, 0.18)',
              borderRadius: '16px',
              padding: '32px 40px',
              marginTop: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <span
                style={{
                  background: 'rgba(196,146,42,0.1)', border: '1px solid rgba(196,146,42,0.25)',
                  color: '#E8B84B', borderRadius: '100px', padding: '4px 12px',
                  fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}
              >
                Adicional Opcional
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#D0E4FF', marginBottom: '6px' }}>
              + Gestão de Notificações
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#8BA8CC', lineHeight: 1.6, marginBottom: '24px' }}>
              Para quem prefere não acessar portais ou acompanhar movimentações. Nossa equipe cuida de tudo.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gestaoItems.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckIcon color="#E8B84B" />
                  <span style={{ fontSize: '0.86rem', color: '#8BA8CC' }}>{item}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.72rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
                Investimento adicional
              </div>
              <PriceBlock pix={valorGestaoPix} cartao={valorGestaoCartao} parcelas={parcelasGestao} />
            </div>

            <a
              href="#assinar"
              className="btn-ghost"
              style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
            >
              Contratar com Gestão de Notificações
            </a>
          </div>
        </RevealWrapper>

      </div>
    </section>
  )
}
