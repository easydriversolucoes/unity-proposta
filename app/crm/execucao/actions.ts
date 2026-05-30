'use server'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import {
  listTarefasAtivas, createTarefa, updateTarefaEtapa, arquivarTarefa,
  updateProcessoStatus, createAtividade, getProcesso,
} from '@/lib/supabase-crm'
import type { EtapaTarefa, FaseRecurso } from '@/types/crm'

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

export async function arquivarTarefaAction(tarefaId: string, processoId: string | null, numeroProtocolo?: string) {
  await requireAuth()
  try {
    await arquivarTarefa(tarefaId, numeroProtocolo)

    if (processoId) {
      await updateProcessoStatus(processoId, 'aguardando_resultado')
      const processo = await getProcesso(processoId)
      if (processo) {
        await createAtividade(
          processo.cliente_id,
          `Recurso protocolado — ${processo.tipo === 'infracao' ? 'Infração' : 'Suspensão'} · Fase: ${processo.fase_atual}${numeroProtocolo ? ` · Protocolo: ${numeroProtocolo}` : ''}. Aguardando resultado.`,
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
