import type { Proposal } from '@/types/proposal'
import { Header } from './Header'
import { HeroSection } from './HeroSection'
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
      <ModalitiesSection
        valorEssencialPix={proposal.valor_essencial_pix}
        valorEssencialCartao={proposal.valor_essencial_cartao}
        valorGestaoPix={proposal.valor_gestao_pix}
        valorGestaoCartao={proposal.valor_gestao_cartao}
      />
      <ResultsSection />
      <SignatureSection
        proposalId={proposal.id}
        clientName={proposal.nome_cliente}
        ait={proposal.ait}
        valorEssencialPix={proposal.valor_essencial_pix}
        valorEssencialCartao={proposal.valor_essencial_cartao}
        valorGestaoPix={proposal.valor_gestao_pix}
        valorGestaoCartao={proposal.valor_gestao_cartao}
      />
      <Footer />
    </div>
  )
}
