'use client'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/crm',
    label: 'CRM',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Propostas',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/crm/execucao',
    label: 'Execução',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/notificacoes',
    label: 'Notificações',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function AdminNav({ notifCount }: { notifCount?: number }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/crm') return pathname === '/crm'
    if (href === '/crm/execucao') return pathname.startsWith('/crm/execucao')
    if (href === '/notificacoes') return pathname.startsWith('/notificacoes')
    return pathname === '/admin' || pathname === '/'
  }

  return (
    <nav style={{ display: 'flex', gap: '2px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          const showBadge = item.href === '/notificacoes' && notifCount && notifCount > 0

          return (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 11px',
                borderRadius: '7px',
                fontSize: '0.77rem',
                fontWeight: active ? 600 : 400,
                color: active ? '#60A5FA' : '#8BA8CC',
                background: active ? 'rgba(26,86,219,0.12)' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
                position: 'relative',
              }}
            >
              <span style={{ color: active ? '#60A5FA' : '#4D6A8A', display: 'flex' }}>
                {item.icon}
              </span>
              {item.label}
              {showBadge && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '17px',
                  height: '17px',
                  padding: '0 4px',
                  background: '#EF4444',
                  borderRadius: '100px',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1,
                }}>
                  {notifCount}
                </span>
              )}
            </a>
          )
        })}
      </nav>
  )
}
