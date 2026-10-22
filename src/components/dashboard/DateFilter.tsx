'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'

export type DatePeriod = 'dia' | 'semana' | 'mes' | 'tudo' | 'custom'

interface DateFilterProps {
  period: DatePeriod
  onPeriodChange: (period: DatePeriod) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (val: string) => void
  onCustomEndChange: (val: string) => void
}

export function DateFilter({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: DateFilterProps) {
  const [showCustomInputs, setShowCustomInputs] = useState(period === 'custom')

  function handleSelect(p: DatePeriod) {
    onPeriodChange(p)
    if (p === 'custom') {
      setShowCustomInputs(true)
    } else {
      setShowCustomInputs(false)
    }
  }

  const buttons: { id: DatePeriod; label: string }[] = [
    { id: 'dia', label: 'Hoje (Dia)' },
    { id: 'semana', label: 'Esta Semana' },
    { id: 'mes', label: 'Este Mês' },
    { id: 'tudo', label: 'Todo o Período' },
    { id: 'custom', label: 'Personalizado' },
  ]

  return (
    <div className="rounded-xl bg-[#121212] border border-[#242424] p-3 sm:p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Botões Rápidos */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {buttons.map((b) => {
            const isActive = period === b.id
            return (
              <button
                key={b.id}
                onClick={() => handleSelect(b.id)}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#D6FF00] text-[#121212] shadow-sm shadow-[#D6FF00]/20'
                    : 'bg-[#181818] hover:bg-[#222222] text-[#BCBCBC] hover:text-white border border-[#282828]'
                }`}
              >
                {b.label}
              </button>
            )
          })}
        </div>

        {/* Indicador sutil de filtro ativo */}
        <div className="text-[11px] text-[#BCBCBC] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#D6FF00]" />
          <span>Filtro de período ativo</span>
        </div>
      </div>

      {/* Caixa de Período Personalizado */}
      {showCustomInputs && (
        <div className="pt-3 border-t border-[#242424] flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#BCBCBC]">De:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-xs text-white focus:outline-none focus:border-[#D6FF00] transition-colors scheme-dark"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#BCBCBC]">Até:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2c2c2c] text-xs text-white focus:outline-none focus:border-[#D6FF00] transition-colors scheme-dark"
            />
          </div>

          {(customStart || customEnd) && (
            <button
              onClick={() => {
                onCustomStartChange('')
                onCustomEndChange('')
              }}
              className="text-xs text-[#D6FF00] hover:text-rose-400 transition-colors"
            >
              [ Limpar datas ]
            </button>
          )}
        </div>
      )}
    </div>
  )
}
