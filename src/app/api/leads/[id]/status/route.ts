import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendPurchaseEvent, sendStartTrialEvent } from '@/lib/meta/capi-service'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!['novo_lead', 'teste_ativo', 'pago'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const updates: Record<string, any> = {
      status,
      updated_at: now,
    }

    let capiPromise = null

    if (status === 'pago') {
      updates.paid_at = now
      if (!lead.trial_started_at) {
        updates.trial_started_at = now
      }
      capiPromise = sendPurchaseEvent(lead.phone, lead.id, 29.0, lead.ctwa || undefined)
    } else if (status === 'teste_ativo') {
      updates.paid_at = null
      if (!lead.trial_started_at) {
        updates.trial_started_at = now
        capiPromise = sendStartTrialEvent(lead.phone, lead.id, lead.ctwa || undefined)
      }
    } else if (status === 'novo_lead') {
      updates.paid_at = null
      updates.trial_started_at = null
    }

    const { data: updatedLead, error: updateError } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
    }

    let capiResult = null
    if (capiPromise) {
      capiResult = await capiPromise
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead,
      meta_capi: capiResult,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
