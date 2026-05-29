import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#040C18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            background: 'rgba(26,86,219,0.1)',
            border: '1px solid rgba(26,86,219,0.3)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#60A5FA" strokeWidth="1.5" />
            <path d="M12 8v5M12 16v.5" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '12px' }}>
          Proposta não encontrada
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#8BA8CC', lineHeight: 1.7, marginBottom: '28px' }}>
          Este link pode ter expirado ou ser inválido. Entre em contato com nossa equipe para obter um novo acesso.
        </p>
        <a
          href="https://wa.me/5500000000000"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Falar com a equipe
        </a>
      </div>
    </div>
  )
}
