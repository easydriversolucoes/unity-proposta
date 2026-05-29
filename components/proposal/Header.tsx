import Image from 'next/image'

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'

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
        {/* Logo — coloque seu arquivo em /public/logo.png */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image
            src="/logo.png"
            alt="Unity Multas"
            width={140}
            height={40}
            style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
            priority
          />
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <span
            style={{ fontSize: '0.82rem', color: '#8BA8CC', cursor: 'default', letterSpacing: '0.02em' }}
          >
            Proposta Estratégica
          </span>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent('Olá! Tenho dúvidas sobre minha proposta.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.82rem', borderRadius: '8px' }}
          >
            Tenho dúvidas
          </a>
        </nav>
      </div>
    </header>
  )
}
