import { cookies } from 'next/headers'

export async function isAuthenticated(): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  const store = await cookies()
  return store.get('unity_admin')?.value === secret
}

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated()
  if (!authed) throw new Error('Não autorizado')
}
