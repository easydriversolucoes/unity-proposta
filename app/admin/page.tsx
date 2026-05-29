import { cookies, headers } from 'next/headers'
import { LoginForm } from '@/components/admin/LoginForm'
import { ProposalForm } from '@/components/admin/ProposalForm'
import { listProposals } from '@/lib/supabase'

async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  const cookie = store.get('unity_admin')
  return cookie?.value === process.env.ADMIN_SECRET
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

  const [proposals, baseUrl] = await Promise.all([
    listProposals(),
    getBaseUrl(),
  ])

  return <ProposalForm initialProposals={proposals} baseUrl={baseUrl} />
}
