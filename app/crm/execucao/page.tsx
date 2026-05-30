import { isAuthenticated } from '@/lib/auth'
import { listTarefasAtivas } from '@/lib/supabase-crm'
import { LoginForm } from '@/components/admin/LoginForm'
import ExecucaoBoard from '@/components/crm/execucao/ExecucaoBoard'

export const dynamic = 'force-dynamic'

export default async function ExecucaoPage() {
  const authed = await isAuthenticated()
  if (!authed) return <LoginForm />

  let tarefas: Awaited<ReturnType<typeof listTarefasAtivas>> = []
  try {
    tarefas = await listTarefasAtivas()
  } catch {
    // Supabase not configured yet
  }

  return <ExecucaoBoard initialTarefas={tarefas} />
}
