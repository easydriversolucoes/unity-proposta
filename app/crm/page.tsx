import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { listClientes } from '@/lib/supabase-crm'
import { LoginForm } from '@/components/admin/LoginForm'
import CRMBoard from '@/components/crm/CRMBoard'

export const dynamic = 'force-dynamic'

export default async function CRMPage() {
  const authed = await isAuthenticated()
  if (!authed) return <LoginForm />

  let clientes: Awaited<ReturnType<typeof listClientes>> = []
  try {
    clientes = await listClientes()
  } catch {
    // Supabase not configured yet
  }

  return <CRMBoard initialClientes={clientes} />
}
