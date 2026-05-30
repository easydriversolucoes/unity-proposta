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
  const isApproved = proposal.status === 'aprovada' || proposal.status === 'contratada'

  // Once approved, never show the proposal again — only show the contract form or done screen
  if (isApproved) {
    return (
      <div style={{ minHeight: '100vh', background: '#040C18' }}>
        <Header />
        <SignatureSection
          proposalId={proposal.id}
          clientName={proposal.nome_cliente}
          ait={proposal.ait}
          valorEssencialPix={proposal.valor_essencial_pix}
          valorEssencialCartao={proposal.valor_essencial_cartao}
          parcelasEssencial={proposal.parcelas_essencial}
          valorGestaoPix={proposal.valor_gestao_pix}
          valorGestaoCartao={proposal.valor_gestao_cartao}
          parcelasGestao={proposal.parcelas_gestao}
          mostrarGestao={proposal.mostrar_gestao}
          proposalStatus={proposal.status}
          dadosContrato={proposal.dados_contrato}
          planoAceito={proposal.plano_aceito}
        />
        <Footer />
      </div>
    )
  }

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
        parcelasEssencial={proposal.parcelas_essencial}
        valorGestaoPix={proposal.valor_gestao_pix}
        valorGestaoCartao={proposal.valor_gestao_cartao}
        parcelasGestao={proposal.parcelas_gestao}
        mostrarGestao={proposal.mostrar_gestao}
      />
      <ResultsSection />
      <SignatureSection
        proposalId={proposal.id}
        clientName={proposal.nome_cliente}
        ait={proposal.ait}
        valorEssencialPix={proposal.valor_essencial_pix}
        valorEssencialCartao={proposal.valor_essencial_cartao}
        parcelasEssencial={proposal.parcelas_essencial}
        valorGestaoPix={proposal.valor_gestao_pix}
        valorGestaoCartao={proposal.valor_gestao_cartao}
        parcelasGestao={proposal.parcelas_gestao}
        mostrarGestao={proposal.mostrar_gestao}
        proposalStatus={proposal.status}
        dadosContrato={proposal.dados_contrato}
        planoAceito={proposal.plano_aceito}
      />
      <Footer />
    </div>
  )
}
