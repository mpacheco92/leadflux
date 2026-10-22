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

    const totalLeads = leads.length
    const totalTests = leads.filter(
      (l) => l.status === 'teste_ativo' || l.status === 'pago' || l.trial_started_at !== null
    ).length
    const totalPaid = leads.filter((l) => l.status === 'pago' || l.paid_at !== null).length

    // Conversões do funil:
    // 1. Conversa -> Teste
    const convToTest = totalLeads > 0 ? (totalTests / totalLeads) * 100 : 0
    // 2. Teste -> Pago
    const testToPaid = totalTests > 0 ? (totalPaid / totalTests) * 100 : 0
    // 3. Conversa -> Pago
    const convToPaid = totalLeads > 0 ? (totalPaid / totalLeads) * 100 : 0

    const totalRevenue = totalPaid * 29.0

    return NextResponse.json({
      metrics: {
        totalLeads,
        totalTests,
        totalPaid,
        conversionRate: testToPaid,
        convToTest,
        testToPaid,
        convToPaid,
        totalRevenue,
      },
      leads,
      logs,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
