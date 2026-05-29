'use client'
import { useState, useTransition } from 'react'
import { acceptProposalAction } from '@/app/p/[id]/actions'

interface SignatureSectionProps {
  proposalId: string
  clientName: string
  linkPagamentoEssencial: string | null
  linkPagamentoGestao: string | null
  valorEssencial: number
  valorGestao: number
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export function SignatureSection({
  proposalId,
  clientName,
  linkPagamentoEssencial,
  linkPagamentoGestao,
  valorEssencial,
  valorGestao,
}: SignatureSectionProps) {
  const [agreed, setAgreed] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'essencial' | 'gestao'>('gestao')
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    if (!agreed) return
    startTransition(async () => {
      await acceptProposalAction(proposalId, selectedPlan)
      setDone(true)
      const link = selectedPlan === 'gestao' ? linkPagamentoGestao : linkPagamentoEssencial
      if (link) {
        setTimeout(() => window.open(link, '_blank'), 800)
      }
    })
  }

  return (
    <section style={{ padding: '80px 24px 100px', background: '#040C18' }} id="assinar">
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge-blue" style={{ marginBottom: '16px' }}>Próximo passo</span>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2rem)',
              fontWeight: 800,
              color: '#F0F6FF',
              letterSpacing: '-0.02em',
              marginTop: '12px',
              marginBottom: '16px',
            }}
          >
            Confirmação da proposta
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#8BA8CC', lineHeight: 1.7 }}>
            Após a confirmação, nossa equipe iniciará imediatamente a estruturação técnica do processo.
          </p>
        </div>

        {/* Plan selector */}
        {!done && (
          <div
            style={{
              background: 'rgba(9, 24, 48, 0.85)',
              border: '1px solid rgba(26, 86, 219, 0.2)',
              borderRadius: '20px',
              padding: '36px',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Plan selection */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '0.8rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Modalidade selecionada
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'essencial' as const, label: 'Defesa Estratégica', price: valorEssencial },
                  { value: 'gestao' as const, label: 'Gestão Estratégica Completa', price: valorGestao, recommended: true },
                ].map((plan) => (
                  <button
                    key={plan.value}
                    onClick={() => setSelectedPlan(plan.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 20px',
                      background: selectedPlan === plan.value
                        ? 'rgba(26, 86, 219, 0.1)'
                        : 'rgba(26, 86, 219, 0.03)',
                      border: `1px solid ${selectedPlan === plan.value ? 'rgba(26,86,219,0.5)' : 'rgba(26,86,219,0.15)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: `2px solid ${selectedPlan === plan.value ? '#1A56DB' : 'rgba(26,86,219,0.3)'}`,
                        background: selectedPlan === plan.value ? '#1A56DB' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {selectedPlan === plan.value && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#F0F6FF' }}>
                          {plan.label}
                        </span>
                        {plan.recommended && (
                          <span className="badge-gold" style={{ fontSize: '0.62rem' }}>Recomendado</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#F0F6FF', whiteSpace: 'nowrap' }}>
                      {fmt(plan.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div
              style={{
                background: 'rgba(26, 86, 219, 0.04)',
                border: '1px solid rgba(26, 86, 219, 0.12)',
                borderRadius: '10px',
                padding: '16px 18px',
                fontSize: '0.8rem',
                color: '#8BA8CC',
                lineHeight: 1.7,
                marginBottom: '24px',
              }}
            >
              A contratação confirma ciência sobre a modalidade escolhida, valores apresentados e escopo
              de serviços descrito nesta proposta. O início da prestação de serviços ocorre após
              confirmação do pagamento.
            </div>

            {/* Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                marginBottom: '28px',
              }}
            >
              <div
                onClick={() => setAgreed(!agreed)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '5px',
                  border: `2px solid ${agreed ? '#1A56DB' : 'rgba(26,86,219,0.3)'}`,
                  background: agreed ? '#1A56DB' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
              >
                {agreed && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#8BA8CC', lineHeight: 1.6 }}>
                Li e compreendi os termos desta proposta. Confirmo que sou{' '}
                <strong style={{ color: '#F0F6FF' }}>{clientName}</strong> e autorizo o
                início da atuação estratégica conforme modalidade selecionada.
              </span>
            </label>

            {/* CTA button */}
            <button
              onClick={handleConfirm}
              disabled={!agreed || isPending}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '0.95rem',
                opacity: agreed ? 1 : 0.45,
                cursor: agreed ? 'pointer' : 'not-allowed',
                justifyContent: 'center',
              }}
            >
              {isPending ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="1.5" />
                  </svg>
                  Confirmar contratação
                </>
              )}
            </button>
          </div>
        )}

        {/* Success state */}
        {done && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '48px 36px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '10px' }}>
              Proposta confirmada!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#8BA8CC', lineHeight: 1.65 }}>
              Nossa equipe já foi notificada e iniciará a estruturação técnica do seu processo em breve.
              Você será redirecionado para o pagamento.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  )
}
