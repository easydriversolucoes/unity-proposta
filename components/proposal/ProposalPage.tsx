import type { Proposal } from '@/types/proposal'
import { Header } from './Header'
import { HeroSection } from './HeroSection'
import { StatusSection } from './StatusSection'
import { RisksSection } from './RisksSection'
import { ModalitiesSection } from './ModalitiesSection'
import { ResultsSection } from './ResultsSection'
import { SignatureSection } from './SignatureSection'
import { Footer } from './Footer'

interface ProposalPageProps {
  proposal: Proposal
}

export function ProposalPage({ proposal }: ProposalPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#040C18' }}>
      <Header />
      <HeroSection
        clientName={proposal.nome_cliente}
        ait={proposal.ait}
        tipoInfracao={proposal.tipo_infracao}
        prazoValidade={proposal.prazo_validade}
      />
      <StatusSection />
      <RisksSection />
      <ModalitiesSection
        valorEssencial={proposal.valor_essencial}
        valorGestao={proposal.valor_gestao}
        linkPagamentoEssencial={proposal.link_pagamento_essencial}
        linkPagamentoGestao={proposal.link_pagamento_gestao}
      />
      <ResultsSection />
      <SignatureSection
        proposalId={proposal.id}
        clientName={proposal.nome_cliente}
        linkPagamentoEssencial={proposal.link_pagamento_essencial}
        linkPagamentoGestao={proposal.link_pagamento_gestao}
        valorEssencial={proposal.valor_essencial}
        valorGestao={proposal.valor_gestao}
      />
      <Footer />
    </div>
  )
}
