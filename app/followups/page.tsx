import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from '@/components/admin/LoginForm'
import { listFollowUpsAgendados } from '@/lib/supabase-crm'
import { getNotificacoes } from '@/lib/supabase-crm'
import FollowUpsPage from '@/components/admin/FollowUpsPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Follow-ups — Unity Multas',
}

export default async function FollowUpsRoute() {
  const authed = await isAuthenticated()
  if (!authed) return <LoginForm />

  const [clientes, notifData] = await Promise.all([
    listFollowUpsAgendados().catch(() => []),
    getNotificacoes().catch(() => ({ followupsVencidos: [], followupsHoje: [], resultadosRecentes: [], propostasRecentes: [] })),
  ])

  const notifCount = notifData.followupsVencidos.length + notifData.followupsHoje.length

  return <FollowUpsPage initialClientes={clientes} notifCount={notifCount} />
}
