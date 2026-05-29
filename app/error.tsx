'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
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
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#FCA5A5" strokeWidth="1.5" />
            <path d="M12 8v5M12 16v.5" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '12px' }}>
          Erro de configuração
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#8BA8CC', lineHeight: 1.7, marginBottom: '8px' }}>
          As variáveis de ambiente do Supabase não estão configuradas no painel da Vercel.
        </p>
        <p style={{ fontSize: '0.82rem', color: '#4D6A8A', lineHeight: 1.7, marginBottom: '28px' }}>
          Adicione <code style={{ color: '#60A5FA', background: 'rgba(26,86,219,0.1)', padding: '2px 6px', borderRadius: '4px' }}>NEXT_PUBLIC_SUPABASE_URL</code>,{' '}
          <code style={{ color: '#60A5FA', background: 'rgba(26,86,219,0.1)', padding: '2px 6px', borderRadius: '4px' }}>SUPABASE_SERVICE_KEY</code> e{' '}
          <code style={{ color: '#60A5FA', background: 'rgba(26,86,219,0.1)', padding: '2px 6px', borderRadius: '4px' }}>ADMIN_SECRET</code>{' '}
          em <strong style={{ color: '#F0F6FF' }}>Vercel → Settings → Environment Variables</strong>.
        </p>
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
