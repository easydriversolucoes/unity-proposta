import { headers } from 'next/headers'
import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from '@/components/admin/LoginForm'
import { ProposalForm } from '@/components/admin/ProposalForm'
import { listProposals } from '@/lib/supabase'
import { getNotificacoes, getClientesTelefoneMap } from '@/lib/supabase-crm'
import type { Proposal } from '@/types/proposal'

export const dynamic = 'force-dynamic'

async function getBaseUrl(): Promise<string> {
  const hdrs = await headers()
  const host = hdrs.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const authed = await isAuthenticated()

  if (!authed) {
    return <LoginForm />
  }

  const [proposals, notifData, telefoneMap, baseUrl, params] = await Promise.all([
    listProposals().catch(() => [] as Proposal[]),
    getNotificacoes().catch(() => ({ followupsVencidos: [], followupsHoje: [], resultadosRecentes: [], propostasRecentes: [] })),
    getClientesTelefoneMap().catch(() => ({} as Record<string, string | null>)),
    getBaseUrl(),
    searchParams,
  ])

  const notifCount = notifData.followupsVencidos.length + notifData.followupsHoje.length

  return (
    <ProposalForm
      initialProposals={proposals}
      baseUrl={baseUrl}
      initialNome={params.nome}
      initialAit={params.ait}
      clienteId={params.cliente_id}
      notifCount={notifCount}
      clienteTelefones={telefoneMap}
    />
  )
}
