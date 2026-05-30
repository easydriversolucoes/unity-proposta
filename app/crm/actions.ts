'use server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  listClientes, getCliente, createCliente, updateClienteEtapa, updateCliente,
  createAtividade, listAtividades, linkPropostaToCliente,
  createProcesso, createTarefa,
} from '@/lib/supabase-crm'
import type { EtapaCRM, CreateClienteInput, Atividade } from '@/types/crm'
import { ETAPA_LABELS } from '@/types/crm'

export async function getClientesAction() {
  await requireAuth()
  return listClientes()
}

export async function createClienteAction(input: CreateClienteInput) {
  await requireAuth()
  try {
    const cliente = await createCliente(input)
    await createAtividade(cliente.id, 'Cliente adicionado ao CRM', 'contato')
    revalidatePath('/crm')
    return { ok: true as const, cliente }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function moveClienteAction(
  clienteId: string,
  targetEtapa: EtapaCRM,
  followup?: { followup_data: string; followup_canal: string; nota?: string },
) {
  await requireAuth()
  try {
    const cliente = await getCliente(clienteId)
    if (!cliente) throw new Error('Cliente não encontrado')

    const newContagem = followup ? cliente.followup_contagem + 1 : cliente.followup_contagem
    const followupPatch = followup
      ? { followup_data: followup.followup_data, followup_canal: followup.followup_canal, followup_contagem: newContagem }
      : undefined

    await updateClienteEtapa(clienteId, targetEtapa, followupPatch)

    const etapaLabel = ETAPA_LABELS[targetEtapa]
    let atividadeTexto = `Movido para "${etapaLabel}"`
    if (followup) {
      const data = new Date(followup.followup_data + 'T12:00:00').toLocaleDateString('pt-BR')
      atividadeTexto += ` — ${newContagem}ª tentativa via ${followup.followup_canal} em ${data}`
      if (followup.nota) atividadeTexto += ` · Nota: ${followup.nota}`
    }
    await createAtividade(clienteId, atividadeTexto, followup ? 'follow_up' : 'nota')

    if (targetEtapa === 'proposta_aprovada') {
      await criarTarefasPropostaAprovada(clienteId, cliente.tem_suspensao)
    }

    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

async function criarTarefasPropostaAprovada(clienteId: string, temSuspensao: boolean) {
  const processoInfracao = await createProcesso(clienteId, 'infracao')
  await createTarefa(clienteId, processoInfracao.id, 'defesa_previa')

  if (temSuspensao) {
    const processoSuspensao = await createProcesso(clienteId, 'suspensao')
    await createTarefa(clienteId, processoSuspensao.id, 'defesa_previa')
  }

  await createAtividade(
    clienteId,
    `Proposta aprovada — tarefa(s) de Defesa Prévia criadas no Kanban de Execução${temSuspensao ? ' (Infração + Suspensão)' : ' (Infração)'}`,
    'proposta',
  )
}

export async function addAtividadeAction(
  clienteId: string,
  texto: string,
  tipo: Atividade['tipo'] = 'nota',
) {
  await requireAuth()
  try {
    await createAtividade(clienteId, texto, tipo)
    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function getAtividadesAction(clienteId: string) {
  await requireAuth()
  return listAtividades(clienteId)
}

export async function updateClienteAction(clienteId: string, data: Partial<import('@/types/crm').Cliente>) {
  await requireAuth()
  try {
    await updateCliente(clienteId, data)
    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function linkPropostaAction(clienteId: string, propostaId: string) {
  await requireAuth()
  try {
    await linkPropostaToCliente(clienteId, propostaId)
    await createAtividade(clienteId, `Proposta ${propostaId} gerada e vinculada ao cliente`, 'proposta')
    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
