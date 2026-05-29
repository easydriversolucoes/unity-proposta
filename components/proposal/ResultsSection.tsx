import { RevealWrapper } from './RevealWrapper'

const stats = [
  { value: '24', label: 'Deferimentos nos últimos 30 dias', suffix: '' },
  { value: '3.800', label: 'Processos analisados', suffix: '+' },
  { value: '94', label: 'Taxa de êxito estratégico', suffix: '%' },
  { value: '11', label: 'Anos de atuação especializada', suffix: '+' },
]

export function ResultsSection() {
  return (
    <section
      style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, #040C18 0%, #060F1F 100%)',
        borderTop: '1px solid rgba(26, 86, 219, 0.1)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <RevealWrapper>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="badge-blue" style={{ marginBottom: '16px' }}>Central de Resultados</span>
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
              Resultados Estratégicos Recentes
            </h2>
            <p style={{ fontSize: '1rem', color: '#8BA8CC', maxWidth: '460px', margin: '0 auto', lineHeight: 1.65 }}>
              Monitoramento contínuo de padrões reais de deferimento.
            </p>
          </div>
        </RevealWrapper>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '48px',
          }}
        >
          {stats.map((stat, i) => (
            <RevealWrapper key={i} delay={i * 100}>
              <div
                className="card-premium"
                style={{ padding: '32px 24px', textAlign: 'center' }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    marginBottom: '8px',
                    background: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                  <span style={{ fontSize: '1.2rem' }}>{stat.suffix}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#8BA8CC', lineHeight: 1.5 }}>
                  {stat.label}
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>

        {/* Recent results mini-cards */}
        <RevealWrapper>
          <div
            style={{
              background: 'rgba(9, 24, 48, 0.6)',
              border: '1px solid rgba(26, 86, 219, 0.15)',
              borderRadius: '16px',
              padding: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            {[
              { status: 'Deferido', tipo: 'Lei Seca', data: 'Mai/2025', uf: 'SP' },
              { status: 'Deferido', tipo: 'Lei Seca', data: 'Mai/2025', uf: 'RJ' },
              { status: 'Deferido', tipo: 'Lei Seca', data: 'Abr/2025', uf: 'MG' },
              { status: 'Deferido', tipo: 'Lei Seca', data: 'Abr/2025', uf: 'PR' },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    flexShrink: 0,
                    boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6EE7B7' }}>{r.status}</div>
                  <div style={{ fontSize: '0.74rem', color: '#8BA8CC' }}>
                    {r.tipo} · {r.uf} · {r.data}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RevealWrapper>
      </div>
    </section>
  )
}
