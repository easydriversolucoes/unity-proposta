'use server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  listTarefasAtivas, createTarefa, updateTarefaEtapa, arquivarTarefa,
  updateProcessoStatus, createAtividade, getProcesso, updateTarefa,
  listClientesPagamentoSimples, listProcessos, createProcesso,
} from '@/lib/supabase-crm'
import type { EtapaTarefa, FaseRecurso, TipoProcesso } from '@/types/crm'

export async function getTarefasAction() {
  await requireAuth()
  return listTarefasAtivas()
}

export async function moveTarefaAction(tarefaId: string, targetEtapa: EtapaTarefa) {
  await requireAuth()
  try {
    if (targetEtapa === 'protocolado') {
      return { ok: false as const, error: 'Use arquivarTarefaAction para protocolar.' }
    }
    await updateTarefaEtapa(tarefaId, targetEtapa)
    revalidatePath('/crm/execucao')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function updateTarefaAction(
  tarefaId: string,
  data: {
    urgente?: boolean
    responsavel?: string
    prazo?: string | null
    notas?: string | null
    data_agendamento_envio?: string | null
    data_agendamento_protocolo?: string | null
  },
) {
  await requireAuth()
  try {
    await updateTarefa(tarefaId, data)
    revalidatePath('/crm/execucao')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function agendarEnvioAction(tarefaId: string, dataAgendamento: string) {
  await requireAuth()
  try {
    await updateTarefa(tarefaId, {
      data_agendamento_envio: dataAgendamento,
      etapa: 'envio_agendado',
    })
    revalidatePath('/crm/execucao')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function agendarProtocoloAction(tarefaId: string, dataProtocolo: string) {
  await requireAuth()
  try {
    await updateTarefa(tarefaId, {
      data_agendamento_protocolo: dataProtocolo,
      etapa: 'aguardando_protocolo',
    })
    revalidatePath('/crm/execucao')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function arquivarTarefaAction(
  tarefaId: string,
  processoId: string | null,
  numeroProtocolo?: string,
  protocoladoPor?: string,
) {
  await requireAuth()
  try {
    await arquivarTarefa(tarefaId, numeroProtocolo)

    if (processoId) {
      await updateProcessoStatus(processoId, 'aguardando_resultado')
      const processo = await getProcesso(processoId)
      if (processo) {
        const quem = protocoladoPor === 'equipe' ? 'nossa equipe' : 'o próprio cliente'
        await createAtividade(
          processo.cliente_id,
          `Recurso protocolado por ${quem} — ${processo.tipo === 'infracao' ? 'Infração' : 'Suspensão'} · Fase: ${processo.fase_atual}${numeroProtocolo ? ` · Protocolo: ${numeroProtocolo}` : ''}. Aguardando resultado.`,
          'proposta',
        )
      }
    }

    revalidatePath('/crm/execucao')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function createTarefaManualAction(
  clienteId: string,
  processoId: string,
  fase: FaseRecurso,
  prazo?: string,
  notas?: string,
) {
  await requireAuth()
  try {
    const tarefa = await createTarefa(clienteId, processoId, fase, prazo, notas)
    await createAtividade(clienteId, `Tarefa manual criada: ${fase.replace('_', ' ')}`, 'nota')
    revalidatePath('/crm/execucao')
    return { ok: true as const, tarefa }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function createTarefaComProcessoAction(input: {
  clienteId: string
  tipo: TipoProcesso
  fase: FaseRecurso
  responsavel?: string
  prazo?: string
  urgente?: boolean
}) {
  await requireAuth()
  try {
    const processo = await createProcesso(input.clienteId, input.tipo)
    const tarefa = await createTarefa(input.clienteId, processo.id, input.fase, input.prazo)
    if (input.responsavel || input.urgente) {
      await updateTarefa(tarefa.id, {
        responsavel: input.responsavel ?? 'Pablo',
        urgente: input.urgente ?? false,
      })
    }
    await createAtividade(
      input.clienteId,
      `Tarefa manual: ${input.tipo === 'infracao' ? 'Infração' : 'Suspensão'} — ${input.fase.replace('_', ' ')}`,
      'nota',
    )
    revalidatePath('/crm/execucao')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function getClientesPagamentoAction() {
  await requireAuth()
  return listClientesPagamentoSimples()
}

export async function getClienteProcessosAction(clienteId: string) {
  await requireAuth()
  return listProcessos(clienteId)
}
