import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/meta/formatters'
import { sendPurchaseEvent } from '@/lib/meta/capi-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log para depuração de novos webhooks da Evolution
    const event = body.event || body.type || ''
    const data = body.data || body

    // 1. Extração do identificador do contato (JID ou telefone)
    const rawJid =
      data.chatId ||
      data.remoteJid ||
      data.id ||
      data.phone ||
      data.target?.id ||
      ''

    // Ignora mensagens de grupos (@g.us) ou vazias
    if (!rawJid || rawJid.includes('@g.us')) {
      return NextResponse.json({ message: 'Evento ignorado (não é chat individual)' })
    }

    const cleanRawPhone = rawJid.replace('@s.whatsapp.net', '').replace('@c.us', '')
    const phone = normalizePhone(cleanRawPhone)

    // 2. Extração do nome da etiqueta associada
    let labelName = ''
    if (typeof data.labelName === 'string') {
      labelName = data.labelName
    } else if (data.label?.name) {
      labelName = data.label.name
    } else if (data.name) {
      labelName = data.name
    } else if (Array.isArray(data.labels) && data.labels.length > 0) {
      // Caso venha uma lista de labels
      const found = data.labels.find((l: any) =>
        (typeof l === 'string' ? l : l.name || '')
          .toLowerCase()
          .includes('pago')
      )
      if (found) {
        labelName = typeof found === 'string' ? found : found.name
      }
    }

    // Se for ação de remoção da etiqueta, ignora
    const action = data.action || ''
    if (action === 'remove') {
      return NextResponse.json({ message: 'Ação de remoção de etiqueta ignorada' })
    }

    const isPaidLabel = labelName.toLowerCase().includes('pago') || labelName.toLowerCase().includes('assinante')

    if (!isPaidLabel) {
      return NextResponse.json({
        message: 'Etiqueta recebida não é de conversão/pagamento',
        receivedLabel: labelName,
      })
    }

    // 3. Atualiza ou cria o lead no Supabase com status 'pago'
    const now = new Date().toISOString()
    const { data: lead, error: dbError } = await supabaseAdmin
      .from('leads')
      .upsert(
        {
          phone,
          status: 'pago',
          paid_at: now,
          updated_at: now,
        },
        { onConflict: 'phone' }
      )
      .select()
      .single()

    if (dbError || !lead) {
      console.error('Erro ao atualizar lead para pago:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar no banco' }, { status: 500 })
    }

    // 4. Dispara o evento Purchase (R$ 29,00) para o Meta CAPI
    const capiResult = await sendPurchaseEvent(phone, lead.id, 29.0)

    return NextResponse.json({
      success: true,
      lead,
      meta_capi: capiResult,
    })
  } catch (err: any) {
    console.error('Erro no webhook da Evolution API:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
