'use client'

import { useEffect, useState } from 'react'
import { CapiLogsTable, CapiLog } from '@/components/dashboard/CapiLogsTable'
import { RefreshCw, Activity, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<CapiLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadLogs() {
    try {
      const res = await fetch('/api/dashboard/data')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Erro ao buscar logs da auditoria:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadLogs()
    const interval = setInterval(loadLogs, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleManualRefresh() {
    setRefreshing(true)
    loadLogs()
  }

  const totalSuccess = logs.filter((l) => l.status === 'success').length
  const totalErrors = logs.filter((l) => l.status === 'error').length

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] flex items-center justify-center text-[#D6FF00]">
              <Activity className="w-4 h-4" />
            </div>
            Auditoria Meta CAPI
          </h1>
          <p className="text-sm text-[#BCBCBC] mt-1">
            Registro detalhado e respostas da Conversions API do Facebook / Meta
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

      {/* Mini resumo de integridade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl bg-white border border-zinc-200 p-4 shadow-md text-zinc-950">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Total de Eventos</span>
          <div className="text-2xl font-extrabold text-zinc-950 mt-1">
            {loading ? '...' : logs.length}
          </div>
        </div>
        <div className="rounded-xl bg-[#121212] border border-[#242424] p-4 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D6FF00]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recebidos pela Meta (200 OK)
          </div>
          <div className="text-2xl font-bold text-[#D6FF00] mt-1">
            {loading ? '...' : totalSuccess}
          </div>
        </div>
        <div className="rounded-xl bg-[#BCBCBC] border border-[#a8a8a8] p-4 shadow-md text-zinc-950">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-800">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Falhas de Envio
          </div>
          <div className="text-2xl font-extrabold text-zinc-950 mt-1">
            {loading ? '...' : totalErrors}
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <section className="space-y-4">
        <CapiLogsTable logs={logs} />
      </section>
    </div>
  )
}
