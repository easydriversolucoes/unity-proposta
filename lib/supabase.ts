import { createClient } from '@supabase/supabase-js'
import type { Proposal, CreateProposalInput } from '@/types/proposal'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side client (uses service key, never exposed to browser)
export const supabaseAdmin = () =>
  createClient(supabaseUrl, supabaseServiceKey)

// Browser-safe client
export const supabaseBrowser = () =>
  createClient(supabaseUrl, supabaseAnonKey)

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

  // Ensure unique ID
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

export async function acceptProposal(id: string, plano: string): Promise<void> {
  const client = supabaseAdmin()
  await client
    .from('propostas')
    .update({
      accepted_at: new Date().toISOString(),
      status: 'contratada',
      plano_aceito: plano,
    })
    .eq('id', id.toUpperCase())
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
