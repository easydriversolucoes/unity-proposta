import { isAuthenticated } from '@/lib/auth'
import { getNotificacoes } from '@/lib/supabase-crm'
import { LoginForm } from '@/components/admin/LoginForm'
import NotificacoesPage from '@/components/admin/NotificacoesPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Notificações — Unity Multas',
}

export default async function Notificacoes() {
  const authed = await isAuthenticated()
  if (!authed) return <LoginForm />

  let data: Awaited<ReturnType<typeof getNotificacoes>> = {
    followupsVencidos: [],
    followupsHoje: [],
    resultadosRecentes: [],
    propostasRecentes: [],
  }

  try {
    data = await getNotificacoes()
  } catch {
    // Supabase not configured yet
  }

  return <NotificacoesPage data={data} />
}
