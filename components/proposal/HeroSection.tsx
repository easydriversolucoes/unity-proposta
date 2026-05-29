import Image from 'next/image'
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '64px',
            alignItems: 'center',
          }}
        >
          {/* Left */}
          <div>
            {/* Tag */}
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
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.15,
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

            {/* Client badge */}
            <div
              className="animate-fade-up delay-100"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(26, 86, 219, 0.08)',
                border: '1px solid rgba(26, 86, 219, 0.2)',
                borderRadius: '8px',
                padding: '8px 16px',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#4D6A8A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Cliente
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#F0F6FF' }}>{clientName}</span>
              <span style={{ fontSize: '0.78rem', color: '#4D6A8A', marginLeft: '8px', letterSpacing: '0.04em' }}>
                AIT {ait}
              </span>
            </div>

            {/* Subtitle */}
            <p
              className="animate-fade-up delay-200"
              style={{
                fontSize: '1.05rem',
                color: '#8BA8CC',
                lineHeight: 1.7,
                marginBottom: '40px',
                maxWidth: '560px',
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
                maxWidth: '520px',
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
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#C4922A',
                    marginBottom: '4px',
                  }}
                >
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

          {/* Right — photo */}
          <div className="animate-float" style={{ position: 'relative' }}>
            {/* Gold badge */}
            <div
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                zIndex: 2,
                background: 'linear-gradient(135deg, #C4922A 0%, #E8B84B 100%)',
                borderRadius: '100px',
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 20px rgba(196, 146, 42, 0.4)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="white" />
              </svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>
                +11 anos de experiência
              </span>
            </div>

            {/* Photo — coloque sua foto em /public/lidiane.jpg */}
            <div
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(26, 86, 219, 0.25)',
                background: 'linear-gradient(160deg, #0A1E3D 0%, #040C18 100%)',
                aspectRatio: '3/4',
                position: 'relative',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(26,86,219,0.15)',
              }}
            >
              <Image
                src="/lidiane.jpg"
                alt="Lidiane Azevedo"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                priority
              />

              {/* Name card at bottom */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  background: 'rgba(4, 12, 24, 0.92)',
                  backdropFilter: 'blur(12px)',
                  borderTop: '1px solid rgba(26,86,219,0.2)',
                  padding: '18px 24px',
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F0F6FF' }}>Lidiane Azevedo</div>
                <div style={{ fontSize: '0.78rem', color: '#8BA8CC', marginTop: '2px' }}>
                  Ex-julgadora DETRAN SP · Credenciada IBDAT
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  <span className="badge-blue" style={{ fontSize: '0.65rem' }}>Lei Seca</span>
                  <span className="badge-blue" style={{ fontSize: '0.65rem' }}>Recursos Administrativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
