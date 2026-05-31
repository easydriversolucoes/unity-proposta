import { createClient } from '@supabase/supabase-js'
import type {
  Cliente, CreateClienteInput, Atividade,
  ProcessoRecurso, FaseRecursoRecord, TarefaExecucao,
  EtapaCRM, EtapaTarefa, FaseRecurso, StatusProcesso, TipoProcesso,
} from '@/types/crm'

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Supabase não configurado.')
  return createClient(url, key)
}

// ─── Clientes ────────────────────────────────────────────────────────────────

export async function listClientes(): Promise<Cliente[]> {
  const { data } = await db()
    .from('clientes')
    .select('*')
    .is('pagamento_realizado_at', null)
    .order('created_at', { ascending: false })
  return (data ?? []) as Cliente[]
}

export async function getCliente(id: string): Promise<Cliente | null> {
  const { data } = await db().from('clientes').select('*').eq('id', id).single()
  return data as Cliente | null
}

export async function getClienteByCredentials(cpf: string, placa: string): Promise<Cliente | null> {
  const cpfClean = cpf.replace(/\D/g, '')
  const placaClean = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const { data } = await db()
    .from('clientes')
    .select('*')
    .eq('cpf', cpfClean)
    .eq('placa', placaClean)
    .maybeSingle()
  return data as Cliente | null
}

export async function createCliente(input: CreateClienteInput): Promise<Cliente> {
  const clean: Record<string, unknown> = { ...input }
  if (input.cpf) clean.cpf = input.cpf.replace(/\D/g, '')
  if (input.placa) clean.placa = input.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const { data, error } = await db().from('clientes').insert(clean).select().single()
  if (error) throw new Error(error.message)
  return data as Cliente
}

export async function updateClienteEtapa(
  id: string,
  etapa: EtapaCRM,
  followup?: { followup_data: string; followup_canal: string; followup_contagem: number },
): Promise<void> {
  const patch: Record<string, unknown> = { etapa }
  if (followup) Object.assign(patch, followup)
  await db().from('clientes').update(patch).eq('id', id)
}

export async function updateCliente(id: string, data: Partial<Cliente>): Promise<void> {
  await db().from('clientes').update(data).eq('id', id)
}

export async function linkPropostaToCliente(clienteId: string, propostaId: string): Promise<void> {
  await db().from('clientes').update({ proposta_id: propostaId }).eq('id', clienteId)
}

export async function getClienteByPropostaId(propostaId: string): Promise<Cliente | null> {
  const { data } = await db()
    .from('clientes')
    .select('*')
    .eq('proposta_id', propostaId)
    .maybeSingle()
  return data as Cliente | null
}

export async function getClientesTelefoneMap(): Promise<Record<string, string | null>> {
  const { data } = await db()
    .from('clientes')
    .select('proposta_id, telefone, whatsapp')
    .not('proposta_id', 'is', null)
  if (!data) return {}
  return Object.fromEntries(
    data.map((c: { proposta_id: string; telefone: string | null; whatsapp: string | null }) => [
      c.proposta_id,
      c.whatsapp ?? c.telefone ?? null,
    ]),
  )
}

export async function moverClienteAutomatico(propostaId: string, novaEtapa: EtapaCRM): Promise<void> {
  const cliente = await getClienteByPropostaId(propostaId)
  if (!cliente) return
  await updateClienteEtapa(cliente.id, novaEtapa)
  await createAtividade(
    cliente.id,
    `Movido automaticamente para "${novaEtapa.replace(/_/g, ' ')}" (gatilho: proposta)`,
    'proposta',
  )
}

export async function registrarPagamento(clienteId: string): Promise<void> {
  await db()
    .from('clientes')
    .update({ etapa: 'pagamento_realizado', pagamento_realizado_at: new Date().toISOString() })
    .eq('id', clienteId)
}

export async function listClientesPagamento(): Promise<Cliente[]> {
  const { data } = await db()
    .from('clientes')
    .select('*')
    .not('pagamento_realizado_at', 'is', null)
    .order('pagamento_realizado_at', { ascending: false })
  return (data ?? []) as Cliente[]
}

export async function listClientesPagamentoSimples(): Promise<{ id: string; nome: string; ait: string | null; tem_suspensao: boolean; pagamento_realizado_at: string | null }[]> {
  const { data } = await db()
    .from('clientes')
    .select('id, nome, ait, tem_suspensao, pagamento_realizado_at')
    .not('pagamento_realizado_at', 'is', null)
    .order('nome', { ascending: true })
  return (data ?? []) as { id: string; nome: string; ait: string | null; tem_suspensao: boolean; pagamento_realizado_at: string | null }[]
}

export async function listFollowUpsAgendados(): Promise<Cliente[]> {
  const { data } = await db()
    .from('clientes')
    .select('*')
    .not('followup_data', 'is', null)
    .order('followup_data', { ascending: true })
  return (data ?? []) as Cliente[]
}

export async function clearFollowUp(clienteId: string): Promise<void> {
  await db()
    .from('clientes')
    .update({ followup_data: null, followup_canal: null })
    .eq('id', clienteId)
}

export async function listFollowupsHoje(): Promise<Cliente[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await db()
    .from('clientes')
    .select('*')
    .eq('followup_data', today)
    .eq('etapa', 'aguardando_resposta')
  return (data ?? []) as Cliente[]
}

export async function getNotificacoes() {
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [followupsVencidos, followupsHoje, resultadosRecentes, propostasRecentes] = await Promise.all([
    db()
      .from('clientes')
      .select('*')
      .lt('followup_data', today)
      .eq('etapa', 'aguardando_resposta')
      .order('followup_data', { ascending: true })
      .then((r) => (r.data ?? []) as Cliente[]),

    db()
      .from('clientes')
      .select('*')
      .eq('followup_data', today)
      .eq('etapa', 'aguardando_resposta')
      .then((r) => (r.data ?? []) as Cliente[]),

    db()
      .from('atividades')
      .select('*')
      .eq('tipo', 'resultado')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })
      .limit(20)
      .then((r) => (r.data ?? []) as Atividade[]),

    db()
      .from('propostas')
      .select('*')
      .eq('status', 'contratada')
      .gte('accepted_at', sevenDaysAgo)
      .order('accepted_at', { ascending: false })
      .limit(10)
      .then((r) => r.data ?? []),
  ])

  return { followupsVencidos, followupsHoje, resultadosRecentes, propostasRecentes }
}

// ─── Atividades ───────────────────────────────────────────────────────────────

export async function listAtividades(clienteId: string): Promise<Atividade[]> {
  const { data } = await db()
    .from('atividades')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
  return (data ?? []) as Atividade[]
}

export async function createAtividade(
  clienteId: string,
  texto: string,
  tipo: Atividade['tipo'] = 'nota',
): Promise<void> {
  await db().from('atividades').insert({ cliente_id: clienteId, texto, tipo })
}

// ─── Processos ────────────────────────────────────────────────────────────────

export async function listProcessos(clienteId: string): Promise<ProcessoRecurso[]> {
  const { data } = await db()
    .from('processos_recurso')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: true })
  return (data ?? []) as ProcessoRecurso[]
}

export async function getProcesso(id: string): Promise<ProcessoRecurso | null> {
  const { data } = await db().from('processos_recurso').select('*').eq('id', id).single()
  return data as ProcessoRecurso | null
}

export async function createProcesso(clienteId: string, tipo: TipoProcesso): Promise<ProcessoRecurso> {
  const { data, error } = await db()
    .from('processos_recurso')
    .insert({ cliente_id: clienteId, tipo })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ProcessoRecurso
}

export async function updateProcessoStatus(
  id: string,
  status: StatusProcesso,
  faseAtual?: FaseRecurso,
): Promise<void> {
  const patch: Record<string, unknown> = { status }
  if (faseAtual) patch.fase_atual = faseAtual
  await db().from('processos_recurso').update(patch).eq('id', id)
}

// ─── Fases ────────────────────────────────────────────────────────────────────

export async function listFases(processoId: string): Promise<FaseRecursoRecord[]> {
  const { data } = await db()
    .from('fases_recurso')
    .select('*')
    .eq('processo_id', processoId)
    .order('created_at', { ascending: true })
  return (data ?? []) as FaseRecursoRecord[]
}

export async function createFaseRecord(
  processoId: string,
  fase: FaseRecurso,
  resultado: 'deferido' | 'indeferido',
  informadoPor: 'cliente' | 'admin' = 'cliente',
  notas?: string,
): Promise<void> {
  await db().from('fases_recurso').insert({
    processo_id: processoId,
    fase,
    resultado,
    informado_por: informadoPor,
    notas,
  })
}

export async function listProcessosComFases(
  clienteId: string,
): Promise<Array<ProcessoRecurso & { fases: FaseRecursoRecord[] }>> {
  const processos = await listProcessos(clienteId)
  return Promise.all(processos.map(async (p) => ({ ...p, fases: await listFases(p.id) })))
}

// ─── Tarefas ──────────────────────────────────────────────────────────────────

export async function listTarefasAtivas(): Promise<TarefaExecucao[]> {
  const { data } = await db()
    .from('tarefas_execucao')
    .select('*, clientes(nome, ait, tipo_infracao, whatsapp, telefone), processos_recurso(tipo)')
    .eq('status', 'ativa')
    .order('created_at', { ascending: true })
  return (data ?? []) as TarefaExecucao[]
}

export async function updateTarefa(id: string, data: Partial<TarefaExecucao>): Promise<void> {
  const allowed = ['urgente', 'responsavel', 'prazo', 'notas', 'etapa', 'fase',
    'data_agendamento_envio', 'data_agendamento_protocolo', 'protocolado_por']
  const patch: Record<string, unknown> = {}
  for (const k of allowed) if (k in data) patch[k] = (data as Record<string, unknown>)[k]
  const { error } = await db().from('tarefas_execucao').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function createTarefa(
  clienteId: string,
  processoId: string,
  fase: FaseRecurso,
  prazo?: string,
  notas?: string,
): Promise<TarefaExecucao> {
  const { data, error } = await db()
    .from('tarefas_execucao')
    .insert({ cliente_id: clienteId, processo_id: processoId, fase, prazo, notas })
    .select('*, clientes(nome, ait, tipo_infracao), processos_recurso(tipo)')
    .single()
  if (error) throw new Error(error.message)
  return data as TarefaExecucao
}

export async function updateTarefaEtapa(id: string, etapa: EtapaTarefa): Promise<void> {
  const { error } = await db().from('tarefas_execucao').update({ etapa }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function arquivarTarefa(id: string, numeroProtocolo?: string): Promise<void> {
  await db()
    .from('tarefas_execucao')
    .update({
      status: 'arquivada',
      etapa: 'protocolado',
      arquivada_at: new Date().toISOString(),
      ...(numeroProtocolo ? { numero_protocolo: numeroProtocolo } : {}),
    })
    .eq('id', id)
}
