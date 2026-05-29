import { RevealWrapper } from './RevealWrapper'

const cards = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#60A5FA" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 2v6h6M9 13l2 2 4-4" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Documentação recebida',
    description: 'Validação documental inicial concluída.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#60A5FA" strokeWidth="1.5" />
        <path d="M21 21l-4.35-4.35" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 8v3l2 2" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Verificações técnicas iniciadas',
    description: 'Análise estrutural em andamento.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="#60A5FA" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Compatibilidade estratégica identificada',
    description: 'Padrões processuais compatíveis detectados.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#60A5FA" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="#60A5FA" strokeWidth="1.5" />
        <path d="M9 12l2 2 4-4" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Estrutura argumentativa validada',
    description: 'Linha estratégica preliminar definida.',
  },
]

export function StatusSection() {
  return (
    <section style={{ padding: '80px 24px', background: '#040C18' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <RevealWrapper>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge-blue" style={{ marginBottom: '16px' }}>Status da Análise</span>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#F0F6FF',
                letterSpacing: '-0.02em',
                marginTop: '12px',
              }}
            >
              Etapas concluídas na sua análise
            </h2>
          </div>
        </RevealWrapper>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {cards.map((card, i) => (
            <RevealWrapper key={i} delay={i * 100}>
              <div
                className="card-premium"
                style={{ padding: '28px 24px' }}
              >
                {/* Icon + check */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'rgba(26, 86, 219, 0.1)',
                      border: '1px solid rgba(26, 86, 219, 0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {card.icon}
                  </div>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L20 7" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F0F6FF', marginBottom: '8px', lineHeight: 1.3 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#8BA8CC', lineHeight: 1.55 }}>
                  {card.description}
                </p>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
