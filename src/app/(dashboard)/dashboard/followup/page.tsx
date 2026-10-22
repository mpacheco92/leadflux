'use client'

import { useEffect, useState } from 'react'
import { FollowupTable, FollowupRecord } from '@/components/followup/FollowupTable'
import { RefreshCw, MessageSquare } from 'lucide-react'

export default function FollowupDashboardPage() {
  const [followups, setFollowups] = useState<FollowupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadFollowupData() {
    try {
      const res = await fetch('/api/dashboard/followups')
      if (res.ok) {
        const data = await res.json()
        setFollowups(data.followups || [])
      }
    } catch (err) {
      console.error('Erro ao carregar dados de follow-up:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFollowupData()
    const interval = setInterval(loadFollowupData, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleManualRefresh() {
    setRefreshing(true)
    loadFollowupData()
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Disparos de Follow-up
          </h1>
          <p className="text-xs sm:text-sm text-[#BCBCBC] mt-0.5">
            Acompanhe em tempo real as mensagens enviadas para cada lead
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#181818] border border-[#282828] hover:bg-[#202020] text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#D6FF00]' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* Tabela de Followups com paginação e modal */}
      <FollowupTable followups={followups} loading={loading} />
    </div>
  )
}
