export const dynamic = 'force-dynamic'

import { requireAuth } from '@/lib/auth'
import { listClientesPagamento, listProcessosComFases } from '@/lib/supabase-crm'
import { createClient } from '@supabase/supabase-js'
import ContratosPage from '@/components/admin/ContratosPage'
import { getNotificacoes } from '@/lib/supabase-crm'
import type { Proposal } from '@/types/proposal'

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
}

export default async function Page() {
  await requireAuth()

  const [clientes, notifData] = await Promise.all([
    listClientesPagamento(),
    getNotificacoes().catch(() => ({ followupsVencidos: [], followupsHoje: [], resultadosRecentes: [], propostasRecentes: [] })),
  ])

  const notifCount = notifData.followupsVencidos.length + notifData.followupsHoje.length

  // Fetch propostas for all clients with proposta_id
  const propostaIds = clientes.map((c) => c.proposta_id).filter(Boolean) as string[]
  const { data: propostas } = propostaIds.length
    ? await db().from('propostas').select('*').in('id', propostaIds)
    : { data: [] }

  const propostaMap = Object.fromEntries((propostas ?? [] as Proposal[]).map((p) => [p.id, p as Proposal]))

  // Fetch processos + fases for each client
  const processosMap: Record<string, Awaited<ReturnType<typeof listProcessosComFases>>> = {}
  await Promise.all(
    clientes.map(async (c) => {
      processosMap[c.id] = await listProcessosComFases(c.id).catch(() => [])
    }),
  )

  const data = clientes.map((c) => ({
    cliente: c,
    proposta: (c.proposta_id ? propostaMap[c.proposta_id] ?? null : null) as Proposal | null,
    processos: processosMap[c.id] ?? [],
  }))

  return <ContratosPage data={data} notifCount={notifCount} />
}
