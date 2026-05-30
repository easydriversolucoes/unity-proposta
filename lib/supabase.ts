import { createClient } from '@supabase/supabase-js'
import type { Proposal, CreateProposalInput, DadosContrato } from '@/types/proposal'

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY nas variáveis de ambiente.'
    )
  }
  return createClient(url, key)
}

function generateId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

export async function createProposal(data: CreateProposalInput): Promise<Proposal> {
  const client = supabaseAdmin()
  let id = generateId()

  let attempt = 0
  while (attempt < 5) {
    const { data: existing } = await client.from('propostas').select('id').eq('id', id).single()
    if (!existing) break
    id = generateId()
    attempt++
  }

  const { data: proposal, error } = await client
    .from('propostas')
    .insert({ id, ...data })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return proposal as Proposal
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const client = supabaseAdmin()
  const { data, error } = await client
    .from('propostas')
    .select('*')
    .eq('id', id.toUpperCase())
    .single()

  if (error || !data) return null
  return data as Proposal
}

export async function markAsViewed(id: string): Promise<void> {
  const client = supabaseAdmin()
  await client
    .from('propostas')
    .update({ viewed_at: new Date().toISOString(), status: 'visualizada' })
    .eq('id', id.toUpperCase())
    .eq('status', 'enviada')
}

export async function acceptProposal(id: string, plano: string, dadosContrato: DadosContrato): Promise<void> {
  const client = supabaseAdmin()
  await client
    .from('propostas')
    .update({
      accepted_at: new Date().toISOString(),
      status: 'aprovada',
      plano_aceito: plano,
      dados_contrato: dadosContrato,
    })
    .eq('id', id.toUpperCase())
}

export async function approveProposalManually(id: string): Promise<void> {
  const client = supabaseAdmin()
  await client
    .from('propostas')
    .update({ status: 'aprovada', accepted_at: new Date().toISOString() })
    .eq('id', id.toUpperCase())
    .in('status', ['enviada', 'visualizada', 'em_analise'])
}

export async function listProposals(): Promise<Proposal[]> {
  const client = supabaseAdmin()
  const { data, error } = await client
    .from('propostas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as Proposal[]
}
