import { isAuthenticated } from '@/lib/auth'
import { LoginForm } from '@/components/admin/LoginForm'
import { getNotificacoes } from '@/lib/supabase-crm'
import NotificacoesPage from '@/components/admin/NotificacoesPage'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Unity Multas — Painel',
}

export default async function AdminHomePage() {
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

  const notifCount = data.followupsVencidos.length + data.followupsHoje.length

  return <NotificacoesPage data={data} notifCount={notifCount} />
}
