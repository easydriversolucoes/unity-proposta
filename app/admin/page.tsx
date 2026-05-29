import { cookies, headers } from 'next/headers'
import { LoginForm } from '@/components/admin/LoginForm'
import { ProposalForm } from '@/components/admin/ProposalForm'
import { listProposals } from '@/lib/supabase'
import type { Proposal } from '@/types/proposal'

// Always server-render: reads cookies on every request
export const dynamic = 'force-dynamic'

async function isAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET
  // If ADMIN_SECRET is not set, never grant access
  if (!secret) return false
  const store = await cookies()
  const cookie = store.get('unity_admin')
  return cookie?.value === secret
}

async function getBaseUrl(): Promise<string> {
  const hdrs = await headers()
  const host = hdrs.get('host') ?? 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

export default async function AdminPage() {
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

  return <ProposalForm initialProposals={proposals} baseUrl={baseUrl} />
}
