import { NextResponse } from 'next/server'
import { listFollowupsHoje } from '@/lib/supabase-crm'
import { sendTelegram } from '@/lib/telegram'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientes = await listFollowupsHoje()
  if (clientes.length === 0) {
    return NextResponse.json({ message: 'Nenhum follow-up hoje.' })
  }

  const linhas = clientes.map((c) => {
    const tentativa = c.followup_contagem > 0 ? ` (${c.followup_contagem}ª tentativa)` : ''
    const canal = c.followup_canal ? ` via ${c.followup_canal}` : ''
    return `• <b>${c.nome}</b>${tentativa}${canal}${c.ait ? ` · AIT ${c.ait}` : ''}`
  })

  await sendTelegram(
    `📋 <b>Follow-ups de Hoje</b> — ${new Date().toLocaleDateString('pt-BR')}\n\n` +
    linhas.join('\n') +
    `\n\nTotal: ${clientes.length} cliente${clientes.length !== 1 ? 's' : ''}`,
  )

  return NextResponse.json({ sent: clientes.length })
}
