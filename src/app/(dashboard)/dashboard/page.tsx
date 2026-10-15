'use client'

import { useEffect, useState } from 'react'
import { MetricsCards, MetricsData } from '@/components/dashboard/MetricsCards'
import { LeadsTable, Lead } from '@/components/leads/LeadsTable'
import { CapiLogsTable, CapiLog } from '@/components/dashboard/CapiLogsTable'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalTests: 0,
    totalPaid: 0,
    conversionRate: 0,
    totalRevenue: 0,
  })
  const [leads, setLeads] = useState<Lead[]>([])
  const [logs, setLogs] = useState<CapiLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadDashboardData() {
    try {
      const res = await fetch('/api/dashboard/data')
      if (res.ok) {
        const data = await res.json()
        setMetrics(data.metrics)
        setLeads(data.leads)
        setLogs(data.logs)
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
    // Auto-atualização a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleManualRefresh() {
    setRefreshing(true)
    loadDashboardData()
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Painel de Conversão & Leads
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rastreamento de funil WhatsApp e atribuição Meta Ads
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-sm font-medium text-slate-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {/* 1. Cards de Métricas do Funil */}
      <MetricsCards metrics={metrics} isLoading={loading} />

      {/* 2. Tabela de Leads */}
      <section id="leads" className="scroll-mt-8 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-base sm:text-lg font-semibold text-white">Gestão de Leads</h2>
          <span className="text-[11px] sm:text-xs text-slate-400">
            Atualizado automaticamente em tempo real
          </span>
        </div>
        <LeadsTable leads={leads} onLeadUpdated={loadDashboardData} />
      </section>

      {/* 3. Auditoria Meta CAPI */}
      <section id="logs" className="scroll-mt-8 space-y-4">
        <CapiLogsTable logs={logs} />
      </section>
    </div>
  )
}
