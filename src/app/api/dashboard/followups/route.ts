import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { grupo1Msg1, grupo1Msg2, grupo1Msg3, grupo1Msg4 } from '@/lib/followup/templates-grupo1'
import { grupo2Msg1, grupo2Msg2, grupo2Msg3, grupo2Msg4, grupo2Msg5 } from '@/lib/followup/templates-grupo2'

// Retorna o texto correspondente da mensagem com base no grupo e número
function getFollowupText(grupo: string, msgNumber: number, leadName: string | null): string {
  if (grupo === 'grupo1') {
    switch (msgNumber) {
      case 1: return grupo1Msg1(leadName)
      case 2: return grupo1Msg2(leadName)
      case 3: return grupo1Msg3(leadName)
      case 4: return grupo1Msg4(leadName)
      default: return ''
    }
  } else if (grupo === 'grupo2') {
    switch (msgNumber) {
      case 1: return grupo2Msg1(leadName)
      case 2: return grupo2Msg2(leadName)
      case 3: return grupo2Msg3(leadName)
      case 4: return grupo2Msg4(leadName)
      case 5: return grupo2Msg5(leadName)
      default: return ''
    }
  }
  return ''
}

export async function GET(request: NextRequest) {
  try {
    // Busca os registros de follow-up ordenados pelos mais recentes
    const { data: followups, error } = await supabaseAdmin
      .from('followup_messages_sent')
      .select(`
        id,
        lead_id,
        grupo,
        msg_number,
        sent_at,
        created_at,
        leads:lead_id (
          id,
          phone,
          name,
          status
        )
      `)
      .order('sent_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar followups:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const items = (followups || []).map((item: any) => {
      const lead = item.leads || {}
      return {
        id: item.id,
        leadId: item.lead_id,
        phone: lead.phone || '',
        name: lead.name || null,
        currentStatus: lead.status || '',
        grupo: item.grupo,
        msgNumber: item.msg_number,
        sentAt: item.sent_at,
        messageText: getFollowupText(item.grupo, item.msg_number, lead.name || null),
      }
    })

    return NextResponse.json({ followups: items })
  } catch (err: any) {
    console.error('Erro na API de followups:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
