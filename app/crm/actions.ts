'use server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  listClientes, getCliente, createCliente, updateClienteEtapa, updateCliente,
  createAtividade, listAtividades, linkPropostaToCliente,
  createProcesso, createTarefa, clearFollowUp, listFollowUpsAgendados,
  registrarPagamento,
} from '@/lib/supabase-crm'
import { marcarPropostaContratada } from '@/lib/supabase'
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

    // Tasks are created on payment registration, not on proposal approval

    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function registrarPagamentoAction(clienteId: string): Promise<{ ok: boolean; error?: string }> {
  await requireAuth()
  try {
    const cliente = await getCliente(clienteId)
    if (!cliente) throw new Error('Cliente não encontrado')

    await registrarPagamento(clienteId)

    // Update proposta to 'contratada' so it leaves the proposals list
    if (cliente.proposta_id) {
      await marcarPropostaContratada(cliente.proposta_id).catch(() => {})
    }

    // Create execution tasks (if none exist yet)
    await criarTarefasPropostaAprovada(clienteId, cliente.tem_suspensao)

    await createAtividade(clienteId, 'Pagamento registrado — cliente enviado para Execução', 'proposta')
    revalidatePath('/crm')
    revalidatePath('/crm/execucao')
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

export async function scheduleFollowUpAction(
  clienteId: string,
  data: { followup_data: string; followup_canal: string; nota?: string },
) {
  await requireAuth()
  try {
    const cliente = await getCliente(clienteId)
    if (!cliente) throw new Error('Cliente não encontrado')

    const newContagem = cliente.followup_contagem + 1
    await updateClienteEtapa(clienteId, cliente.etapa, {
      followup_data: data.followup_data,
      followup_canal: data.followup_canal,
      followup_contagem: newContagem,
    })

    const dataFmt = new Date(data.followup_data + 'T12:00:00').toLocaleDateString('pt-BR')
    let texto = `Follow-up ${newContagem}ª tentativa agendado para ${dataFmt} via ${data.followup_canal}`
    if (data.nota) texto += ` · ${data.nota}`
    await createAtividade(clienteId, texto, 'follow_up')
    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function getFollowUpsAction() {
  await requireAuth()
  return listFollowUpsAgendados()
}

export async function registrarContatoAction(
  clienteId: string,
  nota: string,
  novoFollowUp?: { followup_data: string; followup_canal: string },
) {
  await requireAuth()
  try {
    const cliente = await getCliente(clienteId)
    if (!cliente) throw new Error('Cliente não encontrado')

    const textoContato = nota.trim() || `Contato realizado via ${cliente.followup_canal ?? 'canal não especificado'}`
    await createAtividade(clienteId, textoContato, 'contato')

    if (novoFollowUp) {
      const newContagem = cliente.followup_contagem + 1
      await updateClienteEtapa(clienteId, cliente.etapa, {
        followup_data: novoFollowUp.followup_data,
        followup_canal: novoFollowUp.followup_canal,
        followup_contagem: newContagem,
      })
      const dataFmt = new Date(novoFollowUp.followup_data + 'T12:00:00').toLocaleDateString('pt-BR')
      await createAtividade(
        clienteId,
        `Próximo follow-up agendado para ${dataFmt} via ${novoFollowUp.followup_canal}`,
        'follow_up',
      )
    } else {
      await clearFollowUp(clienteId)
    }

    revalidatePath('/followups')
    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function reagendarFollowUpAction(
  clienteId: string,
  followup_data: string,
  followup_canal: string,
  nota?: string,
) {
  await requireAuth()
  try {
    const cliente = await getCliente(clienteId)
    if (!cliente) throw new Error('Cliente não encontrado')

    const newContagem = cliente.followup_contagem + 1
    await updateClienteEtapa(clienteId, cliente.etapa, {
      followup_data,
      followup_canal,
      followup_contagem: newContagem,
    })
    const dataFmt = new Date(followup_data + 'T12:00:00').toLocaleDateString('pt-BR')
    let texto = `Follow-up reagendado: ${newContagem}ª tentativa em ${dataFmt} via ${followup_canal}`
    if (nota?.trim()) texto += ` · ${nota.trim()}`
    await createAtividade(clienteId, texto, 'follow_up')

    revalidatePath('/followups')
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
    // Move automatically to "proposta_enviada"
    await updateClienteEtapa(clienteId, 'proposta_enviada')
    await createAtividade(clienteId, `Proposta ${propostaId} gerada — movido para "Proposta enviada"`, 'proposta')
    revalidatePath('/crm')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
