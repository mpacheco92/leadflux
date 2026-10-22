import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'
import { normalizePhone, normalizeCtwaClid } from '@/lib/meta/formatters'
import { sendLeadSubmittedEvent } from '@/lib/meta/capi-service'

const trialSchema = z.object({
  phone: z.string().min(8, 'Telefone inválido'),
  name: z.string().optional(),
  ctwa_clid: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Validação opcional de segurança por secret
    const secret =
      request.headers.get('x-webhook-secret') ||
      request.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (expectedSecret && secret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = trialSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const phone = normalizePhone(parsed.data.phone)
    const name = parsed.data.name?.trim() || null
    const ctwaClid = normalizeCtwaClid(parsed.data.ctwa_clid)

    // 1. Salva ou atualiza o lead no Supabase como 'teste_ativo'
    const { data: lead, error: dbError } = await supabaseAdmin
      .from('leads')
      .upsert(
        {
          phone,
          name,
          status: 'teste_ativo',
          ctwa: ctwaClid,
          trial_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone' }
      )
      .select()
      .single()

    if (dbError || !lead) {
      console.error('Erro ao salvar lead no Supabase:', dbError)
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    // 2. Dispara o evento LeadSubmitted para a Meta Conversions API com ctwa_clid
    const capiResult = await sendLeadSubmittedEvent(phone, lead.id, ctwaClid || undefined)

    return NextResponse.json({
      success: true,
      lead,
      meta_capi: capiResult,
    })
  } catch (err: any) {
    console.error('Erro no webhook do Typebot:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
