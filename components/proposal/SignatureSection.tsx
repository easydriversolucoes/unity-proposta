'use client'
import { useState, useTransition } from 'react'
import { acceptProposalAction } from '@/app/p/[id]/actions'
import type { ProposalStatus, DadosContrato } from '@/types/proposal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'

function capWords(s: string) {
  return s.replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

function fmtCPF(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    .replace(/(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3')
    .replace(/(\d{3})(\d{3})$/, '$1.$2')
}

function fmtCEP(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.replace(/(\d{5})(\d)/, '$1-$2')
}

function validateCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11 || /^(.)\1+$/.test(c)) return false
  let s = 0
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i)
  let d1 = 11 - (s % 11); if (d1 > 9) d1 = 0
  if (d1 !== +c[9]) return false
  s = 0
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i)
  let d2 = 11 - (s % 11); if (d2 > 9) d2 = 0
  return d2 === +c[10]
}

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

// ─── Styles ───────────────────────────────────────────────────────────────────

const FIELD: React.CSSProperties = {
  width: '100%', padding: '13px 14px',
  background: 'rgba(26,86,219,0.05)', border: '1px solid rgba(26,86,219,0.2)',
  borderRadius: '10px', color: '#F0F6FF', fontSize: '0.92rem',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s',
}

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: '0.68rem', color: '#4D6A8A',
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px', fontWeight: 600,
}

const DIVIDER: React.CSSProperties = {
  border: 'none', borderTop: '1px solid rgba(26,86,219,0.12)', margin: '20px 0',
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: '0.68rem', color: '#60A5FA', letterSpacing: '0.12em',
  textTransform: 'uppercase', fontWeight: 700, marginBottom: '14px',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Plano = 'essencial' | 'essencial+gestao'
type Pgto = 'pix' | 'cartao'
type Step = 'selection' | 'contrato' | 'done'

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
  proposalStatus: ProposalStatus
}

// ─── Done screen ──────────────────────────────────────────────────────────────

function DoneScreen({ ait }: { ait: string }) {
  return (
    <div style={{
      background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)',
      borderRadius: '20px', padding: '48px 36px', textAlign: 'center',
    }}>
      <div style={{
        width: '64px', height: '64px',
        background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.35)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M5 12l5 5L20 7" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '12px' }}>
        Proposta confirmada!
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#8BA8CC', lineHeight: 1.7, marginBottom: '8px' }}>
        Recebemos seus dados. Nossa equipe irá confeccionar o contrato e enviará em breve.
      </p>
      <p style={{ fontSize: '0.82rem', color: '#4D6A8A', lineHeight: 1.6, marginBottom: '28px' }}>
        Em caso de dúvidas, entre em contato com nossa equipe pelo WhatsApp.
      </p>
      <a
        href={`https://wa.me/${WA}?text=${encodeURIComponent(`Olá! Confirmei minha proposta referente ao AIT ${ait}. Aguardo o contrato.`)}`}
        target="_blank" rel="noopener noreferrer"
        className="btn-primary"
        style={{ textDecoration: 'none', justifyContent: 'center', display: 'inline-flex', gap: '8px' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
          <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.101 22l4.949-1.302A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.522 2 12 2z" />
        </svg>
        Falar com a equipe no WhatsApp
      </a>
    </div>
  )
}

// ─── Contract data form ───────────────────────────────────────────────────────

function ContratoForm({
  plano, pgto, totalLabel,
  onBack, onSubmit, isPending,
}: {
  plano: string; pgto: string; totalLabel: string
  onBack: () => void
  onSubmit: (dados: DadosContrato) => void
  isPending: boolean
}) {
  const [d, setD] = useState<DadosContrato>({
    nome: '', rg: '', cpf: '', email: '',
    cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '',
  })
  const [cpfError, setCpfError] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof DadosContrato, string>>>({})

  const set = (k: keyof DadosContrato, v: string) => {
    setD((p) => ({ ...p, [k]: v }))
    setErrors((p) => ({ ...p, [k]: undefined }))
  }

  async function handleCEP(raw: string) {
    const formatted = fmtCEP(raw)
    set('cep', formatted)
    const clean = raw.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setD((p) => ({
          ...p,
          cep: formatted,
          endereco: capWords(data.logradouro ?? ''),
          bairro: capWords(data.bairro ?? ''),
          cidade: capWords(data.localidade ?? ''),
          estado: data.uf ?? '',
        }))
      }
    } catch { /* ignore */ } finally {
      setCepLoading(false)
    }
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!d.nome.trim()) e.nome = 'Obrigatório'
    if (!d.rg.trim()) e.rg = 'Obrigatório'
    if (!d.cpf.trim()) e.cpf = 'Obrigatório'
    else if (!validateCPF(d.cpf)) { e.cpf = 'CPF inválido'; setCpfError('CPF inválido') }
    if (!d.email.trim() || !d.email.includes('@')) e.email = 'E-mail inválido'
    if (!d.cep.trim()) e.cep = 'Obrigatório'
    if (!d.endereco.trim()) e.endereco = 'Obrigatório'
    if (!d.numero.trim()) e.numero = 'Obrigatório'
    if (!d.bairro.trim()) e.bairro = 'Obrigatório'
    if (!d.cidade.trim()) e.cidade = 'Obrigatório'
    if (!d.estado) e.estado = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    onSubmit(d)
  }

  function field(label: string, k: keyof DadosContrato, opts?: {
    placeholder?: string; type?: string; transform?: (v: string) => string; col?: string
  }) {
    const hasErr = !!errors[k]
    return (
      <label key={k} style={{ display: 'block', gridColumn: opts?.col }}>
        <span style={LABEL}>{label}{hasErr ? <span style={{ color: '#F87171', marginLeft: '4px' }}>*</span> : ' *'}</span>
        <input
          style={{ ...FIELD, borderColor: hasErr ? 'rgba(248,113,113,0.5)' : undefined }}
          type={opts?.type ?? 'text'}
          placeholder={opts?.placeholder}
          value={d[k]}
          onChange={(e) => {
            const v = opts?.transform ? opts.transform(e.target.value) : e.target.value
            if (k === 'cep') handleCEP(e.target.value)
            else { set(k, v); if (k === 'cpf') setCpfError('') }
          }}
        />
        {k === 'cpf' && cpfError && <span style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '3px', display: 'block' }}>{cpfError}</span>}
        {hasErr && k !== 'cpf' && <span style={{ fontSize: '0.72rem', color: '#F87171', marginTop: '3px', display: 'block' }}>{errors[k]}</span>}
      </label>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        background: 'rgba(9,24,48,0.85)', border: '1px solid rgba(26,86,219,0.2)',
        borderRadius: '20px', padding: '32px', backdropFilter: 'blur(12px)',
      }}>
        {/* Resumo da seleção */}
        <div style={{ background: 'rgba(26,86,219,0.06)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#8BA8CC' }}>
            {plano === 'essencial' ? 'Defesa Estratégica' : 'Defesa + Gestão'} · {pgto === 'pix' ? 'PIX' : 'Cartão'}
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F0F6FF' }}>{totalLabel}</span>
        </div>

        {/* Dados pessoais */}
        <div style={SECTION_TITLE}>Dados pessoais</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '4px' }}>
          {field('Nome completo', 'nome', { placeholder: 'Como consta no documento', transform: capWords, col: '1/-1' })}
          {field('RG', 'rg', { placeholder: 'Número do RG' })}
          {field('CPF', 'cpf', {
            placeholder: '000.000.000-00',
            transform: fmtCPF,
          })}
        </div>

        <hr style={DIVIDER} />

        {/* Endereço */}
        <div style={SECTION_TITLE}>Endereço</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '4px' }}>
          <label style={{ display: 'block' }}>
            <span style={LABEL}>CEP *{cepLoading ? <span style={{ color: '#60A5FA', marginLeft: '4px', fontSize: '0.65rem' }}>Buscando...</span> : ''}</span>
            <input
              style={{ ...FIELD, borderColor: errors.cep ? 'rgba(248,113,113,0.5)' : undefined }}
              placeholder="00000-000"
              value={d.cep}
              onChange={(e) => handleCEP(e.target.value)}
            />
          </label>
          {field('Endereço', 'endereco', { placeholder: 'Rua, Av., Travessa...', transform: capWords, col: '1/-1' })}
          {field('Número', 'numero', { placeholder: '123 / S/N' })}
          {field('Bairro', 'bairro', { placeholder: 'Nome do bairro', transform: capWords })}
          {field('Cidade', 'cidade', { placeholder: 'Nome da cidade', transform: capWords })}
          <label style={{ display: 'block' }}>
            <span style={LABEL}>Estado *</span>
            <select
              style={{ ...FIELD, cursor: 'pointer', borderColor: errors.estado ? 'rgba(248,113,113,0.5)' : undefined }}
              value={d.estado}
              onChange={(e) => set('estado', e.target.value)}
            >
              <option value="" style={{ background: '#040C18' }}>Selecione</option>
              {ESTADOS.map((uf) => (
                <option key={uf} value={uf} style={{ background: '#040C18' }}>{uf}</option>
              ))}
            </select>
          </label>
        </div>

        <hr style={DIVIDER} />

        {/* Contato */}
        <div style={SECTION_TITLE}>Contato</div>
        <div style={{ marginBottom: '24px' }}>
          {field('E-mail', 'email', { placeholder: 'seu@email.com', type: 'email' })}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onBack} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid rgba(26,86,219,0.25)', borderRadius: '10px', color: '#8BA8CC', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Voltar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary"
            style={{ flex: 2, padding: '13px', fontSize: '0.92rem', justifyContent: 'center', opacity: isPending ? 0.7 : 1, cursor: isPending ? 'wait' : 'pointer' }}
          >
            {isPending ? 'Enviando...' : '✓ Confirmar proposta'}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SignatureSection({
  proposalId, clientName, ait,
  valorEssencialPix, valorEssencialCartao, parcelasEssencial,
  valorGestaoPix, valorGestaoCartao, parcelasGestao,
  mostrarGestao, proposalStatus,
}: SignatureSectionProps) {
  const alreadyDone = proposalStatus === 'aprovada' || proposalStatus === 'contratada'
  const [step, setStep] = useState<Step>(alreadyDone ? 'done' : 'selection')
  const [plano, setPlano] = useState<Plano>('essencial')
  const [pgto, setPgto] = useState<Pgto>('pix')
  const [agreed, setAgreed] = useState(false)
  const [isPending, startTransition] = useTransition()

  const totalPix = plano === 'essencial' ? valorEssencialPix : valorEssencialPix + valorGestaoPix
  const totalCartao = plano === 'essencial' ? valorEssencialCartao : valorEssencialCartao + valorGestaoCartao
  const parcelas = plano === 'essencial' ? parcelasEssencial : Math.max(parcelasEssencial, parcelasGestao)
  const valorParcela = totalCartao / parcelas

  function totalLabel() {
    if (pgto === 'pix') return fmt(totalPix)
    if (parcelas > 1) return `${parcelas}x de ${fmt(valorParcela)} (total ${fmt(totalCartao)})`
    return fmt(totalCartao)
  }

  function handleContratoSubmit(dados: DadosContrato) {
    startTransition(async () => {
      await acceptProposalAction(proposalId, `${plano}-${pgto}`, dados)
      setStep('done')
    })
  }

  return (
    <section style={{ padding: '80px 24px 100px', background: '#040C18' }} id="assinar">
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>

        {/* Header */}
        {step !== 'done' && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge-blue" style={{ marginBottom: '16px' }}>Próximo passo</span>
            <h2 style={{ fontSize: 'clamp(1.5rem,3vw,1.9rem)', fontWeight: 800, color: '#F0F6FF', letterSpacing: '-0.02em', marginTop: '12px', marginBottom: '14px' }}>
              Confirmação da proposta
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#8BA8CC', lineHeight: 1.7 }}>
              {step === 'selection'
                ? 'Selecione a modalidade e a forma de pagamento preferida.'
                : 'Preencha seus dados para que possamos confeccionar o contrato.'}
            </p>
          </div>
        )}

        {step === 'selection' && (
          <div style={{ background: 'rgba(9,24,48,0.85)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '20px', padding: '36px', backdropFilter: 'blur(12px)' }}>
            {/* Plan selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={LABEL}>Modalidade</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {([
                  { value: 'essencial' as Plano, label: 'Defesa Estratégica', sub: 'Serviço principal' },
                  ...(mostrarGestao ? [{ value: 'essencial+gestao' as Plano, label: 'Defesa Estratégica + Gestão de Notificações', sub: 'Serviço principal + adicional' }] : []),
                ]).map((opt) => (
                  <button key={opt.value} onClick={() => setPlano(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: plano === opt.value ? 'rgba(26,86,219,0.1)' : 'rgba(26,86,219,0.03)', border: `1px solid ${plano === opt.value ? 'rgba(26,86,219,0.45)' : 'rgba(26,86,219,0.12)'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${plano === opt.value ? '#1A56DB' : 'rgba(26,86,219,0.3)'}`, background: plano === opt.value ? '#1A56DB' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
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

            {/* Payment */}
            <div style={{ marginBottom: '24px' }}>
              <div style={LABEL}>Forma de pagamento preferida</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {([
                  { value: 'pix' as Pgto, icon: '⚡', label: 'Via PIX', sub: fmt(totalPix) },
                  { value: 'cartao' as Pgto, icon: '💳', label: 'Via Cartão', sub: parcelas > 1 ? `${parcelas}x de ${fmt(valorParcela)}` : fmt(totalCartao) },
                ]).map((opt) => (
                  <button key={opt.value} onClick={() => setPgto(opt.value)} style={{ padding: '14px 12px', background: pgto === opt.value ? 'rgba(26,86,219,0.12)' : 'rgba(26,86,219,0.03)', border: `1px solid ${pgto === opt.value ? 'rgba(26,86,219,0.45)' : 'rgba(26,86,219,0.12)'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{opt.icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: pgto === opt.value ? '#F0F6FF' : '#8BA8CC' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.72rem', color: pgto === opt.value ? '#60A5FA' : '#4D6A8A', marginTop: '2px' }}>{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div style={{ background: 'rgba(26,86,219,0.06)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: '#8BA8CC' }}>
                {plano === 'essencial' ? 'Defesa Estratégica' : 'Defesa + Gestão'} · {pgto === 'pix' ? 'PIX' : 'Cartão'}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF' }}>{totalLabel()}</span>
            </div>

            {/* Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: '24px' }}>
              <div onClick={() => setAgreed(!agreed)} style={{ width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, marginTop: '2px', border: `2px solid ${agreed ? '#1A56DB' : 'rgba(26,86,219,0.3)'}`, background: agreed ? '#1A56DB' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: 'pointer' }}>
                {agreed && <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: '0.84rem', color: '#8BA8CC', lineHeight: 1.6 }}>
                Li e compreendi os termos desta proposta. Confirmo que sou{' '}
                <strong style={{ color: '#F0F6FF' }}>{clientName}</strong> e manifesto interesse em contratar a modalidade selecionada.
              </span>
            </label>

            <button
              onClick={() => { if (agreed) setStep('contrato') }}
              disabled={!agreed}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '0.95rem', opacity: agreed ? 1 : 0.4, cursor: agreed ? 'pointer' : 'not-allowed', justifyContent: 'center' }}
            >
              Próximo: Preencher dados para contrato →
            </button>
          </div>
        )}

        {step === 'contrato' && (
          <ContratoForm
            plano={plano}
            pgto={pgto}
            totalLabel={totalLabel()}
            onBack={() => setStep('selection')}
            onSubmit={handleContratoSubmit}
            isPending={isPending}
          />
        )}

        {step === 'done' && <DoneScreen ait={ait} />}
      </div>
    </section>
  )
}
