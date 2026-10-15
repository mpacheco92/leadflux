import { hashPhone } from '@/lib/meta/formatters'
import { supabaseAdmin } from '@/lib/supabase/server'

interface CapiEventOptions {
  eventName: 'StartTrial' | 'Purchase'
  phone: string
  leadId: string
  value?: number
  currency?: string
  ctwaClid?: string
}

export async function sendMetaCapiEvent({
  eventName,
  phone,
  leadId,
  value,
  currency = 'BRL',
  ctwaClid,
}: CapiEventOptions) {
  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  const testEventCode = process.env.META_TEST_EVENT_CODE

  if (!pixelId || !accessToken) {
    console.error('Meta CAPI: Credenciais não configuradas no .env')
    return { success: false, error: 'Credenciais ausentes' }
  }

  const phoneHash = hashPhone(phone)
  const currentTimestamp = Math.floor(Date.now() / 1000)

  const eventData: Record<string, any> = {
    event_name: eventName,
    event_time: currentTimestamp,
    action_source: 'chat',
    user_data: {
      ph: [phoneHash],
    },
  }

  if (value !== undefined || ctwaClid) {
    eventData.custom_data = {
      ...(value !== undefined ? { value, currency } : {}),
      ...(ctwaClid ? { ctwa_clid: ctwaClid } : {}),
    }
  }

  const body: Record<string, any> = {
    data: [eventData],
  }

  if (testEventCode) {
    body.test_event_code = testEventCode
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const result = await response.json()
    const isSuccess = response.ok

    // Salva auditoria no Supabase
    await supabaseAdmin.from('events_log').insert({
      lead_id: leadId,
      event_name: eventName,
      status: isSuccess ? 'success' : 'error',
      meta_response: result,
    })

    return {
      success: isSuccess,
      status: response.status,
      data: result,
    }
  } catch (err: any) {
    console.error(`Erro ao disparar evento ${eventName} para Meta:`, err)

    await supabaseAdmin.from('events_log').insert({
      lead_id: leadId,
      event_name: eventName,
      status: 'error',
      meta_response: { error: err.message },
    })

    return { success: false, error: err.message }
  }
}

export async function sendStartTrialEvent(phone: string, leadId: string, ctwaClid?: string) {
  return sendMetaCapiEvent({
    eventName: 'StartTrial',
    phone,
    leadId,
    ctwaClid,
  })
}

export async function sendPurchaseEvent(
  phone: string,
  leadId: string,
  value: number = 29.0,
  ctwaClid?: string
) {
  return sendMetaCapiEvent({
    eventName: 'Purchase',
    phone,
    leadId,
    value,
    ctwaClid,
  })
}
