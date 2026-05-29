'use server'
import { cookies } from 'next/headers'
import { createProposal, listProposals } from '@/lib/supabase'
import type { CreateProposalInput } from '@/types/proposal'

const COOKIE_NAME = 'unity_admin'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24h

export async function loginAction(password: string): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return { ok: false, error: 'Servidor não configurado.' }
  if (password !== secret) return { ok: false, error: 'Senha incorreta.' }

  const store = await cookies()
  store.set(COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return { ok: true }
}

export async function logoutAction(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function createProposalAction(
  input: CreateProposalInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const proposal = await createProposal(input)
    return { ok: true, id: proposal.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido.' }
  }
}

export async function getProposalsAction() {
  return listProposals()
}
