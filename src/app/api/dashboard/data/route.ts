import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    const [leadsRes, logsRes] = await Promise.all([
      supabaseAdmin
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('events_log')
        .select('*, leads(phone, name)')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    const leads = leadsRes.data || []
    const logs = logsRes.data || []

    const totalTests = leads.filter(
      (l) => l.status === 'teste_ativo' || l.status === 'pago'
    ).length
    const totalPaid = leads.filter((l) => l.status === 'pago').length
    const conversionRate = totalTests > 0 ? (totalPaid / totalTests) * 100 : 0
    const totalRevenue = totalPaid * 29.0

    return NextResponse.json({
      metrics: {
        totalTests,
        totalPaid,
        conversionRate,
        totalRevenue,
      },
      leads,
      logs,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
