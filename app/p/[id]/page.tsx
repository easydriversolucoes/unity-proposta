import { notFound } from 'next/navigation'
import { getProposal, markAsViewed } from '@/lib/supabase'
import { ProposalPage } from '@/components/proposal/ProposalPage'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const proposal = await getProposal(id)
  if (!proposal) return { title: 'Proposta não encontrada' }
  return {
    title: `Análise Estratégica — ${proposal.nome_cliente} | Unity Multas`,
    robots: 'noindex, nofollow',
  }
}

export default async function ProposalRoute({ params }: PageProps) {
  const { id } = await params
  const proposal = await getProposal(id)
  if (!proposal) notFound()

  // Await so Vercel serverless doesn't terminate before the update completes
  await markAsViewed(id).catch(() => {})

  return <ProposalPage proposal={proposal} />
}
