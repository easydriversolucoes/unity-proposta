export function Footer() {
  return (
    <footer
      style={{
        background: '#030A14',
        borderTop: '1px solid rgba(26, 86, 219, 0.12)',
        padding: '48px 24px 32px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '32px',
            alignItems: 'start',
            marginBottom: '40px',
          }}
        >
          {/* Logo & description */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
                  borderRadius: '7px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#F0F6FF',
                }}
              >
                Unity Multas
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#4D6A8A', lineHeight: 1.7, maxWidth: '360px' }}>
              Especialistas em defesa administrativa de multas e recursos na Lei Seca.
              Atuação técnica e estratégica com mais de 11 anos de experiência.
            </p>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: '0.72rem', color: '#4D6A8A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Suporte
            </div>
            <div style={{ fontSize: '0.82rem', color: '#8BA8CC', marginBottom: '8px' }}>
              Atendimento especializado
            </div>
            <a
              href="https://wa.me/5500000000000"
              style={{ fontSize: '0.82rem', color: '#60A5FA', textDecoration: 'none' }}
            >
              WhatsApp estratégico
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(26, 86, 219, 0.1)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#2D4A6A' }}>
            © {new Date().getFullYear()} Unity Multas — Lei Seca. Todos os direitos reservados.
          </span>
          <span style={{ fontSize: '0.75rem', color: '#2D4A6A' }}>
            Proposta estratégica confidencial · Uso exclusivo do destinatário
          </span>
        </div>
      </div>
    </footer>
  )
}
