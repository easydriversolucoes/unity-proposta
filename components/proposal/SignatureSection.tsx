'use client'
import { useState, useTransition } from 'react'
import { acceptProposalAction } from '@/app/p/[id]/actions'

interface SignatureSectionProps {
  proposalId: string
  clientName: string
  ait: string
  valorEssencialPix: number
  valorEssencialCartao: number
  parcelasEssencial: number
  valorGestaoPix: number
  valorGestaoCartao: number
  parcelasGestao: number
  mostrarGestao: boolean
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'

type Plano = 'essencial' | 'essencial+gestao'
type Pgto  = 'pix' | 'cartao'

export function SignatureSection({
  proposalId,
  clientName,
  ait,
  valorEssencialPix,
  valorEssencialCartao,
  parcelasEssencial,
  valorGestaoPix,
  valorGestaoCartao,
  parcelasGestao,
  mostrarGestao,
}: SignatureSectionProps) {
  const [plano, setPlano]   = useState<Plano>('essencial')
  const [pgto, setPgto]     = useState<Pgto>('pix')
  const [agreed, setAgreed] = useState(false)
  const [done, setDone]     = useState(false)
  const [isPending, startTransition] = useTransition()

  // Calcula total e parcelas conforme seleção
  const totalPix = plano === 'essencial'
    ? valorEssencialPix
    : valorEssencialPix + valorGestaoPix

  const totalCartao = plano === 'essencial'
    ? valorEssencialCartao
    : valorEssencialCartao + valorGestaoCartao

  // Parcelas: se plano combinado, usa o maior número de parcelas entre os dois
  const parcelas = plano === 'essencial'
    ? parcelasEssencial
    : Math.max(parcelasEssencial, parcelasGestao)

  const total        = pgto === 'pix' ? totalPix : totalCartao
  const valorParcela = totalCartao / parcelas

  function handleConfirm() {
    if (!agreed) return
    const key = `${plano}-${pgto}`
    startTransition(async () => {
      await acceptProposalAction(proposalId, key)
      setDone(true)
    })
  }

  // Label do total na linha de resumo
  function totalLabel() {
    if (pgto === 'pix') return fmt(totalPix)
    if (parcelas > 1) return `${parcelas}x de ${fmt(valorParcela)} (total ${fmt(totalCartao)})`
    return fmt(totalCartao)
  }

  return (
    <section style={{ padding: '80px 24px 100px', background: '#040C18' }} id="assinar">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge-blue" style={{ marginBottom: '16px' }}>Próximo passo</span>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 1.9rem)',
              fontWeight: 800,
              color: '#F0F6FF',
              letterSpacing: '-0.02em',
              marginTop: '12px',
              marginBottom: '14px',
            }}
          >
            Confirmação da proposta
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#8BA8CC', lineHeight: 1.7 }}>
            Após a confirmação, nossa equipe iniciará imediatamente a estruturação técnica do processo e enviará o contrato e as instruções de pagamento.
          </p>
        </div>

        {!done ? (
          <div
            style={{
              background: 'rgba(9, 24, 48, 0.85)',
              border: '1px solid rgba(26, 86, 219, 0.2)',
              borderRadius: '20px',
              padding: '36px',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Plan selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.72rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
                Modalidade
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {([
                  { value: 'essencial' as Plano, label: 'Defesa Estratégica', sub: 'Serviço principal' },
                  ...(mostrarGestao ? [{ value: 'essencial+gestao' as Plano, label: 'Defesa Estratégica + Gestão de Notificações', sub: 'Serviço principal + adicional' }] : []),
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPlano(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px',
                      background: plano === opt.value ? 'rgba(26,86,219,0.1)' : 'rgba(26,86,219,0.03)',
                      border: `1px solid ${plano === opt.value ? 'rgba(26,86,219,0.45)' : 'rgba(26,86,219,0.12)'}`,
                      borderRadius: '10px', cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${plano === opt.value ? '#1A56DB' : 'rgba(26,86,219,0.3)'}`,
                        background: plano === opt.value ? '#1A56DB' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {plano === opt.value && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#F0F6FF' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#4D6A8A', marginTop: '2px' }}>{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.72rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
                Forma de pagamento preferida
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {([
                  { value: 'pix'    as Pgto, icon: '⚡', label: 'Via PIX',    sub: fmt(pgto === 'pix' ? totalPix : totalPix) },
                  { value: 'cartao' as Pgto, icon: '💳', label: 'Via Cartão', sub: parcelas > 1 ? `${parcelas}x de ${fmt(totalCartao / parcelas)}` : fmt(totalCartao) },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPgto(opt.value)}
                    style={{
                      padding: '14px 12px',
                      background: pgto === opt.value ? 'rgba(26,86,219,0.12)' : 'rgba(26,86,219,0.03)',
                      border: `1px solid ${pgto === opt.value ? 'rgba(26,86,219,0.45)' : 'rgba(26,86,219,0.12)'}`,
                      borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{opt.icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: pgto === opt.value ? '#F0F6FF' : '#8BA8CC' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: pgto === opt.value ? '#60A5FA' : '#4D6A8A', marginTop: '2px' }}>
                      {opt.value === 'pix' ? fmt(totalPix) : (parcelas > 1 ? `${parcelas}x de ${fmt(totalCartao / parcelas)}` : fmt(totalCartao))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                background: 'rgba(26,86,219,0.06)', border: '1px solid rgba(26,86,219,0.15)',
                borderRadius: '10px', padding: '16px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <span style={{ fontSize: '0.82rem', color: '#8BA8CC' }}>
                {plano === 'essencial' ? 'Defesa Estratégica' : 'Defesa + Gestão de Notificações'} · {pgto === 'pix' ? 'PIX' : 'Cartão'}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF' }}>
                {totalLabel()}
              </span>
            </div>

            {/* Terms */}
            <div
              style={{
                background: 'rgba(26,86,219,0.04)', border: '1px solid rgba(26,86,219,0.1)',
                borderRadius: '10px', padding: '14px 16px',
                fontSize: '0.78rem', color: '#8BA8CC', lineHeight: 1.7, marginBottom: '20px',
              }}
            >
              Após a confirmação, nossa equipe enviará o contrato e o link de pagamento. O início da prestação de serviços ocorre após a assinatura do contrato e confirmação do pagamento.
            </div>

            {/* Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
              <div
                onClick={() => setAgreed(!agreed)}
                style={{
                  width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, marginTop: '2px',
                  border: `2px solid ${agreed ? '#1A56DB' : 'rgba(26,86,219,0.3)'}`,
                  background: agreed ? '#1A56DB' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}
              >
                {agreed && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '0.84rem', color: '#8BA8CC', lineHeight: 1.6 }}>
                Li e compreendi os termos desta proposta. Confirmo que sou{' '}
                <strong style={{ color: '#F0F6FF' }}>{clientName}</strong> e manifesto interesse em contratar a modalidade selecionada.
              </span>
            </label>

            <button
              onClick={handleConfirm}
              disabled={!agreed || isPending}
              className="btn-primary"
              style={{
                width: '100%', padding: '15px', fontSize: '0.95rem',
                opacity: agreed ? 1 : 0.4,
                cursor: agreed ? 'pointer' : 'not-allowed',
                justifyContent: 'center',
              }}
            >
              {isPending ? 'Processando...' : 'Confirmar interesse'}
            </button>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '20px', padding: '48px 36px', textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px', height: '64px',
                background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.35)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '12px' }}>
              Confirmado!
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#8BA8CC', lineHeight: 1.7, marginBottom: '28px' }}>
              Recebemos sua confirmação. Nossa equipe entrará em contato em breve com o contrato e as instruções de pagamento.
            </p>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent(`Olá! Confirmei minha proposta referente ao AIT ${ait}. Aguardo o contrato.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: 'none', justifyContent: 'center', display: 'inline-flex', gap: '8px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.101 22l4.949-1.302A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.522 2 12 2z" />
              </svg>
              Falar com a equipe no WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
