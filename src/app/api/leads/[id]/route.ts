import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const name = body.name !== undefined ? (body.name?.trim() || null) : undefined

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      lead: data,
    })
  } catch (err: any) {
    console.error('Erro ao atualizar lead:', err)
    return NextResponse.json(
      { error: err.message || 'Erro ao atualizar nome do lead' },
      { status: 500 }
    )
  }
}
