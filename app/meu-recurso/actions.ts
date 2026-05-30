'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import {
  getClienteByCredentials, getProcesso, createFaseRecord,
  updateProcessoStatus, createAtividade, createTarefa, listProcessosComFases,
} from '@/lib/supabase-crm'
import { sendTelegram } from '@/lib/telegram'
import type { FaseRecurso } from '@/types/crm'
import { FASE_LABELS, TIPO_PROCESSO_LABELS } from '@/types/crm'

const COOKIE = 'unity_cliente_id'

const NEXT_FASE: Record<FaseRecurso, FaseRecurso | null> = {
  defesa_previa: 'jari',
  jari: 'cetran',
  cetran: null,
}

export async function loginClienteAction(cpf: string, placa: string) {
  try {
    const cliente = await getClienteByCredentials(cpf, placa)
    if (!cliente) return { ok: false as const, error: 'CPF ou placa não encontrados. Verifique os dados e tente novamente.' }

    const store = await cookies()
    store.set(COOKIE, cliente.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })
    return { ok: true as const }
  } catch {
    return { ok: false as const, error: 'Erro ao verificar os dados. Tente novamente.' }
  }
}

export async function logoutClienteAction() {
  const store = await cookies()
  store.delete(COOKIE)
}

export async function getClienteIdFromSession(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE)?.value ?? null
}

export async function informarResultadoAction(
  processoId: string,
  fase: FaseRecurso,
  resultado: 'deferido' | 'indeferido',
  notas?: string,
) {
  const store = await cookies()
  const clienteId = store.get(COOKIE)?.value
  if (!clienteId) return { ok: false as const, error: 'Sessão expirada. Faça login novamente.' }

  try {
    const processo = await getProcesso(processoId)
    if (!processo || processo.cliente_id !== clienteId) {
      return { ok: false as const, error: 'Não autorizado.' }
    }
    if (processo.status !== 'aguardando_resultado') {
      return { ok: false as const, error: 'Este processo não está aguardando resultado.' }
    }

    await createFaseRecord(processoId, fase, resultado, 'cliente', notas)

    const tipoLabel = TIPO_PROCESSO_LABELS[processo.tipo]
    const faseLabel = FASE_LABELS[fase]

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

    if (resultado === 'deferido') {
      await updateProcessoStatus(processoId, 'deferido')
      await createAtividade(clienteId, `${tipoLabel} DEFERIDA na fase ${faseLabel}. Processo encerrado com sucesso.`, 'resultado')
      await sendTelegram(
        `✅ <b>DEFERIDO</b> — Resultado informado pelo cliente\n\n` +
        `Processo: <b>${tipoLabel}</b>\n` +
        `Fase: <b>${faseLabel}</b>\n` +
        `Resultado: <b>✅ DEFERIDO</b>\n\n` +
        `Nenhuma ação necessária. Processo encerrado.${baseUrl ? `\n\n<a href="${baseUrl}/admin">Ver painel</a>` : ''}`,
      )
    } else {
      const nextFase = NEXT_FASE[fase]
      if (nextFase) {
        await updateProcessoStatus(processoId, 'em_andamento', nextFase)
        await createTarefa(clienteId, processoId, nextFase)
        await createAtividade(
          clienteId,
          `${tipoLabel} INDEFERIDA na fase ${faseLabel}. Nova tarefa criada para ${FASE_LABELS[nextFase]}.`,
          'resultado',
        )
        await sendTelegram(
          `❌ <b>INDEFERIDO</b> — Resultado informado pelo cliente\n\n` +
          `Processo: <b>${tipoLabel}</b>\n` +
          `Fase: <b>${faseLabel}</b>\n` +
          `Resultado: <b>❌ INDEFERIDO</b>\n\n` +
          `Próxima fase: <b>${FASE_LABELS[nextFase]}</b>\n` +
          `Nova tarefa criada no Kanban de Execução.${baseUrl ? `\n\n<a href="${baseUrl}/crm/execucao">Ver execução</a>` : ''}`,
        )
      } else {
        await updateProcessoStatus(processoId, 'indeferido')
        await createAtividade(
          clienteId,
          `${tipoLabel} INDEFERIDA no CETRAN. Esgotadas as instâncias administrativas.`,
          'resultado',
        )
        await sendTelegram(
          `❌ <b>INDEFERIDO FINAL</b> — Resultado informado pelo cliente\n\n` +
          `Processo: <b>${tipoLabel}</b>\n` +
          `Fase: <b>CETRAN</b>\n\n` +
          `Instâncias administrativas esgotadas.${baseUrl ? `\n\n<a href="${baseUrl}/admin">Ver painel</a>` : ''}`,
        )
      }
    }

    revalidatePath('/meu-recurso')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : 'Erro ao registrar resultado.' }
  }
}

export async function getPortalDataAction() {
  const store = await cookies()
  const clienteId = store.get(COOKIE)?.value
  if (!clienteId) return null

  try {
    const { getCliente } = await import('@/lib/supabase-crm')
    const [cliente, processos] = await Promise.all([
      getCliente(clienteId),
      listProcessosComFases(clienteId),
    ])
    if (!cliente) return null
    return { cliente, processos }
  } catch {
    return null
  }
}
