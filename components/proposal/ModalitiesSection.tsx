import { RevealWrapper } from './RevealWrapper'

interface ModalitiesSectionProps {
  valorEssencial: number
  valorGestao: number
  linkPagamentoEssencial: string | null
  linkPagamentoGestao: string | null
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
  'Tudo da modalidade anterior',
  'Monitoramento contínuo do processo',
  'Gestão operacional de prazos',
  'Alertas proativos',
  'Aviso antecipado de movimentações',
  'Relatórios periódicos',
  'Acompanhamento do histórico processual',
  'Centralização completa do andamento',
]

function CheckIcon({ color = '#60A5FA' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ModalitiesSection({
  valorEssencial,
  valorGestao,
  linkPagamentoEssencial,
  linkPagamentoGestao,
}: ModalitiesSectionProps) {
  return (
    <section style={{ padding: '80px 24px', background: '#040C18' }} id="modalidades">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
              Escolha a estrutura ideal para o seu caso
            </h2>
            <p style={{ fontSize: '1rem', color: '#8BA8CC', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
              Ambas as modalidades incluem atuação técnica especializada. A diferença está no nível de acompanhamento.
            </p>
          </div>
        </RevealWrapper>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Card 1 — Defesa Estratégica */}
          <RevealWrapper delay={0}>
            <div
              className="card-premium"
              style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span className="badge-blue" style={{ marginBottom: '12px' }}>Modalidade 1</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '8px' }}>
                  Defesa Estratégica
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#8BA8CC', lineHeight: 1.6 }}>
                  Elaboração técnica completa da defesa administrativa.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {essencialItems.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckIcon />
                    <span style={{ fontSize: '0.88rem', color: '#D0E4FF' }}>{item}</span>
                  </li>
                ))}
              </ul>

              <hr className="separator" />

              <p style={{ fontSize: '0.78rem', color: '#4D6A8A', lineHeight: 1.65, marginBottom: '28px', fontStyle: 'italic' }}>
                O acompanhamento do andamento processual permanece sob responsabilidade do cliente através do portal do órgão.
              </p>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#4D6A8A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Investimento
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F0F6FF' }}>
                    {fmt(valorEssencial)}
                  </div>
                </div>

                <a
                  href={linkPagamentoEssencial || '#assinar'}
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Prosseguir com esta modalidade
                </a>
              </div>
            </div>
          </RevealWrapper>

          {/* Card 2 — Gestão Estratégica Completa */}
          <RevealWrapper delay={150}>
            <div
              style={{
                background: 'rgba(9, 24, 48, 0.9)',
                border: '1px solid rgba(26, 86, 219, 0.5)',
                borderRadius: '20px',
                backdropFilter: 'blur(12px)',
                padding: '40px 36px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 0 0 1px rgba(26,86,219,0.3), 0 20px 60px rgba(26,86,219,0.15), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
              className="animate-glow-pulse"
            >
              {/* "Mais escolhido" badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #C4922A 0%, #E8B84B 100%)',
                  borderRadius: '100px',
                  padding: '6px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 16px rgba(196,146,42,0.5)',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white" />
                </svg>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'white', letterSpacing: '0.08em' }}>
                  Mais escolhido
                </span>
              </div>

              <div style={{ marginBottom: '24px', marginTop: '8px' }}>
                <span className="badge-gold" style={{ marginBottom: '12px' }}>Modalidade 2</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '8px' }}>
                  Gestão Estratégica Completa
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#8BA8CC', lineHeight: 1.6 }}>
                  Para quem deseja tranquilidade e acompanhamento integral.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {gestaoItems.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckIcon color={i === 0 ? '#E8B84B' : '#60A5FA'} />
                    <span style={{ fontSize: '0.88rem', color: '#D0E4FF', fontWeight: i === 0 ? 600 : 400 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Premium block */}
              <div
                style={{
                  background: 'rgba(26, 86, 219, 0.08)',
                  border: '1px solid rgba(26, 86, 219, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '28px',
                  fontSize: '0.84rem',
                  color: '#8BA8CC',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                }}
              >
                "Você não precisa acompanhar portais, acessar sistemas ou verificar movimentações.
                Nossa equipe realiza o monitoramento estratégico contínuo para você."
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#4D6A8A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Investimento
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F0F6FF' }}>
                    {fmt(valorGestao)}
                  </div>
                </div>

                <a
                  href={linkPagamentoGestao || '#assinar'}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', padding: '16px 28px' }}
                >
                  Iniciar acompanhamento completo
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  )
}
