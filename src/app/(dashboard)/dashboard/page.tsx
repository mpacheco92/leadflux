'use client'

import { useEffect, useState, useMemo } from 'react'
import { MetricsCards, MetricsData } from '@/components/dashboard/MetricsCards'
import { LeadsTable, Lead } from '@/components/leads/LeadsTable'
import { DateFilter, DatePeriod } from '@/components/dashboard/DateFilter'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  // Filtro de Período (padrão: Este Mês)
  const [period, setPeriod] = useState<DatePeriod>('mes')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  async function loadDashboardData() {
    try {
      const res = await fetch('/api/dashboard/data')
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    setCurrentDate(new Date())
    loadDashboardData()
    const interval = setInterval(() => {
      setCurrentDate(new Date())
      loadDashboardData()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleManualRefresh() {
    setRefreshing(true)
    loadDashboardData()
  }

  // Filtragem dos leads por data
  const filteredLeads = useMemo(() => {
    if (period === 'tudo' || !currentDate) return leads

    return leads.filter((lead) => {
      const leadDate = new Date(lead.created_at)

      if (period === 'dia') {
        const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0)
        return leadDate >= startOfDay
      }

      if (period === 'semana') {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - 7)
        startOfWeek.setHours(0, 0, 0, 0)
        return leadDate >= startOfWeek
      }

      if (period === 'mes') {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0)
        return leadDate >= startOfMonth
      }

      if (period === 'custom') {
        if (customStart) {
          const s = new Date(customStart + 'T00:00:00')
          if (leadDate < s) return false
        }
        if (customEnd) {
          const e = new Date(customEnd + 'T23:59:59')
          if (leadDate > e) return false
        }
        return true
      }

      return true
    })
  }, [leads, period, currentDate, customStart, customEnd])

  // Cálculo das métricas para os leads filtrados
  const filteredMetrics: MetricsData = useMemo(() => {
    const totalLeads = filteredLeads.length
    const totalTests = filteredLeads.filter(
      (l) => l.status === 'teste_ativo' || l.status === 'pago' || l.trial_started_at !== null
    ).length
    const totalPaid = filteredLeads.filter((l) => l.status === 'pago' || l.paid_at !== null).length

    const convToTest = totalLeads > 0 ? (totalTests / totalLeads) * 100 : 0
    const testToPaid = totalTests > 0 ? (totalPaid / totalTests) * 100 : 0
    const convToPaid = totalLeads > 0 ? (totalPaid / totalLeads) * 100 : 0
    const totalRevenue = totalPaid * 29.0

    return {
      totalLeads,
      totalTests,
      totalPaid,
      conversionRate: testToPaid,
      convToTest,
      testToPaid,
      convToPaid,
      totalRevenue,
    }
  }, [filteredLeads])

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Painel de Conversão & Leads
          </h1>
          <p className="text-sm text-[#BCBCBC] mt-1">
            Rastreamento de funil WhatsApp e atribuição Meta Ads
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] border border-[#2c2c2c] text-xs font-medium text-white transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#D6FF00] ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {/* Filtro de Período com 1 clique e personalizado */}
      <DateFilter
        period={period}
        onPeriodChange={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      {/* 1. Cards de Métricas do Funil (Filtrados) */}
      <MetricsCards metrics={filteredMetrics} isLoading={loading} />

      {/* 2. Tabela de Leads (Filtrados) */}
      <section id="leads" className="scroll-mt-8 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-base sm:text-lg font-semibold text-white">Gestão de Leads</h2>
          <span className="text-[11px] sm:text-xs text-[#BCBCBC]">
            Atualizado automaticamente em tempo real
          </span>
        </div>
        <LeadsTable leads={filteredLeads} onLeadUpdated={loadDashboardData} />
      </section>
    </div>
  )
}
