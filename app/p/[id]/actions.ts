'use server'
import { acceptProposal } from '@/lib/supabase'

export async function acceptProposalAction(id: string, plano: string): Promise<void> {
  await acceptProposal(id, plano)
}
