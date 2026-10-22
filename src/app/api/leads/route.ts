import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/meta/formatters'
import { sendPurchaseEvent, sendLeadSubmittedEvent } from '@/lib/meta/capi-service'

const manualLeadSchema = z.object({
  phone: z.string().min(8, 'Informe um número de telefone válido'),
  name: z.string().optional().nullable(),
  status: z.enum(['novo_lead', 'teste_ativo', 'pago']).optional().default('novo_lead'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = manualLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const phone = normalizePhone(parsed.data.phone)
    const name = parsed.data.name?.trim() || null
    const status = parsed.data.status || 'novo_lead'
    const now = new Date().toISOString()

    // 1. Verifica se já existe
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()

    let leadData: any

    if (existingLead) {
      const updates: any = {
        updated_at: now,
      }
      if (name) updates.name = name
      if (status !== 'novo_lead' || existingLead.status === 'novo_lead') {
        updates.status = status
        if (status === 'teste_ativo' && !existingLead.trial_started_at) {
          updates.trial_started_at = now
        }
        if (status === 'pago') {
          updates.paid_at = now
          if (!existingLead.trial_started_at) updates.trial_started_at = now
        }
      }

      const { data, error } = await supabaseAdmin
        .from('leads')
        .update(updates)
        .eq('id', existingLead.id)
        .select()
        .single()

      if (error) throw error
      leadData = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert({
          phone,
          name,
          status,
          trial_started_at: status === 'teste_ativo' || status === 'pago' ? now : null,
          paid_at: status === 'pago' ? now : null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) throw error
      leadData = data
    }

    // Se criado como teste ou pago, envia evento correspondente para CAPI
    if (status === 'teste_ativo') {
      sendLeadSubmittedEvent(leadData.phone, leadData.id, leadData.ctwa || undefined).catch((err: any) =>
        console.error('Erro ao enviar CAPI LeadSubmitted manual:', err)
      )
    } else if (status === 'pago') {
      sendPurchaseEvent(leadData.phone, leadData.id, 29.0, leadData.ctwa || undefined).catch((err: any) =>
        console.error('Erro ao enviar CAPI Purchase manual:', err)
      )
    }

    return NextResponse.json({
      success: true,
      lead: leadData,
    })
  } catch (err: any) {
    console.error('Erro ao adicionar lead manualmente:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao adicionar lead' },
      { status: 500 }
    )
  }
}
