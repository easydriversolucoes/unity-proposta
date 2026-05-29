'use client'
import { useState, useEffect } from 'react'

export function CountdownBadge({ prazoValidade }: { prazoValidade: string }) {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    const calc = () => {
      const expiry = new Date(prazoValidade + 'T23:59:59')
      const diff = expiry.getTime() - Date.now()
      setDays(Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }
    calc()
    const id = setInterval(calc, 60_000)
    return () => clearInterval(id)
  }, [prazoValidade])

  if (days === null) return null

  if (days <= 0) {
    return (
      <span
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          color: '#FCA5A5',
          borderRadius: '100px',
          padding: '4px 14px',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          display: 'inline-block',
        }}
      >
        Proposta expirada
      </span>
    )
  }

  const color = days > 5 ? '#6EE7B7' : days > 2 ? '#FCD34D' : '#FCA5A5'
  const bg    = days > 5 ? 'rgba(16,185,129,0.1)' : days > 2 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)'
  const bdr   = days > 5 ? 'rgba(16,185,129,0.25)' : days > 2 ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'

  return (
    <span
      style={{
        background: bg,
        border: `1px solid ${bdr}`,
        color,
        borderRadius: '100px',
        padding: '4px 14px',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Falta{days === 1 ? '' : 'm'} {days} dia{days === 1 ? '' : 's'}
    </span>
  )
}
