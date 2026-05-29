import { CountdownBadge } from './CountdownBadge'

interface HeroSectionProps {
  clientName: string
  ait: string
  tipoInfracao: string
  prazoValidade?: string | null
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(
    new Date(dateString + 'T12:00:00')
  )
}

export function HeroSection({ clientName, ait, tipoInfracao, prazoValidade }: HeroSectionProps) {
  return (
    <section
      className="bg-grid"
      style={{
        background: 'linear-gradient(180deg, #060F1F 0%, #040C18 100%)',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(26,86,219,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
        {/* Tags */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          <span className="badge-green">
            <span style={{ marginRight: '6px' }}>●</span>
            Análise Estratégica Concluída
          </span>
          {prazoValidade && (
            <>
              <span className="badge-blue">Válido até {formatDate(prazoValidade)}</span>
              <CountdownBadge prazoValidade={prazoValidade} />
            </>
          )}
        </div>

        {/* Title */}
        <h1
          className="animate-fade-up"
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.12,
            color: '#F0F6FF',
            marginBottom: '20px',
            letterSpacing: '-0.02em',
          }}
        >
          Evita multa e{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            suspensão da CNH
          </span>
        </h1>

        {/* Client name + AIT — prominent */}
        <div
          className="animate-fade-up delay-100"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '28px',
            padding: '20px 24px',
            background: 'rgba(26, 86, 219, 0.06)',
            border: '1px solid rgba(26, 86, 219, 0.2)',
            borderRadius: '14px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: '#4D6A8A', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              Proposta para
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F0F6FF', letterSpacing: '-0.01em', lineHeight: 1 }}>
              {clientName}
            </div>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'rgba(26,86,219,0.25)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#4D6A8A', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              AIT
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.08em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {ait}
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="animate-fade-up delay-200"
          style={{
            fontSize: '1.05rem',
            color: '#8BA8CC',
            lineHeight: 1.7,
            marginBottom: '40px',
          }}
        >
          Com base nos documentos e informações enviadas, nossa equipe identificou viabilidade técnica
          para atuação estratégica no seu processo administrativo. Infração e suspensão:{' '}
          <strong style={{ color: '#60A5FA' }}>{tipoInfracao}</strong>.
        </p>

        {/* Method block */}
        <div
          className="animate-fade-up delay-300"
          style={{
            background: 'rgba(196, 146, 42, 0.06)',
            border: '1px solid rgba(196, 146, 42, 0.25)',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              flexShrink: 0,
              background: 'rgba(196, 146, 42, 0.15)',
              border: '1px solid rgba(196, 146, 42, 0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#E8B84B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#E8B84B" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C4922A', marginBottom: '4px' }}>
              Método Proprietário
            </div>
            <div style={{ fontSize: '0.92rem', color: '#F0F6FF', fontWeight: 600, lineHeight: 1.4 }}>
              Aplicação do Código do Deferimento™
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8BA8CC', marginTop: '4px' }}>
              Baseado na visão do julgador.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
