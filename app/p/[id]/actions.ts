'use server'
import { acceptProposal, markAsViewed } from '@/lib/supabase'
import { moverClienteAutomatico } from '@/lib/supabase-crm'
import type { DadosContrato } from '@/types/proposal'

export async function acceptProposalAction(
  id: string,
  plano: string,
  dadosContrato: DadosContrato,
): Promise<void> {
  await acceptProposal(id, plano, dadosContrato)
  // Move cliente to "proposta_aprovada" in CRM
  await moverClienteAutomatico(id, 'proposta_aprovada').catch(() => {})
}

export async function markViewedAndUpdateCRMAction(id: string): Promise<void> {
  await markAsViewed(id).catch(() => {})
  // Only move to aguardando_resposta if client is in proposta_enviada
  const { getClienteByPropostaId, updateClienteEtapa, createAtividade } = await import('@/lib/supabase-crm')
  const cliente = await getClienteByPropostaId(id).catch(() => null)
  if (cliente && cliente.etapa === 'proposta_enviada') {
    await updateClienteEtapa(cliente.id, 'aguardando_resposta').catch(() => {})
    await createAtividade(
      cliente.id,
      'Cliente visualizou a proposta — movido para "Aguardando resposta"',
      'proposta',
    ).catch(() => {})
  }
}
