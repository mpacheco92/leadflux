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

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function getBrasiliaDateStr(date: Date): string {
  const offset = -3 * 60
  const local = new Date(date.getTime() + offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

function getBrasiliaHour(date: Date): number {
  const utc = date.getUTCHours()
  return (utc - 3 + 24) % 24
}

export async function GET(request: NextRequest) {
  try {
    // 1. Busca os registros de follow-up enviados
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

    // 2. Busca leads ativos para calcular follow-ups programados para hoje
    const { data: rawActiveLeads } = await supabaseAdmin
      .from('leads')
      .select('id, name, phone, status, created_at, trial_started_at, updated_at')
      .in('status', ['novo_lead', 'teste_ativo'])

    const now = new Date()
    const todayStr = getBrasiliaDateStr(now)
    const currentBrasiliaHour = getBrasiliaHour(now)

    // Deduplica leads por telefone (mantém o updated_at mais recente)
    const leadsByPhone = new Map<string, any>()
    for (const lead of rawActiveLeads || []) {
      const existing = leadsByPhone.get(lead.phone)
      if (!existing || new Date(lead.updated_at) > new Date(existing.updated_at)) {
        leadsByPhone.set(lead.phone, lead)
      }
    }

    // Mapeia mensagens enviadas por lead e se já recebeu mensagem hoje
    const sentMap = new Map<string, Set<number>>()
    const sentTodayMap = new Map<string, boolean>()

    for (const item of followups || []) {
      const key = `${item.lead_id}-${item.grupo}`
      if (!sentMap.has(key)) {
        sentMap.set(key, new Set())
      }
      sentMap.get(key)!.add(item.msg_number)

      const sentDateBrt = getBrasiliaDateStr(new Date(item.sent_at))
      if (sentDateBrt === todayStr) {
        sentTodayMap.set(item.lead_id, true)
      }
    }

    const scheduledItems = []

    for (const lead of leadsByPhone.values()) {
      // REGRA DE OURO: Lead não pode receber 2 mensagens no mesmo dia
      if (sentTodayMap.get(lead.id)) {
        continue
      }

      const grupo = lead.status === 'novo_lead' ? 'grupo1' : 'grupo2'
      const dateField = grupo === 'grupo1' ? lead.created_at : lead.trial_started_at
      if (!dateField) continue

      const refDate = new Date(dateField)
      const refDateBrt = getBrasiliaDateStr(refDate)
      const refMs = new Date(refDateBrt + 'T00:00:00Z').getTime()
      const nowMs = new Date(todayStr + 'T00:00:00Z').getTime()
      const daysSinceRef = Math.floor((nowMs - refMs) / DAY)
      const sentSteps = sentMap.get(`${lead.id}-${grupo}`) || new Set<number>()

      let targetMsg: number | null = null
      let scheduledTimeStr: string | null = null

      if (grupo === 'grupo1') {
        if (daysSinceRef === 0) {
          if (!sentSteps.has(1)) {
            targetMsg = 1
            scheduledTimeStr = new Date(refDate.getTime() + 2 * HOUR).toISOString()
          }
        } else if (daysSinceRef === 1 && currentBrasiliaHour < 18 && !sentSteps.has(1)) {
          targetMsg = 1
          scheduledTimeStr = new Date(refDate.getTime() + 2 * HOUR).toISOString()
        } else if (daysSinceRef === 1 || daysSinceRef === 2) {
          if (!sentSteps.has(2)) {
            targetMsg = 2
            scheduledTimeStr = `${todayStr}T18:00:00-03:00`
          }
        } else if (daysSinceRef === 3 || daysSinceRef === 4) {
          if (!sentSteps.has(3)) {
            targetMsg = 3
            scheduledTimeStr = `${todayStr}T18:00:00-03:00`
          }
        } else if (daysSinceRef >= 5) {
          if (!sentSteps.has(4)) {
            targetMsg = 4
            scheduledTimeStr = `${todayStr}T18:00:00-03:00`
          }
        }
      } else if (grupo === 'grupo2') {
        if (daysSinceRef === 0) {
          if (!sentSteps.has(1)) {
            targetMsg = 1
            scheduledTimeStr = new Date(refDate.getTime() + 3 * HOUR).toISOString()
          }
        } else if (daysSinceRef === 1 && currentBrasiliaHour < 19 && !sentSteps.has(1)) {
          targetMsg = 1
          scheduledTimeStr = new Date(refDate.getTime() + 3 * HOUR).toISOString()
        } else if (daysSinceRef === 1 || daysSinceRef === 2) {
          if (!sentSteps.has(2)) {
            targetMsg = 2
            scheduledTimeStr = `${todayStr}T19:00:00-03:00`
          }
        } else if (daysSinceRef === 3 || daysSinceRef === 4) {
          if (!sentSteps.has(3)) {
            targetMsg = 3
            scheduledTimeStr = `${todayStr}T19:00:00-03:00`
          }
        } else if (daysSinceRef === 5 || daysSinceRef === 6) {
          if (!sentSteps.has(4)) {
            targetMsg = 4
            scheduledTimeStr = `${todayStr}T19:00:00-03:00`
          }
        } else if (daysSinceRef >= 7) {
          if (!sentSteps.has(5)) {
            targetMsg = 5
            scheduledTimeStr = `${todayStr}T19:00:00-03:00`
          }
        }
      }

      if (targetMsg && scheduledTimeStr) {
        scheduledItems.push({
          id: `sched-${lead.id}-${grupo}-${targetMsg}`,
          leadId: lead.id,
          phone: lead.phone,
          name: lead.name,
          currentStatus: lead.status,
          grupo,
          msgNumber: targetMsg,
          scheduledFor: new Date(scheduledTimeStr).toISOString(),
          messageText: getFollowupText(grupo, targetMsg, lead.name),
        })
      }
    }

    // Ordena os agendados pelo horário previsto
    scheduledItems.sort(
      (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
    )

    return NextResponse.json({
      followups: items,
      scheduled: scheduledItems,
    })
  } catch (err: any) {
    console.error('Erro na API de followups:', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
