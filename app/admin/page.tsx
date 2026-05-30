import { headers } from 'next/headers'
import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from '@/components/admin/LoginForm'
import { ProposalForm } from '@/components/admin/ProposalForm'
import { listProposals } from '@/lib/supabase'
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

  let proposals: Proposal[] = []
  try {
    proposals = await listProposals()
  } catch {
    // Supabase not configured yet — show empty list instead of crashing
  }

  const baseUrl = await getBaseUrl()
  const params = await searchParams

  return (
    <ProposalForm
      initialProposals={proposals}
      baseUrl={baseUrl}
      initialNome={params.nome}
      initialAit={params.ait}
      clienteId={params.cliente_id}
    />
  )
}
