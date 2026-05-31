export type EtapaCRM =
  | 'novo_contato'
  | 'aguardando_informacoes'
  | 'proposta_enviada'
  | 'aguardando_resposta'
  | 'proposta_aprovada'
  | 'proposta_recusada'
  | 'contrato'
  | 'pagamento_realizado' // kept for backwards-compat; not shown in CRM board

export type EtapaTarefa =
  | 'a_redigir'
  | 'envio_agendado'
  | 'documentos_solicitados'
  | 'aguardando_protocolo'
  | 'protocolado'

export type FaseRecurso = 'defesa_previa' | 'jari' | 'cetran'
export type TipoProcesso = 'infracao' | 'suspensao'
export type StatusProcesso = 'em_andamento' | 'aguardando_resultado' | 'deferido' | 'indeferido'

export interface Cliente {
  id: string
  nome: string
  telefone: string | null
  whatsapp: string | null
  cpf: string | null
  placa: string | null
  orgao: string | null
  ait: string | null
  tipo_infracao: string | null
  origem: string | null
  tem_suspensao: boolean
  etapa: EtapaCRM
  followup_data: string | null
  followup_contagem: number
  followup_canal: string | null
  proposta_id: string | null
  pagamento_realizado_at: string | null
  created_at: string
}

export interface Atividade {
  id: string
  cliente_id: string
  texto: string
  tipo: 'follow_up' | 'nota' | 'proposta' | 'contato' | 'resultado'
  created_at: string
}

export interface ProcessoRecurso {
  id: string
  cliente_id: string
  tipo: TipoProcesso
  fase_atual: FaseRecurso
  status: StatusProcesso
  numero_protocolo: string | null
  data_protocolo: string | null
  created_at: string
}

export interface FaseRecursoRecord {
  id: string
  processo_id: string
  fase: FaseRecurso
  resultado: 'deferido' | 'indeferido' | null
  informado_por: 'cliente' | 'admin'
  notas: string | null
  created_at: string
}

export interface TarefaExecucao {
  id: string
  cliente_id: string | null
  processo_id: string | null
  fase: FaseRecurso
  etapa: EtapaTarefa
  status: 'ativa' | 'arquivada'
  urgente: boolean
  responsavel: string
  numero_protocolo: string | null
  prazo: string | null
  notas: string | null
  data_agendamento_envio: string | null
  data_agendamento_protocolo: string | null
  protocolado_por: string | null
  created_at: string
  arquivada_at: string | null
  clientes?: {
    nome: string
    ait: string | null
    tipo_infracao: string | null
    whatsapp: string | null
    telefone: string | null
  } | null
  processos_recurso?: { tipo: TipoProcesso } | null
}

export interface CreateClienteInput {
  nome: string
  telefone?: string
  whatsapp?: string
  cpf?: string
  placa?: string
  orgao?: string
  ait?: string
  tipo_infracao?: string
  origem?: string
  tem_suspensao?: boolean
}

export const ETAPA_LABELS: Record<EtapaCRM, string> = {
  novo_contato: 'Novo contato',
  aguardando_informacoes: 'Aguardando informações',
  proposta_enviada: 'Proposta enviada',
  aguardando_resposta: 'Aguardando resposta',
  proposta_aprovada: 'Proposta aprovada',
  proposta_recusada: 'Proposta recusada',
  contrato: 'Contrato',
  pagamento_realizado: 'Pagamento realizado',
}

export const FASE_LABELS: Record<FaseRecurso, string> = {
  defesa_previa: 'Defesa Prévia',
  jari: 'JARI',
  cetran: 'CETRAN',
}

export const TIPO_PROCESSO_LABELS: Record<TipoProcesso, string> = {
  infracao: 'Infração',
  suspensao: 'Suspensão',
}

// 'pagamento_realizado' removed from board — clients with that etapa move to execution
export const CRM_COLUMNS: Array<{ id: EtapaCRM; label: string; color: string }> = [
  { id: 'novo_contato', label: 'Novo contato', color: '#60A5FA' },
  { id: 'aguardando_informacoes', label: 'Aguardando informações', color: '#A78BFA' },
  { id: 'proposta_enviada', label: 'Proposta enviada', color: '#34D399' },
  { id: 'aguardando_resposta', label: 'Aguardando resposta', color: '#FBBF24' },
  { id: 'proposta_aprovada', label: 'Proposta aprovada', color: '#6EE7B7' },
  { id: 'proposta_recusada', label: 'Proposta recusada', color: '#F87171' },
  { id: 'contrato', label: 'Contrato', color: '#C4922A' },
]
