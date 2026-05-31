// Server-only — never import in client components
import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import type { Proposal, DadosContrato } from '@/types/proposal'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function dataHoje(cidade: string, estado: string) {
  const d = new Date()
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  return `${cidade} – ${estado}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`
}

function buildPaymentText(p: Proposal): string {
  const { plano_aceito, valor_essencial_pix, valor_essencial_cartao, parcelas_essencial,
          valor_gestao_pix, valor_gestao_cartao, parcelas_gestao } = p

  if (!plano_aceito) {
    return `${fmtBRL(valor_essencial_pix)} via PIX ou ${fmtBRL(valor_essencial_cartao)} via cartão de crédito`
  }

  const isGestao = plano_aceito.startsWith('essencial+gestao')
  const isCartao = plano_aceito.endsWith('cartao')

  const valor = isGestao
    ? (isCartao ? valor_essencial_cartao + valor_gestao_cartao : valor_essencial_pix + valor_gestao_pix)
    : (isCartao ? valor_essencial_cartao : valor_essencial_pix)

  const parcelas = isGestao
    ? Math.max(parcelas_essencial, parcelas_gestao)
    : parcelas_essencial

  if (isCartao && parcelas > 1) {
    return `${fmtBRL(valor)} via cartão de crédito em ${parcelas}x de ${fmtBRL(valor / parcelas)}`
  }
  return `${fmtBRL(valor)} via ${isCartao ? 'cartão de crédito (à vista)' : 'PIX'}`
}

function planoLabel(plano: string | null): string {
  if (!plano) return 'Defesa Estratégica'
  if (plano.startsWith('essencial+gestao')) return 'Defesa Estratégica + Gestão de Notificações'
  return 'Defesa Estratégica'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 52,
    color: '#111111',
    lineHeight: 1.55,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderBottomStyle: 'solid',
  },
  logo: {
    width: 36,
    height: 36,
    objectFit: 'contain',
  },
  headerText: {
    marginLeft: 10,
  },
  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: '#1A56DB',
    letterSpacing: 1.5,
  },
  companyTagline: {
    fontSize: 7.5,
    color: '#888888',
    marginTop: 2,
  },
  contractTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 10,
  },
  sectionHeading: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    marginTop: 14,
    marginBottom: 6,
  },
  clauseTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    marginTop: 12,
    marginBottom: 5,
  },
  text: {
    fontSize: 9.5,
    textAlign: 'justify',
    marginBottom: 5,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  indented: {
    paddingLeft: 14,
    fontSize: 9.5,
    textAlign: 'justify',
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    borderBottomStyle: 'solid',
    marginVertical: 10,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 44,
  },
  signatureBlock: {
    width: '44%',
  },
  signatureCity: {
    fontSize: 9,
    marginBottom: 24,
    color: '#333333',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    borderTopStyle: 'solid',
    marginBottom: 5,
  },
  signatureName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 8.5,
    textAlign: 'center',
    color: '#444444',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 30,
    right: 52,
    color: '#AAAAAA',
  },
})

// ─── Paragraph helpers ────────────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return <Text style={S.text}>{children}</Text>
}

function B({ children }: { children: React.ReactNode }) {
  return <Text style={S.bold}>{children}</Text>
}

function Ind({ children }: { children: React.ReactNode }) {
  return <Text style={S.indented}>{children}</Text>
}

// ─── Contract PDF ─────────────────────────────────────────────────────────────

interface Props {
  proposal: Proposal
  dados: DadosContrato
  logoBase64: string
}

export function ContratoPDF({ proposal, dados, logoBase64 }: Props) {
  const clienteEndereco = `${dados.endereco}, ${dados.numero}, ${dados.bairro}, ${dados.cidade} – ${dados.estado}, CEP ${dados.cep}`
  const paymentText = buildPaymentText(proposal)
  const servicoLabel = planoLabel(proposal.plano_aceito)
  const dataCampinas = `Campinas – SP, ${(() => {
    const d = new Date()
    const m = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
    return `${d.getDate()} de ${m[d.getMonth()]} de ${d.getFullYear()}`
  })()}`
  const dataCliente = dataHoje(dados.cidade, dados.estado)

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Image src={logoBase64} style={S.logo} />
          <View style={S.headerText}>
            <Text style={S.companyName}>UNITY MULTAS</Text>
            <Text style={S.companyTagline}>Soluções em Trânsito · www.unitymultas.com.br</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={S.contractTitle}>
          CONTRATO DE PRESTAÇÃO DE SERVIÇOS – DEFESA CONTRA AUTUAÇÃO POR INFRAÇÃO DE TRÂNSITO (ESFERA ADMINISTRATIVA)
        </Text>

        {/* Parties */}
        <Text style={S.sectionHeading}>AS PARTES</Text>

        <Text style={S.clauseTitle}>CONTRATANTE:</Text>
        <P>
          <B>{dados.nome.toUpperCase()}</B>, inscrito(a) sob o CPF n° {dados.cpf}, RG n° {dados.rg}, com endereço em {clienteEndereco}, endereço eletrônico {dados.email}.
        </P>

        <Text style={S.clauseTitle}>CONTRATADO:</Text>
        <P>
          Pessoa jurídica sob o nome de <B>UNITY MULTAS – SOLUÇÕES EM TRÂNSITO</B>, razão social 46.122.484 LIDIANE AZEVEDO, inscrita sob o n° de CNPJ: 46.122.484/0001-42, site www.unitymultas.com.br, com sede na Rua Gustavo Ambrust, 36, Nova Campinas, Campinas – SP, CEP 13.092-106.
        </P>

        <View style={S.divider} />

        {/* Cláusula 1 */}
        <Text style={S.clauseTitle}>CLÁUSULA 1ª – DO OBJETO DE CONTRATAÇÃO – PROCESSO ADMINISTRATIVO</Text>
        <P>
          1. O presente contrato refere-se exclusivamente ao processo administrativo ensejado pelo Auto de Infração n° <B>{proposal.ait}</B> ({proposal.tipo_infracao}) — Serviço: <B>{servicoLabel}</B>.
        </P>

        {/* Cláusula 2 */}
        <Text style={S.clauseTitle}>CLÁUSULA 2ª – DAS OBRIGAÇÕES DO CONTRATADO</Text>
        <P>Constitui ainda, obrigações do CONTRATADO:</P>
        <P>
          2. O CONTRATADO deverá prestar, com a devida dedicação e seriedade e da forma e do modo ajustados, os serviços descritos neste contrato, utilizando-se de documentos – se houver e se fizerem necessários –, bem como argumentação e fundamentação no que couber quanto às leis federais, estaduais, orgânicas, resoluções, deliberações, portarias, pareceres e decisões administrativas ou judiciais.
        </P>
        <P>
          3. O CONTRATADO deverá promover a redação de defesa ou recurso administrativo de maneira ética, obedecendo a legislação vigente, ou seja, sem utilizar-se de qualquer meio ilícito.
        </P>
        <P>
          4. O CONTRATADO deverá redigir a defesa e recursos das instâncias recursais (defesa prévia, JARI e CETRAN) do referido processo administrativo de infração.
        </P>
        <P>
          5. O CONTRATADO se obriga a prestar orientações ao CONTRATANTE quanto ao processo e procedimentos a serem adotados pelas partes, bem como andamento interno do feito, por meio da Área do Cliente disponível no site. Na hipótese de inoperância da Área do Cliente, o CONTRATANTE poderá prestar orientações via WhatsApp.
        </P>

        {/* Cláusula 3 */}
        <Text style={S.clauseTitle}>CLÁUSULA 3ª – DA RETRIBUIÇÃO</Text>
        <P>
          7. Em retribuição pelos serviços descritos, o CONTRATANTE pagará ao CONTRATADO o valor de: <B>{paymentText}</B>.
        </P>
        <P>
          Parágrafo único. Trata-se de cobrança única, de modo que não haverá qualquer cobrança adicional, seja antes, durante ou após conclusão dos serviços.
        </P>
        <P>
          8. O presente contrato, em consonância à natureza da profissão e ética profissional, consiste em obrigação de meio e não de resultado, portanto, compromete-se o CONTRATADO em empregar seus conhecimentos e meios técnicos objetivando a obtenção de deferimento (resultado positivo). Assim, a retribuição contratada será devida no caso de êxito ou não da demanda, ou do desfecho do assunto tratado.
        </P>

        {/* Cláusula 4 */}
        <Text style={S.clauseTitle}>CLÁUSULA 4ª – DAS OBRIGAÇÕES DO CONTRATANTE</Text>
        <P>Constitui obrigações do CONTRATANTE:</P>
        <P>
          9. O CONTRATANTE deverá promover a devida assinatura da defesa, bem como deverá fornecer ao CONTRATADO – em tempo hábil, conforme prévia solicitação – informações e documentos solicitados que possibilitem a redação da defesa, bem como demais trâmites processuais, incluindo os documentos básicos exigidos pela legislação de trânsito, que são: cópia do documento de identificação (RG e CPF ou CNH, podendo ser a via digital ou física), cópia do documento de licenciamento do veículo (CRLV, podendo ser a via digital ou física) e cópia da notificação da infração (podendo ser a via digital ou física).
        </P>
        <P>
          10. O CONTRATANTE deverá disponibilizar e-mail válido, ou seja, que esteja ativo e ao qual possua acesso, para recebimento dos documentos, orientações e comunicados por parte do CONTRATADO, e que na hipótese de mudança de telefone ou e-mail, o CONTRATANTE se obriga a informar a alteração imediatamente ao CONTRATADO, de modo que assume toda e qualquer responsabilidade por danos decorrentes da dificuldade ou impossibilidade de sua localização, isentando expressamente o CONTRATADO de qualquer responsabilidade pela sua não localização ou localização tardia, mediante comprovação da tentativa frustrada de localização.
        </P>
        <P>
          11. O CONTRATANTE está ciente e concorda com os seguintes termos quanto ao envio da defesa ao órgão competente:
        </P>
        <P>11.1 Caso o órgão competente disponha de meio eletrônico – site do órgão – para envio da defesa:</P>
        <Ind>
          a. O CONTRATANTE pode solicitar ao CONTRATADO que providencie o encaminhamento da defesa ao órgão competente para julgamento por meio eletrônico – o site do órgão – sem que haja qualquer cobrança adicional, e desde que forneça todos os documentos e informações necessárias, conforme cláusula 9ª.
        </Ind>
        <Ind>
          b. Caso haja qualquer impedimento quanto ao envio da defesa por meio eletrônico, seja em razão de inoperância do site ou sistema do órgão, ou por qualquer motivo de força maior, o CONTRATANTE deverá providenciar o envio da defesa ao órgão via Correios ou entregá-la presencialmente, conforme orientações contidas no Manual de Instruções, até o último dia do prazo estabelecido pelo órgão de trânsito, e com a devida documentação.
        </Ind>
        <Ind>
          c. Na hipótese de necessidade do envio da defesa via Correios, caso o CONTRATANTE prefira que o CONTRATADO a providencie, será cobrada uma taxa adicional de R$ 50,00 (cinquenta reais) referente às despesas de envio.
        </Ind>
        <P>11.2 Caso o órgão competente não disponha de meio eletrônico para envio da defesa:</P>
        <Ind>
          O CONTRATANTE deverá providenciar o envio da defesa ao órgão via Correios ou entregá-la presencialmente, conforme orientações contidas no Manual de Instruções, até o último dia do prazo estabelecido pelo órgão de trânsito. Na hipótese de necessidade do envio via Correios, caso o CONTRATANTE prefira que o CONTRATADO providencie, será cobrada taxa adicional de R$ 50,00 (cinquenta reais) referente às despesas de envio.
        </Ind>
        <P>
          12. O CONTRATANTE está ciente e concorda que é exclusivamente responsável por verificar periodicamente o andamento do processo administrativo junto ao órgão de trânsito, uma vez que é o responsável pelo recebimento das notificações processuais, seja as recebidas através do seu aplicativo Carteira Digital de Trânsito ou as recebidas fisicamente via Correios, ou através do site do órgão, se houver esta opção, devendo informar ao CONTRATADO em até 10 (dez) dias antes do fim do prazo constante em notificação para que seja realizada a apresentação dos respectivos atos processuais, não se responsabilizando o CONTRATADO por eventual perda de prazo caso o encaminhamento se dê em tempo inferior.
        </P>
        <P>
          13. O CONTRATANTE se compromete em realizar a abertura de ticket de suporte ou informar o CONTRATADO do recebimento de notificações por meio da Área do Cliente no site, de modo que a abertura de ticket via sistema tem prioridade sobre as solicitações realizadas por WhatsApp.
        </P>

        {/* Cláusula 5 */}
        <Text style={S.clauseTitle}>CLÁUSULA 5ª – DA RESCISÃO</Text>
        <P>
          14. Poderá o CONTRATANTE rescindir este contrato, desde que avise previamente à outra parte com no mínimo 10 (dez) dias de antecedência, hipótese em que o CONTRATADO restituirá 70% (setenta por cento) do valor pago ao CONTRATANTE, caso a rescisão se dê antes que a defesa tenha sido redigida. Assim, não caberá restituição dos valores pagos, em caso de rescisão por parte do CONTRATANTE, se a defesa já tiver sido redigida pelo CONTRATADO.
        </P>

        {/* Cláusula 6 */}
        <Text style={S.clauseTitle}>CLÁUSULA 6ª – DEMAIS CLÁUSULAS</Text>
        <P>
          15. No caso de pagamento parcelado, as partes estabelecem que havendo atraso no pagamento das parcelas acordadas, incidirá multa de 3% sobre cada parcela, e serão cobrados juros de mora na proporção de 0,1% por dia de atraso.
        </P>
        <P>
          16. As partes elegem o foro de Campinas – SP, para dirimir quaisquer dúvidas oriundas do presente instrumento, e por estarem assim justas e acertadas, assinam o mesmo em 02 (duas) vias de idêntico teor.
        </P>

        {/* Signatures */}
        <View style={S.signatureSection}>
          {/* Client */}
          <View style={S.signatureBlock}>
            <Text style={S.signatureCity}>{dataCliente}</Text>
            <Text style={[S.text, { marginBottom: 2 }]}>CONTRATANTE:</Text>
            <View style={S.signatureLine} />
            <Text style={S.signatureName}>{dados.nome.toUpperCase()}</Text>
          </View>

          {/* Company */}
          <View style={S.signatureBlock}>
            <Text style={S.signatureCity}>{dataCampinas}</Text>
            <Text style={[S.text, { marginBottom: 2 }]}>CONTRATADO:</Text>
            <Text style={[S.text, { fontSize: 8.5, color: '#555555', marginBottom: 18 }]}>
              UNITY MULTAS, neste ato representada por sua proprietária:
            </Text>
            <View style={S.signatureLine} />
            <Text style={S.signatureName}>LIDIANE AZEVEDO</Text>
          </View>
        </View>

        {/* Page number */}
        <Text style={S.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}
