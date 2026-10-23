import { supabaseAdmin } from '@/lib/supabase/server'
import { sendTextMessage } from '@/lib/evolution/client'
import { grupo1Msg1, grupo1Msg2, grupo1Msg3, grupo1Msg4 } from './templates-grupo1'
import { grupo2Msg1, grupo2Msg2, grupo2Msg3, grupo2Msg4, grupo2Msg5 } from './templates-grupo2'

/**
 * Configuração dos fluxos de follow-up.
 *
 * GRUPO 1 (novo_lead): baseado em created_at
 *   D+0: MSG1 = +2 horas após conversa (apenas no mesmo dia D+0)
 *   D+1: MSG2 = às 18h BRT
 *   D+3: MSG3 = às 18h BRT
 *   D+5: MSG4 = às 18h BRT
 *
 * GRUPO 2 (teste_ativo): baseado em trial_started_at
 *   D+0: MSG1 = +3 horas após teste (apenas no mesmo dia D+0)
 *   D+1: MSG2 = às 19h BRT
 *   D+3: MSG3 = às 19h BRT
 *   D+5: MSG4 = às 19h BRT
 *   D+7: MSG5 = às 19h BRT
 *
 * Intervalo de 1 minuto entre envios para evitar bloqueio do WhatsApp.
 * NUNCA envia mais de 1 mensagem por dia para o mesmo lead.
 * Leads antigos NUNCA recebem MSG1 do passado se já estão em D+1 ou posterior.
 */

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const SEND_INTERVAL_MS = 60 * 1000 // 1 minuto entre envios

export interface FollowupStep {
  msgNumber: number
  getTemplate: (name: string | null) => string
}

export const GRUPO1_STEPS: FollowupStep[] = [
  { msgNumber: 1, getTemplate: grupo1Msg1 },
  { msgNumber: 2, getTemplate: grupo1Msg2 },
  { msgNumber: 3, getTemplate: grupo1Msg3 },
  { msgNumber: 4, getTemplate: grupo1Msg4 },
]

export const GRUPO2_STEPS: FollowupStep[] = [
  { msgNumber: 1, getTemplate: grupo2Msg1 },
  { msgNumber: 2, getTemplate: grupo2Msg2 },
  { msgNumber: 3, getTemplate: grupo2Msg3 },
  { msgNumber: 4, getTemplate: grupo2Msg4 },
  { msgNumber: 5, getTemplate: grupo2Msg5 },
]

interface ProcessResult {
  grupo1Sent: number
  grupo2Sent: number
  errors: string[]
  skipped: number
}

/** Retorna a hora atual em Brasília (UTC-3) */
function getBrasiliaHour(now: Date): number {
  const utcHour = now.getUTCHours()
  return (utcHour - 3 + 24) % 24
}

/** Retorna a data em Brasília como YYYY-MM-DD */
function getBrasiliaDateStr(date: Date): string {
  const offset = -3 * 60 // UTC-3 em minutos
  const local = new Date(date.getTime() + offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

/** Sleep helper */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Determina exatamente qual mensagem (step) o lead tem direito a receber agora,
 * respeitando a idade do lead em dias (D+0, D+1, D+3, D+5, D+7).
 *
 * Se o lead entrou ontem ou antes, ele NUNCA receberá a MSG1 (que era exclusiva do D+0).
 * Receberá apenas a mensagem respectiva à fase atual dele (às 18h ou 19h BRT).
 */
function getTargetStepForLead(
  grupo: 'grupo1' | 'grupo2',
  referenceDate: Date,
  now: Date,
  sentSteps: Set<number>,
): FollowupStep | null {
  const refDateBrt = getBrasiliaDateStr(referenceDate)
  const nowDateBrt = getBrasiliaDateStr(now)

  const refMs = new Date(refDateBrt + 'T00:00:00Z').getTime()
  const nowMs = new Date(nowDateBrt + 'T00:00:00Z').getTime()
  const daysSinceRef = Math.floor((nowMs - refMs) / DAY)
  const brasiliaHour = getBrasiliaHour(now)
  const elapsedHours = (now.getTime() - referenceDate.getTime()) / HOUR

  if (grupo === 'grupo1') {
    // MSG 1: Deve ser enviada 2 horas após a conversa.
    // É válida se ainda não foi enviada E estamos antes do horário do primeiro disparo diário (18h do D+1).
    if (!sentSteps.has(1)) {
      // Se já passou das 18h do D+1 ou já se passaram mais de 24h, a MSG1 expirou (vai direto pra fase diária)
      const isBeforeD1Evening = daysSinceRef === 0 || (daysSinceRef === 1 && brasiliaHour < 18)
      if (elapsedHours >= 2 && isBeforeD1Evening) {
        return GRUPO1_STEPS[0] // MSG 1
      }
    }

    // A partir daqui são os disparos diários agendados (sempre às 18h+ BRT)
    if (brasiliaHour < 18) {
      return null
    }

    // D+1 ou D+2 -> Alvo é MSG 2
    if (daysSinceRef === 1 || daysSinceRef === 2) {
      if (!sentSteps.has(2)) {
        return GRUPO1_STEPS[1] // MSG 2
      }
      return null
    }

    // D+3 ou D+4 -> Alvo é MSG 3
    if (daysSinceRef === 3 || daysSinceRef === 4) {
      if (!sentSteps.has(3)) {
        return GRUPO1_STEPS[2] // MSG 3
      }
      return null
    }

    // D+5 em diante -> Alvo é MSG 4
    if (daysSinceRef >= 5) {
      if (!sentSteps.has(4)) {
        return GRUPO1_STEPS[3] // MSG 4
      }
      return null
    }
  } else if (grupo === 'grupo2') {
    // MSG 1: Deve ser enviada 3 horas após o teste.
    // É válida se ainda não foi enviada E estamos antes do horário do primeiro disparo diário (19h do D+1).
    if (!sentSteps.has(1)) {
      const isBeforeD1Evening = daysSinceRef === 0 || (daysSinceRef === 1 && brasiliaHour < 19)
      if (elapsedHours >= 3 && isBeforeD1Evening) {
        return GRUPO2_STEPS[0] // MSG 1
      }
    }

    // A partir daqui são os disparos diários agendados (sempre às 19h+ BRT)
    if (brasiliaHour < 19) {
      return null
    }

    // D+1 ou D+2 -> Alvo é MSG 2
    if (daysSinceRef === 1 || daysSinceRef === 2) {
      if (!sentSteps.has(2)) {
        return GRUPO2_STEPS[1] // MSG 2
      }
      return null
    }

    // D+3 ou D+4 -> Alvo é MSG 3
    if (daysSinceRef === 3 || daysSinceRef === 4) {
      if (!sentSteps.has(3)) {
        return GRUPO2_STEPS[2] // MSG 3
      }
      return null
    }

    // D+5 ou D+6 -> Alvo é MSG 4
    if (daysSinceRef === 5 || daysSinceRef === 6) {
      if (!sentSteps.has(4)) {
        return GRUPO2_STEPS[3] // MSG 4
      }
      return null
    }

    // D+7 em diante -> Alvo é MSG 5
    if (daysSinceRef >= 7) {
      if (!sentSteps.has(5)) {
        return GRUPO2_STEPS[4] // MSG 5
      }
      return null
    }
  }

  return null
}

/**
 * Processa todos os follow-ups pendentes.
 * Chamado pelo CRON a cada 10 minutos.
 */
export async function processFollowups(): Promise<ProcessResult> {
  const now = new Date()
  const todayStr = getBrasiliaDateStr(now) // YYYY-MM-DD em Brasília
  const result: ProcessResult = { grupo1Sent: 0, grupo2Sent: 0, errors: [], skipped: 0 }

  // --- GRUPO 1: leads com status 'novo_lead' (iniciou conversa, não testou) ---
  await processGrupo(
    'grupo1',
    { status: 'novo_lead' },
    'created_at',
    now,
    todayStr,
    result,
    (r) => { r.grupo1Sent++ },
  )

  // --- GRUPO 2: leads com status 'teste_ativo' (testou, não comprou) ---
  await processGrupo(
    'grupo2',
    { status: 'teste_ativo' },
    'trial_started_at',
    now,
    todayStr,
    result,
    (r) => { r.grupo2Sent++ },
  )

  return result
}

async function processGrupo(
  grupo: 'grupo1' | 'grupo2',
  filter: Record<string, string>,
  dateField: string,
  now: Date,
  todayStr: string,
  result: ProcessResult,
  onSent: (r: ProcessResult) => void,
) {
  // Busca todos os leads do grupo
  let query = supabaseAdmin.from('leads').select('*')
  for (const [key, value] of Object.entries(filter)) {
    query = query.eq(key, value)
  }
  query = query.not(dateField, 'is', null)

  const { data: rawLeads, error } = await query
  if (error) {
    result.errors.push(`Erro ao buscar leads do ${grupo}: ${error.message}`)
    return
  }
  if (!rawLeads || rawLeads.length === 0) return

  // Deduplica leads por phone — mantém apenas o mais recente (por updated_at)
  const leadsByPhone = new Map<string, any>()
  for (const lead of rawLeads) {
    const existing = leadsByPhone.get(lead.phone)
    if (!existing || new Date(lead.updated_at) > new Date(existing.updated_at)) {
      leadsByPhone.set(lead.phone, lead)
    }
  }
  const leads = Array.from(leadsByPhone.values())

  // Busca todas as mensagens já enviadas para este grupo
  const leadIds = leads.map((l: any) => l.id)
  const { data: sentMessages } = await supabaseAdmin
    .from('followup_messages_sent')
    .select('lead_id, msg_number, sent_at')
    .eq('grupo', grupo)
    .in('lead_id', leadIds)

  // Mapeamento: quais mensagens cada lead já recebeu
  const sentMap = new Map<string, Set<number>>()
  // Mapeamento: se o lead já recebeu QUALQUER mensagem hoje (Brasília)
  const sentTodayMap = new Map<string, boolean>()

  for (const msg of sentMessages || []) {
    if (!sentMap.has(msg.lead_id)) {
      sentMap.set(msg.lead_id, new Set())
    }
    sentMap.get(msg.lead_id)!.add(msg.msg_number)

    const sentDateBrt = getBrasiliaDateStr(new Date(msg.sent_at))
    if (sentDateBrt === todayStr) {
      sentTodayMap.set(msg.lead_id, true)
    }
  }

  // Set de phones que já foram enviados nesta execução (evita duplicata cross-ID)
  const phonesSentThisRun = new Set<string>()

  let needsDelay = false

  for (const lead of leads) {
    // REGRA DE OURO: O lead NÃO pode receber 2 ou mais mensagens no mesmo dia
    if (sentTodayMap.get(lead.id) || phonesSentThisRun.has(lead.phone)) {
      result.skipped++
      continue
    }

    const referenceDate = new Date(lead[dateField])
    const sentSteps = sentMap.get(lead.id) || new Set<number>()

    // Localiza a mensagem exata para a idade do lead
    const targetStep = getTargetStepForLead(grupo, referenceDate, now, sentSteps)
    if (!targetStep) {
      // Nenhuma mensagem elegível para este lead neste momento
      continue
    }

    // Intervalo de 1 minuto entre disparos
    if (needsDelay) {
      await sleep(SEND_INTERVAL_MS)
    }

    // PASSO 1: Registra no banco ANTES de enviar (evita duplicata por race condition)
    try {
      const { error: insertError } = await supabaseAdmin
        .from('followup_messages_sent')
        .insert({
          lead_id: lead.id,
          grupo,
          msg_number: targetStep.msgNumber,
          sent_at: now.toISOString(),
        })

      if (insertError) {
        if (insertError.code === '23505') {
          // Outra execução já registrou — NÃO envia de novo
          result.skipped++
        } else {
          result.errors.push(
            `Erro ao registrar envio ${grupo}/MSG${targetStep.msgNumber} para ${lead.phone}: ${insertError.message}`
          )
        }
        continue
      }

      // PASSO 2: Só envia se o INSERT foi bem-sucedido (garantia de exclusividade)
      const text = targetStep.getTemplate(lead.name)
      await sendTextMessage(lead.phone, text)

      onSent(result)
      sentTodayMap.set(lead.id, true)
      phonesSentThisRun.add(lead.phone)
      sentSteps.add(targetStep.msgNumber)
      needsDelay = true
    } catch (err: any) {
      result.errors.push(
        `Erro ao enviar ${grupo}/MSG${targetStep.msgNumber} para ${lead.phone}: ${err.message}`
      )
    }
  }
}
