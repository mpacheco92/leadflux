'use client'

import { Users, TrendingUp, DollarSign } from 'lucide-react'

export interface MetricsData {
  totalLeads?: number
  totalTests: number
  totalPaid: number
  conversionRate: number
  convToTest?: number
  testToPaid?: number
  convToPaid?: number
  totalRevenue: number
}

interface MetricsCardsProps {
  metrics: MetricsData
  isLoading?: boolean
}

export function MetricsCards({ metrics, isLoading = false }: MetricsCardsProps) {
  const convToTest = metrics.convToTest ?? 0
  const testToPaid = metrics.testToPaid ?? metrics.conversionRate ?? 0
  const convToPaid = metrics.convToPaid ?? 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
      {/* 1. Card Funil de Leads: Branco com texto escuro invertido */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-zinc-200 p-4 sm:p-5 hover:border-zinc-300 transition-all flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between gap-1 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Funil de Leads
          </span>
          <div className="p-1.5 rounded-lg bg-zinc-900 text-[#D6FF00] shrink-0 shadow-sm">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span className="text-zinc-700 font-medium">Total de Leads</span>
            </div>
            <span className="font-extrabold text-zinc-950 text-sm sm:text-base">
              {isLoading ? '...' : (metrics.totalLeads ?? 0).toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span className="text-zinc-700 font-medium">Testes Liberados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-zinc-950 text-sm sm:text-base">
                {isLoading ? '...' : metrics.totalTests.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] font-bold text-zinc-800 px-1.5 py-0.2 rounded border border-zinc-300 bg-zinc-100">
                LeadSubmitted
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span className="text-zinc-700 font-medium">Assinaturas Fechadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-zinc-950 text-sm sm:text-base">
                {isLoading ? '...' : metrics.totalPaid.toLocaleString('pt-BR')}
              </span>
              <span className="text-[10px] font-bold text-zinc-950 px-1.5 py-0.2 rounded bg-[#D6FF00] shadow-sm">
                Purchase
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card Taxas de Conversão: Preto com destaque Neon */}
      <div className="relative overflow-hidden rounded-xl bg-[#121212] border border-[#242424] p-4 sm:p-5 hover:border-[#383838] transition-all flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between gap-1 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#BCBCBC]">
            Taxas de Conversão
          </span>
          <div className="p-1.5 rounded-lg border bg-[#1a1a1a] border-[#2c2c2c] text-[#D6FF00] shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Conversa → Teste</span>
            <span className="font-bold text-[#D6FF00] text-sm sm:text-base">
              {isLoading ? '...' : `${convToTest.toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Teste → Pago</span>
            <span className="font-bold text-white text-sm sm:text-base">
              {isLoading ? '...' : `${testToPaid.toFixed(1)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-medium">Conversa → Pago</span>
            <span className="font-bold text-[#D6FF00] text-sm sm:text-base">
              {isLoading ? '...' : `${convToPaid.toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Card Faturamento Total: Cinza Prata (#BCBCBC) com texto escuro invertido */}
      <div className="relative overflow-hidden rounded-xl bg-[#BCBCBC] border border-[#a8a8a8] p-4 sm:p-5 hover:border-[#969696] transition-all flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between gap-1 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
            Faturamento Total
          </span>
          <div className="p-1.5 rounded-lg bg-zinc-950 text-[#D6FF00] shrink-0 shadow-sm">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
              {isLoading
                ? '...'
                : `R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-950 text-[#D6FF00] shadow-sm">
              R$ 29 / mês
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-700 pt-2 border-t border-zinc-400">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Assinaturas Ativas</span>
            <span className="font-extrabold text-zinc-950">
              {isLoading ? '...' : `${metrics.totalPaid} ${metrics.totalPaid === 1 ? 'cliente' : 'clientes'}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
