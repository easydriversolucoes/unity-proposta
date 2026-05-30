'use client'
import { useState, useTransition } from 'react'
import type { Cliente, ProcessoRecurso, FaseRecursoRecord, FaseRecurso, TipoProcesso } from '@/types/crm'
import { FASE_LABELS, TIPO_PROCESSO_LABELS } from '@/types/crm'
import { informarResultadoAction, logoutClienteAction } from '@/app/meu-recurso/actions'

type ProcessoComFases = ProcessoRecurso & { fases: FaseRecursoRecord[] }

const STATUS_INFO: Record<string, { label: string; color: string; bg: string }> = {
  em_andamento:        { label: 'Em andamento',         color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  aguardando_resultado: { label: 'Aguardando resultado', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
  deferido:            { label: 'Deferido ✅',            color: '#6EE7B7', bg: 'rgba(110,231,183,0.1)' },
  indeferido:          { label: 'Indeferido',             color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
}

const INSTRUCOES: Record<FaseRecurso, string> = {
  defesa_previa: 'Acesse o portal do DETRAN do seu estado e verifique se há decisão sobre a Defesa Prévia do seu processo. Caso o prazo de 30 dias tenha passado sem resposta, geralmente é considerado indeferido.',
  jari: 'Verifique no portal do DETRAN a decisão da JARI (Junta Administrativa de Recursos de Infrações). O prazo de análise varia por estado, mas costuma ser de 30 a 60 dias.',
  cetran: 'Consulte o portal do CETRAN (Conselho Estadual de Trânsito) do seu estado para verificar a decisão sobre o recurso. Esta é a última instância administrativa.',
}

const COMO_VERIFICAR: Record<FaseRecurso, string> = {
  defesa_previa: 'No portal do DETRAN, acesse "Consulta de Infrações" ou "Acompanhar Recursos" usando seu CPF ou número do AIT.',
  jari: 'Acesse o site da JARI do seu estado ou o portal do DETRAN em "Recursos — JARI". Tenha em mãos o número do protocolo fornecido pela Unity Multas.',
  cetran: 'Acesse o portal do CETRAN do seu estado em "Consulta de Processos" com o número de protocolo do recurso.',
}

// ─── Phase badge ──────────────────────────────────────────────────────────────

function PhaseBadge({ fase, isCurrent, isCompleted, resultado }: {
  fase: FaseRecurso
  isCurrent: boolean
  isCompleted: boolean
  resultado?: 'deferido' | 'indeferido' | null
}) {
  let color = '#2A3F5A'
  let bg = 'rgba(26,86,219,0.05)'
  let border = 'rgba(26,86,219,0.1)'

  if (resultado === 'deferido') { color = '#6EE7B7'; bg = 'rgba(110,231,183,0.1)'; border = 'rgba(110,231,183,0.3)' }
  else if (resultado === 'indeferido') { color = '#F87171'; bg = 'rgba(248,113,113,0.08)'; border = 'rgba(248,113,113,0.25)' }
  else if (isCurrent) { color = '#60A5FA'; bg = 'rgba(26,86,219,0.12)'; border = 'rgba(26,86,219,0.4)' }

  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: bg, border: `2px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 6px',
        fontSize: '1rem',
      }}>
        {resultado === 'deferido' ? '✅' : resultado === 'indeferido' ? '❌' : isCurrent ? '⚖️' : '○'}
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: isCurrent ? 700 : 400, color }}>{FASE_LABELS[fase]}</div>
    </div>
  )
}

// ─── Single process track ─────────────────────────────────────────────────────

function ProcessoTrack({
  processo,
  onResultadoRegistrado,
}: {
  processo: ProcessoComFases
  onResultadoRegistrado: (processoId: string, fase: FaseRecurso, resultado: 'deferido' | 'indeferido') => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notas, setNotas] = useState('')
  const [confirming, setConfirming] = useState<'deferido' | 'indeferido' | null>(null)

  const fases: FaseRecurso[] = ['defesa_previa', 'jari', 'cetran']
  const faseAtual = processo.fase_atual
  const tipoLabel = TIPO_PROCESSO_LABELS[processo.tipo]
  const statusInfo = STATUS_INFO[processo.status] ?? STATUS_INFO.em_andamento
  const aguardando = processo.status === 'aguardando_resultado'
  const encerrado = processo.status === 'deferido' || processo.status === 'indeferido'

  function getFaseResultado(fase: FaseRecurso): 'deferido' | 'indeferido' | null {
    return processo.fases.find((f) => f.fase === fase)?.resultado ?? null
  }

  function handleInformar(resultado: 'deferido' | 'indeferido') {
    setError(null)
    startTransition(async () => {
      const res = await informarResultadoAction(processo.id, faseAtual, resultado, notas || undefined)
      if (res.ok) {
        onResultadoRegistrado(processo.id, faseAtual, resultado)
        setConfirming(null)
        setNotas('')
      } else {
        setError(res.error)
        setConfirming(null)
      }
    })
  }

  return (
    <div style={{
      background: 'rgba(9,24,48,0.85)',
      border: `1px solid rgba(26,86,219,0.2)`,
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Recurso da {tipoLabel}
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: statusInfo.bg, border: `1px solid ${statusInfo.color}40`, borderRadius: '100px', padding: '4px 12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: statusInfo.color }}>{statusInfo.label}</span>
          </div>
        </div>
        {processo.numero_protocolo && (
          <div style={{ fontSize: '0.72rem', color: '#4D6A8A', textAlign: 'right' }}>
            Protocolo<br />
            <span style={{ color: '#8BA8CC', fontWeight: 600 }}>{processo.numero_protocolo}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0', marginBottom: '24px', position: 'relative' }}>
        {fases.map((fase, i) => (
          <div key={fase} style={{ display: 'flex', flex: 1, alignItems: 'flex-start', position: 'relative' }}>
            <PhaseBadge
              fase={fase}
              isCurrent={!encerrado && fase === faseAtual}
              isCompleted={fases.indexOf(faseAtual) > i || encerrado}
              resultado={getFaseResultado(fase)}
            />
            {i < fases.length - 1 && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '60%',
                right: '-40%',
                height: '2px',
                background: 'rgba(26,86,219,0.15)',
                zIndex: 0,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current phase instructions */}
      {!encerrado && (
        <div style={{ background: 'rgba(26,86,219,0.06)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Fase atual: {FASE_LABELS[faseAtual]}
          </div>
          {aguardando ? (
            <>
              <p style={{ fontSize: '0.83rem', color: '#D1E0F0', lineHeight: 1.6, marginBottom: '10px' }}>
                {INSTRUCOES[faseAtual]}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#8BA8CC', lineHeight: 1.5 }}>
                <strong style={{ color: '#FBBF24' }}>Como verificar:</strong> {COMO_VERIFICAR[faseAtual]}
              </p>
            </>
          ) : (
            <p style={{ fontSize: '0.83rem', color: '#8BA8CC', lineHeight: 1.6 }}>
              Seu recurso está sendo preparado e será protocolado em breve. Você receberá um aviso quando precisar verificar o resultado.
            </p>
          )}
        </div>
      )}

      {encerrado && (
        <div style={{
          background: processo.status === 'deferido' ? 'rgba(110,231,183,0.08)' : 'rgba(248,113,113,0.06)',
          border: `1px solid ${processo.status === 'deferido' ? 'rgba(110,231,183,0.25)' : 'rgba(248,113,113,0.2)'}`,
          borderRadius: '10px',
          padding: '16px',
          fontSize: '0.83rem',
          color: processo.status === 'deferido' ? '#6EE7B7' : '#FCA5A5',
          lineHeight: 1.6,
        }}>
          {processo.status === 'deferido'
            ? '✅ Recurso deferido com sucesso! Seu processo foi encerrado.'
            : '❌ O recurso foi indeferido em todas as instâncias administrativas disponíveis. Entre em contato com a Unity Multas para orientações sobre os próximos passos.'}
        </div>
      )}

      {/* Inform result buttons */}
      {aguardando && !confirming && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
            Já verificou o resultado? Informe abaixo:
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setConfirming('deferido')}
              style={{ flex: 1, padding: '12px', background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.3)', borderRadius: '10px', color: '#6EE7B7', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ✅ Recurso foi deferido
            </button>
            <button
              onClick={() => setConfirming('indeferido')}
              style={{ flex: 1, padding: '12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', color: '#FCA5A5', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ❌ Recurso foi negado
            </button>
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {confirming && (
        <div style={{ marginTop: '16px', background: 'rgba(9,24,48,0.9)', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '10px', padding: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: '#F0F6FF', marginBottom: '12px' }}>
            {confirming === 'deferido'
              ? '✅ Confirmar que o recurso foi DEFERIDO (aceito)?'
              : '❌ Confirmar que o recurso foi NEGADO (indeferido)?'}
          </p>
          <label style={{ display: 'block', marginBottom: '10px' }}>
            <span style={{ display: 'block', fontSize: '0.68rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
              Observação (opcional)
            </span>
            <textarea
              style={{ width: '100%', padding: '10px 12px', background: 'rgba(26,86,219,0.05)', border: '1px solid rgba(26,86,219,0.18)', borderRadius: '8px', color: '#F0F6FF', fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit', minHeight: '60px', resize: 'vertical' }}
              placeholder="Ex: Resultado disponível no portal DETRAN-SP..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </label>
          {error && <div style={{ fontSize: '0.78rem', color: '#FCA5A5', marginBottom: '10px' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setConfirming(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(26,86,219,0.2)', borderRadius: '8px', color: '#8BA8CC', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Voltar
            </button>
            <button
              onClick={() => handleInformar(confirming)}
              disabled={isPending}
              style={{ flex: 2, padding: '10px', background: confirming === 'deferido' ? 'rgba(110,231,183,0.2)' : 'rgba(248,113,113,0.15)', border: `1px solid ${confirming === 'deferido' ? 'rgba(110,231,183,0.4)' : 'rgba(248,113,113,0.3)'}`, borderRadius: '8px', color: confirming === 'deferido' ? '#6EE7B7' : '#FCA5A5', fontSize: '0.82rem', fontWeight: 700, cursor: isPending ? 'wait' : 'pointer', fontFamily: 'inherit' }}
            >
              {isPending ? 'Registrando...' : 'Confirmar resultado'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ = [
  { q: 'Quanto tempo demora o processo?', a: 'O prazo total depende de cada fase. A Defesa Prévia costuma ter resposta em até 30 dias, a JARI em 30 a 60 dias e o CETRAN pode demorar até 90 dias. Estamos acompanhando todo o processo.' },
  { q: 'O que acontece se o CETRAN indeferir?', a: 'O CETRAN é a última instância administrativa. Caso seja indeferido, a multa e a pontuação são confirmadas. Entraremos em contato para orientar sobre eventuais medidas judiciais, se aplicável.' },
  { q: 'Preciso fazer algo além de informar o resultado?', a: 'Não. Nossa equipe cuida de toda a parte técnica e jurídica. Seu papel é verificar o resultado no portal do DETRAN/JARI/CETRAN e nos informar aqui.' },
  { q: 'Como faço para falar com a Unity Multas?', a: 'Entre em contato pelo WhatsApp ou pelo canal que usamos para nos comunicar. Nosso time responde em horário comercial.' },
]

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8BA8CC', marginBottom: '14px', letterSpacing: '0.04em' }}>
        Perguntas frequentes
      </h3>
      {FAQ.map((item, i) => (
        <div key={i} style={{ marginBottom: '8px', background: 'rgba(9,24,48,0.5)', border: '1px solid rgba(26,86,219,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: 'none', color: '#D1E0F0', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'inherit' }}
          >
            {item.q}
            <span style={{ color: '#4D6A8A', fontSize: '0.75rem' }}>{open === i ? '▲' : '▼'}</span>
          </button>
          {open === i && (
            <div style={{ padding: '0 16px 14px', fontSize: '0.8rem', color: '#8BA8CC', lineHeight: 1.6 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main portal ──────────────────────────────────────────────────────────────

export default function ClientePortal({
  cliente,
  processos: initialProcessos,
}: {
  cliente: Cliente
  processos: ProcessoComFases[]
}) {
  const [processos, setProcessos] = useState<ProcessoComFases[]>(initialProcessos)
  const [, startTransition] = useTransition()

  function handleResultadoRegistrado(processoId: string, fase: FaseRecurso, resultado: 'deferido' | 'indeferido') {
    const NEXT_FASE: Record<FaseRecurso, FaseRecurso | null> = { defesa_previa: 'jari', jari: 'cetran', cetran: null }
    setProcessos((prev) =>
      prev.map((p) => {
        if (p.id !== processoId) return p
        const novaFase = NEXT_FASE[fase]
        const novoStatus = resultado === 'deferido' ? 'deferido' : novaFase ? 'em_andamento' : 'indeferido'
        return {
          ...p,
          status: novoStatus,
          fase_atual: resultado === 'indeferido' && novaFase ? novaFase : p.fase_atual,
          fases: [...p.fases, { id: 'temp', processo_id: processoId, fase, resultado, informado_por: 'cliente', notas: null, created_at: new Date().toISOString() }],
        }
      }),
    )
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutClienteAction()
      window.location.reload()
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', fontFamily: 'Inter, system-ui, sans-serif', color: '#F0F6FF' }}>
      {/* Header */}
      <header style={{ background: 'rgba(4,12,24,0.95)', borderBottom: '1px solid rgba(26,86,219,0.15)', backdropFilter: 'blur(16px)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unity Multas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '0.8rem', color: '#8BA8CC' }}>{cliente.nome}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(26,86,219,0.2)', color: '#4D6A8A', borderRadius: '6px', padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '6px' }}>
            Meu Recurso
          </h1>
          <p style={{ fontSize: '0.83rem', color: '#8BA8CC' }}>
            Acompanhe o andamento das suas contestações administrativas.
          </p>
        </div>

        {processos.length === 0 ? (
          <div style={{ background: 'rgba(9,24,48,0.85)', border: '1px solid rgba(26,86,219,0.15)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
            <p style={{ color: '#4D6A8A', fontSize: '0.85rem' }}>
              Nenhum processo encontrado ainda. Nossa equipe está preparando seu recurso.
            </p>
          </div>
        ) : (
          processos.map((p) => (
            <ProcessoTrack
              key={p.id}
              processo={p}
              onResultadoRegistrado={handleResultadoRegistrado}
            />
          ))
        )}

        <FaqSection />
      </main>
    </div>
  )
}
