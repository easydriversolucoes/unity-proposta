'use client'
import { useState, useTransition } from 'react'
import { loginClienteAction } from '@/app/meu-recurso/actions'

export default function ClienteLogin() {
  const [cpf, setCpf] = useState('')
  const [placa, setPlaca] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function formatCpf(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})$/, '$1.$2.$3')
      .replace(/(\d{3})(\d{3})$/, '$1.$2')
      .replace(/(\d{3})$/, '$1')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await loginClienteAction(cpf, placa)
      if (res.ok) window.location.reload()
      else setError(res.error)
    })
  }

  const field: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(26,86,219,0.06)',
    border: '1px solid rgba(26,86,219,0.2)',
    borderRadius: '10px',
    color: '#F0F6FF',
    fontSize: '1rem',
    outline: 'none',
    fontFamily: 'inherit',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#040C18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Logo */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg,#1A56DB,#1E40AF)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F0F6FF', margin: 0 }}>Unity Multas</h1>
        <p style={{ fontSize: '0.85rem', color: '#8BA8CC', marginTop: '6px' }}>Acompanhe seu recurso administrativo</p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(9,24,48,0.85)',
        border: '1px solid rgba(26,86,219,0.2)',
        borderRadius: '20px',
        padding: '36px 32px',
        backdropFilter: 'blur(12px)',
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F0F6FF', marginBottom: '8px' }}>
          Acesse seu recurso
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#8BA8CC', marginBottom: '28px' }}>
          Informe seus dados para acompanhar o andamento do processo.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
              CPF
            </span>
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder="000.000.000-00"
              style={field}
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
            />
          </label>

          <label>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#4D6A8A', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
              Placa do veículo
            </span>
            <input
              type="text"
              required
              placeholder="ABC1D23"
              style={field}
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              maxLength={8}
            />
          </label>

          {error && (
            <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '0.82rem', color: '#FCA5A5' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '14px',
              background: isPending ? 'rgba(26,86,219,0.5)' : 'linear-gradient(135deg,#1A56DB,#1E40AF)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isPending ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(26,86,219,0.4)',
              marginTop: '4px',
            }}
          >
            {isPending ? 'Verificando...' : 'Acessar meu recurso'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '24px', fontSize: '0.75rem', color: '#2A3F5A', textAlign: 'center', maxWidth: '320px' }}>
        Seus dados são usados somente para identificação. Nenhuma senha é necessária.
      </p>
    </div>
  )
}
