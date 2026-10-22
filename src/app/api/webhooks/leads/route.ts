import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/server'
import { normalizePhone, normalizeCtwaClid } from '@/lib/meta/formatters'

const leadSchema = z.object({
  phone: z.string().min(8, 'Telefone inválido'),
  name: z.string().optional().nullable(),
  ctwa_clid: z.string().optional().nullable(),
  status: z.enum(['novo_lead', 'teste_ativo', 'pago']).optional().default('novo_lead'),
})

export async function POST(request: NextRequest) {
  try {
    const secret =
      request.headers.get('x-webhook-secret') ||
      request.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (expectedSecret && secret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const phone = normalizePhone(parsed.data.phone)
    const name = parsed.data.name?.trim() || null
    const ctwaClid = normalizeCtwaClid(parsed.data.ctwa_clid)
    const targetStatus = parsed.data.status || 'novo_lead'
    const now = new Date().toISOString()

    // 1. Verifica se lead já existe
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()

    // 2. Se não existe e não veio de anúncio (sem ctwa_clid), ignora criação
    if (!existingLead && !ctwaClid) {
      return NextResponse.json({
        ignored: true,
        message: 'Lead ignorado: não originado de anúncio (sem ctwa_clid)',
      })
    }

    let leadData: any

    if (existingLead) {
      // Não rebaixa status se já for teste_ativo ou pago
      const shouldKeepStatus =
        (existingLead.status === 'pago' || existingLead.status === 'teste_ativo') &&
        targetStatus === 'novo_lead'

      const updatedFields: any = {
        updated_at: now,
      }

      if (!shouldKeepStatus) {
        updatedFields.status = targetStatus
      }
      if (name) {
        updatedFields.name = name
      }
      if (ctwaClid && !existingLead.ctwa) {
        updatedFields.ctwa = ctwaClid
      }

      const { data, error } = await supabaseAdmin
        .from('leads')
        .update(updatedFields)
        .eq('id', existingLead.id)
        .select()
        .single()

      if (error) throw error
      leadData = data
    } else {
      // Insere novo lead
      const { data, error } = await supabaseAdmin
        .from('leads')
        .insert({
          phone,
          name,
          status: targetStatus,
          ctwa: ctwaClid,
          trial_started_at: targetStatus === 'teste_ativo' ? now : null,
          paid_at: null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) throw error
      leadData = data
    }

    return NextResponse.json({
      success: true,
      lead: leadData,
    })
  } catch (err: any) {
    console.error('Erro ao cadastrar lead:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
