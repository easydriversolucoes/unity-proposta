import { RevealWrapper } from './RevealWrapper'

const risks = [
  {
    icon: '🚫',
    title: 'Suspensão da CNH por 12 meses',
    description: 'Impedimento legal de conduzir veículos durante o período de suspensão.',
  },
  {
    icon: '💸',
    title: 'Multa elevada',
    description: 'Autuação com valor acima de R$ 2.934 para infrações enquadradas em Lei Seca.',
  },
  {
    icon: '⚠️',
    title: 'Risco de efeito cascata para cassação',
    description: 'Reincidência pode levar à cassação definitiva da habilitação.',
  },
  {
    icon: '🛑',
    title: 'Restrição do direito de dirigir',
    description: 'Limitação imediata ao exercício de atividades que dependem da CNH.',
  },
  {
    icon: '💼',
    title: 'Impacto profissional',
    description: 'Comprometimento de atividades profissionais vinculadas à condução de veículos.',
  },
  {
    icon: '📈',
    title: 'Aumento de custo com seguro',
    description: 'Registro de infração pode impactar diretamente o perfil de risco e o valor do seguro.',
  },
]

export function RisksSection() {
  return (
    <section
      style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, #040C18 0%, #060F1F 50%, #040C18 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(26,86,219,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        {/* Header */}
        <RevealWrapper>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="badge-blue" style={{ marginBottom: '16px' }}>Proteção Estratégica</span>
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
              O que está sendo protegido no seu caso
            </h2>
            <p style={{ fontSize: '1rem', color: '#8BA8CC', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
              Nossa atuação estratégica visa preservar seus direitos e evitar as consequências abaixo.
            </p>
          </div>
        </RevealWrapper>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {risks.map((risk, i) => (
            <RevealWrapper key={i} delay={i * 80}>
              <div className="risk-card">
                {/* Left: shield */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    flexShrink: 0,
                    background: 'rgba(26, 86, 219, 0.08)',
                    border: '1px solid rgba(26, 86, 219, 0.2)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                  }}
                >
                  {risk.icon}
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                    }}
                  >
                    {/* Strikethrough indicator */}
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F0F6FF', lineHeight: 1.3 }}>
                      {risk.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#8BA8CC', lineHeight: 1.6 }}>
                    {risk.description}
                  </p>
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
