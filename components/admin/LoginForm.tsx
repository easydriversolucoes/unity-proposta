'use client'
import { useState, useTransition } from 'react'
import { loginAction } from '@/app/admin/actions'

export function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await loginAction(password)
      if (!result.ok) {
        setError(result.error ?? 'Erro ao autenticar.')
      } else {
        window.location.reload()
      }
    })
  }

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
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(9, 24, 48, 0.85)',
          border: '1px solid rgba(26, 86, 219, 0.25)',
          borderRadius: '20px',
          padding: '48px 40px',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 20px rgba(26,86,219,0.4)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F0F6FF' }}>
            Unity Multas
          </div>
          <div style={{ fontSize: '0.75rem', color: '#4D6A8A', marginTop: '4px', letterSpacing: '0.06em' }}>
            Painel Interno
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '20px' }}>
            <span
              style={{
                display: 'block',
                fontSize: '0.75rem',
                color: '#4D6A8A',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Senha de acesso
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(26, 86, 219, 0.06)',
                border: '1px solid rgba(26, 86, 219, 0.2)',
                borderRadius: '10px',
                color: '#F0F6FF',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(26,86,219,0.5)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(26,86,219,0.2)' }}
            />
          </label>

          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.82rem',
                color: '#FCA5A5',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !password}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: isPending || !password ? 'not-allowed' : 'pointer',
              opacity: isPending || !password ? 0.6 : 1,
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 20px rgba(26,86,219,0.35)',
            }}
          >
            {isPending ? 'Verificando...' : 'Acessar painel'}
          </button>
        </form>
      </div>
    </div>
  )
}
