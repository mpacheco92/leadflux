import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { sendPurchaseEvent } from '@/lib/meta/capi-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const now = new Date().toISOString()

    const { data: lead, error: fetchError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    const { error: updateError } = await supabaseAdmin
      .from('leads')
      .update({
        status: 'pago',
        paid_at: now,
        updated_at: now,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 500 })
    }

    // Dispara Purchase no Meta CAPI
    const capiResult = await sendPurchaseEvent(lead.phone, lead.id, 29.0, lead.ctwa || undefined)

    return NextResponse.json({ success: true, meta_capi: capiResult })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
