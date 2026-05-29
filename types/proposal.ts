export type ProposalStatus = 'enviada' | 'visualizada' | 'em_analise' | 'contratada' | 'expirada'

export interface Proposal {
  id: string
  nome_cliente: string
  ait: string
  tipo_infracao: string
  valor_essencial_pix: number
  valor_essencial_cartao: number
  parcelas_essencial: number
  valor_gestao_pix: number
  valor_gestao_cartao: number
  parcelas_gestao: number
  mostrar_gestao: boolean
  prazo_validade: string | null
  observacoes: string | null
  status: ProposalStatus
  created_at: string
  viewed_at: string | null
  accepted_at: string | null
  plano_aceito: string | null
}

export interface CreateProposalInput {
  nome_cliente: string
  ait: string
  tipo_infracao: string
  valor_essencial_pix: number
  valor_essencial_cartao: number
  parcelas_essencial: number
  valor_gestao_pix: number
  valor_gestao_cartao: number
  parcelas_gestao: number
  mostrar_gestao: boolean
  prazo_validade?: string
  observacoes?: string
}
