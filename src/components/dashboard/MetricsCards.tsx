'use client'

import { Users, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react'

export interface MetricsData {
  totalTests: number
  totalPaid: number
  conversionRate: number
  totalRevenue: number
}

interface MetricsCardsProps {
  metrics: MetricsData
  isLoading?: boolean
}

export function MetricsCards({ metrics, isLoading = false }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Testes Liberados',
      value: metrics.totalTests,
      formatter: (v: number) => v.toLocaleString('pt-BR'),
      icon: Users,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      badge: 'StartTrial CAPI',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      title: 'Assinaturas Fechadas',
      value: metrics.totalPaid,
      formatter: (v: number) => v.toLocaleString('pt-BR'),
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      badge: 'Purchase CAPI',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Taxa de Conversão',
      value: metrics.conversionRate,
      formatter: (v: number) => `${v.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
      badge: 'Teste → Pago',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    },
    {
      title: 'Faturamento Total',
      value: metrics.totalRevenue,
      formatter: (v: number) =>
        `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
      badge: 'R$ 29,00 / mês',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3 sm:p-5 md:p-6 backdrop-blur-md transition-all hover:border-slate-700/80"
          >
            <div className="flex items-center justify-between gap-1 mb-2 sm:mb-4">
              <span className="text-xs sm:text-sm font-medium text-slate-400 line-clamp-1">
                {card.title}
              </span>
              <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border bg-gradient-to-br ${card.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1.5">
              <span className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
                {isLoading ? '...' : card.formatter(card.value)}
              </span>
              <span
                className={`text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-full border self-start sm:self-auto ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
