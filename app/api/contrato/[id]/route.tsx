import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { getProposal } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { ContratoPDF } from '@/components/pdf/ContratoPDF'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const proposal = await getProposal(id)

  if (!proposal) {
    return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 })
  }
  if (!proposal.dados_contrato) {
    return NextResponse.json(
      { error: 'Os dados do contrato ainda não foram preenchidos pelo cliente.' },
      { status: 422 },
    )
  }

  // Read logo as base64 data URI
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`

  const element = React.createElement(ContratoPDF, {
    proposal,
    dados: proposal.dados_contrato,
    logoBase64,
  })

  const pdfBuffer = await renderToBuffer(
    element as unknown as React.ReactElement<DocumentProps>,
  )

  const nomeSanitizado = proposal.nome_cliente
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()

  const filename = `contrato-${nomeSanitizado}-${id}.pdf`

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
