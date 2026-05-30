import { getPortalDataAction } from '@/app/meu-recurso/actions'
import ClienteLogin from '@/components/meu-recurso/ClienteLogin'
import ClientePortal from '@/components/meu-recurso/ClientePortal'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Meu Recurso — Unity Multas',
  description: 'Acompanhe o andamento do seu recurso administrativo de trânsito.',
}

export default async function MeuRecursoPage() {
  const data = await getPortalDataAction()

  if (!data) {
    return <ClienteLogin />
  }

  return <ClientePortal cliente={data.cliente} processos={data.processos} />
}
