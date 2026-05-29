export type ProposalStatus = 'enviada' | 'visualizada' | 'em_analise' | 'contratada' | 'expirada'

export interface Proposal {
  id: string
  nome_cliente: string
  ait: string
  tipo_infracao: string
  valor_essencial: number
  valor_gestao: number
  link_pagamento_essencial: string | null
  link_pagamento_gestao: string | null
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
  valor_essencial: number
  valor_gestao: number
  link_pagamento_essencial?: string
  link_pagamento_gestao?: string
  prazo_validade?: string
  observacoes?: string
}
