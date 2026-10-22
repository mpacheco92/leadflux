'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export interface CapiLog {
  id: string
  lead_id: string
  event_name: 'LeadSubmitted' | 'Purchase' | string
  status: 'success' | 'error' | string
  meta_response: any
  created_at: string
  leads?: {
    phone: string
    name: string | null
  }
}

interface CapiLogsTableProps {
  logs: CapiLog[]
}

export function CapiLogsTable({ logs }: CapiLogsTableProps) {
  const [selectedPayload, setSelectedPayload] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.max(1, Math.ceil(logs.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage)

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="rounded-xl bg-[#121212] border border-[#242424] overflow-hidden shadow-sm">
      <div className="p-3.5 sm:p-5 md:p-6 border-b border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#D6FF00] shrink-0" />
          <div>
            <h2 className="font-semibold text-white text-sm sm:text-base">
              Auditoria Meta CAPI
            </h2>
            <p className="text-[11px] sm:text-xs text-[#BCBCBC]">
              Eventos enviados ao Pixel do Facebook
            </p>
          </div>
        </div>
        <span className="text-[11px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#181818] border border-[#2c2c2c] text-[#BCBCBC] self-start sm:self-auto font-medium">
          {logs.length} eventos registrados
        </span>
      </div>

      {/* Visualização Mobile: Cards Paginados */}
      <div className="md:hidden divide-y divide-[#242424]">
        {paginatedLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#BCBCBC]">
            Nenhum evento registrado ainda.
          </div>
        ) : (
          paginatedLogs.map((log) => {
            const isSuccess = log.status === 'success'
            const isPurchase = log.event_name === 'Purchase'

            return (
              <div key={log.id} className="p-3.5 space-y-2 hover:bg-[#181818] transition-colors">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isPurchase
                        ? 'bg-[#D6FF00] text-[#121212] font-bold border-[#D6FF00]'
                        : 'bg-[#1e1e1e] text-[#D6FF00] border-[#333333]'
                    }`}
                  >
                    {log.event_name}
                  </span>

                  {isSuccess ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#D6FF00] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      200 OK
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Erro
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-white text-xs truncate max-w-[200px]">
                    {log.leads?.name || log.leads?.phone || 'Lead: ' + log.lead_id?.slice(0, 8)}
                  </span>
                  <span className="text-[10px] text-[#BCBCBC]">
                    {formatDate(log.created_at)}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedPayload(log.meta_response)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-medium text-white bg-[#181818] hover:bg-[#222222] border border-[#2c2c2c] transition-colors"
                >
                  <Eye className="w-3 h-3 text-[#D6FF00]" />
                  Ver Resposta da Meta
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Visualização Desktop: Tabela Paginada */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-[#0c0c0c] text-[11px] uppercase text-[#BCBCBC] tracking-wider border-b border-[#242424]">
            <tr>
              <th className="px-6 py-4">Evento Meta</th>
              <th className="px-6 py-4">Lead / Contato</th>
              <th className="px-6 py-4">Status de Envio</th>
              <th className="px-6 py-4">Horário</th>
              <th className="px-6 py-4 text-right">Resposta Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f] font-medium">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-[#BCBCBC] text-xs">
                  Nenhum evento registrado ainda.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const isSuccess = log.status === 'success'
                const isPurchase = log.event_name === 'Purchase'

                return (
                  <tr key={log.id} className="hover:bg-[#181818] transition-colors">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${
                          isPurchase
                            ? 'bg-[#D6FF00] text-[#121212] font-bold border-[#D6FF00]'
                            : 'bg-[#1e1e1e] text-[#D6FF00] border-[#333333]'
                        }`}
                      >
                        {log.event_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-white">
                      {log.leads?.name || log.leads?.phone || 'Lead ID: ' + log.lead_id?.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      {isSuccess ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#D6FF00] font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[#D6FF00]" />
                          200 OK (Entregue)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          Falha no Envio
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#BCBCBC]">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedPayload(log.meta_response)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-white bg-[#181818] hover:bg-[#222222] border border-[#2c2c2c] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#D6FF00]" />
                        Ver Resposta
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginação da Auditoria */}
      {logs.length > 0 && (
        <div className="p-3.5 sm:p-4 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#BCBCBC]">
          <div>
            Mostrando <strong className="text-white">{startIndex + 1}</strong> a{' '}
            <strong className="text-white">
              {Math.min(startIndex + itemsPerPage, logs.length)}
            </strong>{' '}
            de <strong className="text-white">{logs.length}</strong> eventos
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2c2c2c] bg-[#181818] hover:bg-[#222222] text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#D6FF00] text-[#121212] shadow-sm font-bold'
                      : 'text-[#BCBCBC] hover:text-white hover:bg-[#202020]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2c2c2c] bg-[#181818] hover:bg-[#222222] text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Inspeção do JSON */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#141414] border border-[#2c2c2c] p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <h3 className="text-sm font-semibold text-white">
                Resposta Oficial da Meta
              </h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="p-1 text-[#BCBCBC] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="mt-4 p-3 sm:p-4 rounded-xl bg-[#0c0c0c] text-[#D6FF00] font-mono text-[11px] sm:text-xs overflow-x-auto max-h-72 border border-[#242424]">
              {JSON.stringify(selectedPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
