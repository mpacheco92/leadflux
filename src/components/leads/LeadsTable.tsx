'use client'

import { useState } from 'react'
import {
  Search,
  MessageCircle,
  ExternalLink,
  Loader2,
  Filter,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export interface Lead {
  id: string
  phone: string
  name: string | null
  status: 'novo_lead' | 'teste_ativo' | 'pago' | 'perdido' | string
  trial_started_at: string | null
  paid_at: string | null
  ctwa?: string | null
  created_at: string
}

interface LeadsTableProps {
  leads: Lead[]
  onLeadUpdated?: () => void
}

interface PendingChange {
  lead: Lead
  targetStatus: 'novo_lead' | 'teste_ativo' | 'pago'
}

export function LeadsTable({ leads, onLeadUpdated }: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'novo_lead' | 'teste_ativo' | 'pago'>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      statusFilter === 'all' ? true : lead.status === statusFilter

    const matchesSearch =
      (lead.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)

    return matchesFilter && matchesSearch
  })

  function handleFilterChange(filter: 'all' | 'novo_lead' | 'teste_ativo' | 'pago') {
    setStatusFilter(filter)
    setCurrentPage(1)
  }

  function handleSearchChange(term: string) {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage)

  function handleSelectStatus(lead: Lead, targetStatus: 'novo_lead' | 'teste_ativo' | 'pago') {
    if (lead.status === targetStatus) return

    if (targetStatus === 'pago' || lead.status === 'pago') {
      setPendingChange({ lead, targetStatus })
      return
    }

    executeUpdateStatus(lead.id, targetStatus)
  }

  async function executeUpdateStatus(leadId: string, status: string) {
    setProcessingId(leadId)
    setPendingChange(null)

    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        onLeadUpdated?.()
      } else {
        alert('Erro ao atualizar status do lead')
      }
    } catch {
      alert('Erro de conexão ao atualizar status')
    } finally {
      setProcessingId(null)
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatPhone(phone: string) {
    if (phone.length === 13 && phone.startsWith('55')) {
      return `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`
    }
    return phone
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'pago':
        return 'Pago (R$ 29)'
      case 'teste_ativo':
        return 'Teste Ativo'
      case 'novo_lead':
        return 'Novo Lead'
      default:
        return status
    }
  }

  return (
    <div className="rounded-xl sm:rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md overflow-hidden">
      {/* Top Bar: Filtros e Busca */}
      <div className="p-3.5 sm:p-5 md:p-6 border-b border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex rounded-xl bg-slate-800/70 p-1 border border-slate-700/50 shrink-0">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({leads.length})
            </button>
            <button
              onClick={() => handleFilterChange('novo_lead')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === 'novo_lead'
                  ? 'bg-slate-600/40 text-slate-200 border border-slate-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Novos
            </button>
            <button
              onClick={() => handleFilterChange('teste_ativo')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === 'teste_ativo'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Testes
            </button>
            <button
              onClick={() => handleFilterChange('pago')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === 'pago'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pagos
            </button>
          </div>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      {/* Visualização Mobile: Cards Paginados */}
      <div className="md:hidden divide-y divide-slate-800/70">
        {paginatedLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum lead encontrado neste filtro.
          </div>
        ) : (
          paginatedLeads.map((lead) => {
            const isProcessing = processingId === lead.id

            return (
              <div key={lead.id} className="p-4 space-y-3 hover:bg-slate-800/20">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-white truncate">
                    {lead.name || 'Contato WhatsApp'}
                  </span>
                  
                  {/* Seletor Rápido de Status no Mobile */}
                  <div className="relative shrink-0">
                    <select
                      value={lead.status}
                      disabled={isProcessing}
                      onChange={(e) =>
                        handleSelectStatus(lead, e.target.value as any)
                      }
                      className={`text-[10px] font-semibold py-1 pl-2.5 pr-6 rounded-full border appearance-none focus:outline-none cursor-pointer ${
                        lead.status === 'pago'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : lead.status === 'teste_ativo'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-slate-700/40 text-slate-300 border-slate-600/50'
                      }`}
                    >
                      <option value="novo_lead" className="bg-slate-900 text-white">
                        Novo Lead
                      </option>
                      <option value="teste_ativo" className="bg-slate-900 text-white">
                        Teste Ativo
                      </option>
                      <option value="pago" className="bg-slate-900 text-white">
                        Pago (R$ 29)
                      </option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <a
                    href={`https://wa.me/${lead.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono text-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {formatPhone(lead.phone)}
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>

                  <span className="text-[11px] text-slate-500">
                    {formatDate(lead.paid_at || lead.trial_started_at || lead.created_at)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Visualização Desktop: Tabela Paginada */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/40 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800/80">
            <tr>
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Telefone / WhatsApp</th>
              <th className="px-6 py-4">Início do Teste</th>
              <th className="px-6 py-4">Data Pagamento</th>
              <th className="px-6 py-4 text-right">Alterar Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Nenhum lead encontrado neste filtro.
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const isProcessing = processingId === lead.id

                return (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {lead.name || 'Contato WhatsApp'}
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`https://wa.me/${lead.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        {formatPhone(lead.phone)}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(lead.trial_started_at)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(lead.paid_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isProcessing ? (
                        <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          Atualizando...
                        </div>
                      ) : (
                        <div className="relative inline-block text-left">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleSelectStatus(lead, e.target.value as any)
                            }
                            className={`text-xs font-semibold py-1.5 pl-3 pr-7 rounded-xl border appearance-none focus:outline-none cursor-pointer transition-all ${
                              lead.status === 'pago'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                                : lead.status === 'teste_ativo'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/80'
                            }`}
                          >
                            <option value="novo_lead" className="bg-slate-900 text-white">
                              Novo Lead
                            </option>
                            <option value="teste_ativo" className="bg-slate-900 text-white">
                              Teste Ativo
                            </option>
                            <option value="pago" className="bg-slate-900 text-white">
                              Pago (R$ 29)
                            </option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de Paginação */}
      {filteredLeads.length > 0 && (
        <div className="p-3.5 sm:p-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Mostrando <strong className="text-white">{startIndex + 1}</strong> a{' '}
            <strong className="text-white">
              {Math.min(startIndex + itemsPerPage, filteredLeads.length)}
            </strong>{' '}
            de <strong className="text-white">{filteredLeads.length}</strong> leads
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Anterior
            </button>

            {/* Números de Página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Próxima
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Adicionar ou Remover Pago */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-base">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Confirmação de Alteração
              </div>
              <button
                onClick={() => setPendingChange(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <p>
                Lead: <strong className="text-white">{pendingChange.lead.name || pendingChange.lead.phone}</strong>
              </p>

              {pendingChange.targetStatus === 'pago' ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-1.5">
                  <p className="font-semibold text-emerald-400">
                    Confirmar assinatura (Pago - R$ 29,00)?
                  </p>
                  <p className="text-slate-300">
                    Isso registrará a venda no faturamento e enviará o evento <strong>Purchase</strong> diretamente para o Meta Pixel.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1.5">
                  <p className="font-semibold text-amber-400">
                    Remover marcação de Pago?
                  </p>
                  <p className="text-slate-300">
                    O lead voltará para o status <strong>{getStatusLabel(pendingChange.targetStatus)}</strong> e o faturamento do painel será recalculado.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingChange(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  executeUpdateStatus(
                    pendingChange.lead.id,
                    pendingChange.targetStatus
                  )
                }
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all ${
                  pendingChange.targetStatus === 'pago'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                }`}
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
