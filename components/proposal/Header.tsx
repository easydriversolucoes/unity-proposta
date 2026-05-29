export function Header() {
  return (
    <header
      style={{
        background: 'rgba(4, 12, 24, 0.95)',
        borderBottom: '1px solid rgba(26, 86, 219, 0.15)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(26, 86, 219, 0.5)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#F0F6FF',
                lineHeight: 1,
              }}
            >
              Unity Multas
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#4D6A8A',
                lineHeight: 1,
                marginTop: '2px',
              }}
            >
              Lei Seca
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span
            style={{ fontSize: '0.82rem', color: '#8BA8CC', cursor: 'default', letterSpacing: '0.02em' }}
          >
            Proposta Estratégica
          </span>
          <a
            href="https://wa.me/5500000000000"
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.82rem', borderRadius: '8px' }}
          >
            Suporte Estratégico
          </a>
        </nav>
      </div>
    </header>
  )
}
