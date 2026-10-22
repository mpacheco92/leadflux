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
  Plus,
  Pencil,
  Check,
  Copy,
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

  // Estado para Adição Manual de Lead
  const [isAddingLead, setIsAddingLead] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')
  const [newStatus, setNewStatus] = useState<'novo_lead' | 'teste_ativo' | 'pago'>('novo_lead')
  const [submittingLead, setSubmittingLead] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Estado para Edição do Nome do Lead
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)

  // Estado para feedback de cópia de telefone
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)

  async function handleCopyPhone(phone: string) {
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedPhone(phone)
      setTimeout(() => setCopiedPhone(null), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = phone
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedPhone(phone)
      setTimeout(() => setCopiedPhone(null), 2000)
    }
  }

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

  async function handleManualAddLead(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!newPhone.trim()) {
      setAddError('Por favor, informe o número de telefone')
      return
    }

    setSubmittingLead(true)
    setAddError(null)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: newPhone.trim(),
          name: newName.trim() || undefined,
          status: newStatus,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setNewPhone('')
        setNewName('')
        setNewStatus('novo_lead')
        setIsAddingLead(false)
        onLeadUpdated?.()
      } else {
        setAddError(data.error || 'Erro ao adicionar lead')
      }
    } catch {
      setAddError('Erro de conexão ao adicionar lead')
    } finally {
      setSubmittingLead(false)
    }
  }

  async function handleSaveLeadName(leadId: string) {
    setIsSavingName(true)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName }),
      })

      if (res.ok) {
        setEditingLeadId(null)
        onLeadUpdated?.()
      } else {
        alert('Erro ao atualizar nome do lead')
      }
    } catch {
      alert('Erro de conexão ao salvar nome')
    } finally {
      setIsSavingName(false)
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
    <div className="rounded-xl bg-[#121212] border border-[#242424] overflow-hidden shadow-sm">
      {/* Top Bar: Filtros, Botão Adicionar e Busca */}
      <div className="p-3.5 sm:p-5 border-b border-[#242424] flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-[#BCBCBC] shrink-0" />
            <div className="flex rounded-lg bg-[#181818] p-1 border border-[#282828] shrink-0 text-xs">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs whitespace-nowrap transition-all ${
                  statusFilter === 'all'
                    ? 'bg-[#D6FF00] text-[#121212] shadow-sm font-bold'
                    : 'text-[#BCBCBC] hover:text-white'
                }`}
              >
                Todos ({leads.length})
              </button>
              <button
                onClick={() => handleFilterChange('novo_lead')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs whitespace-nowrap transition-all ${
                  statusFilter === 'novo_lead'
                    ? 'bg-[#242424] text-white border border-[#383838] font-semibold'
                    : 'text-[#BCBCBC] hover:text-white'
                }`}
              >
                Novos
              </button>
              <button
                onClick={() => handleFilterChange('teste_ativo')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs whitespace-nowrap transition-all ${
                  statusFilter === 'teste_ativo'
                    ? 'bg-[#242424] text-[#D6FF00] border border-[#383838] font-semibold'
                    : 'text-[#BCBCBC] hover:text-white'
                }`}
              >
                Testes
              </button>
              <button
                onClick={() => handleFilterChange('pago')}
                className={`px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs whitespace-nowrap transition-all ${
                  statusFilter === 'pago'
                    ? 'bg-[#D6FF00] text-[#121212] font-bold'
                    : 'text-[#BCBCBC] hover:text-white'
                }`}
              >
                Pagos
              </button>
            </div>
          </div>

          {/* Botão Novo Lead Manual */}
          <button
            onClick={() => {
              setIsAddingLead(!isAddingLead)
              setAddError(null)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D6FF00] hover:bg-[#c4eb00] text-[#121212] text-xs font-bold transition-all shadow-sm shrink-0"
          >
            {isAddingLead ? (
              <>
                <X className="w-3.5 h-3.5" />
                Fechar
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Adicionar Lead
              </>
            )}
          </button>
        </div>

        {/* Input / Form de Adicionar Lead */}
        {isAddingLead && (
          <form
            onSubmit={handleManualAddLead}
            className="p-3.5 rounded-xl bg-[#181818] border border-[#2c2c2c] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="flex-1">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Número / WhatsApp (apenas números, ex: 5554994235261)..."
                className="w-full px-3 py-2 bg-[#121212] border border-[#2c2c2c] rounded-lg text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D6FF00]"
              />
            </div>

            <div className="sm:w-44">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome (opcional)"
                className="w-full px-3 py-2 bg-[#121212] border border-[#2c2c2c] rounded-lg text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D6FF00]"
              />
            </div>

            <div className="sm:w-36">
              <select
                value={newStatus}
                onChange={(e: any) => setNewStatus(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#121212] border border-[#2c2c2c] rounded-lg text-xs text-white focus:outline-none focus:border-[#D6FF00]"
              >
                <option value="novo_lead">Novo Lead</option>
                <option value="teste_ativo">Teste Ativo</option>
                <option value="pago">Pago</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={submittingLead}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#D6FF00] hover:bg-[#c4eb00] text-[#121212] text-xs font-bold transition-all disabled:opacity-50"
              >
                {submittingLead ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                Salvar Lead
              </button>

              <button
                type="button"
                onClick={() => setIsAddingLead(false)}
                className="px-2.5 py-2 rounded-lg text-xs text-[#BCBCBC] hover:text-white hover:bg-[#242424] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
        {addError && isAddingLead && (
          <span className="text-xs text-rose-400 font-medium px-1">
            {addError}
          </span>
        )}

        {/* Input de Busca */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#BCBCBC] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar nome ou telefone..."
            className="w-full pl-10 pr-4 py-2 bg-[#181818] border border-[#282828] rounded-lg text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D6FF00] transition-colors"
          />
        </div>
      </div>

      {/* Visualização Mobile: Cards Paginados */}
      <div className="md:hidden divide-y divide-[#242424]">
        {paginatedLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#BCBCBC]">
            Nenhum lead encontrado neste filtro.
          </div>
        ) : (
          paginatedLeads.map((lead) => {
            const isProcessing = processingId === lead.id

            return (
              <div key={lead.id} className="p-4 space-y-3 hover:bg-[#181818] transition-colors border-b border-[#242424] last:border-b-0">
                <div className="flex items-center justify-between gap-2">
                  {editingLeadId === lead.id ? (
                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                      <input
                        type="text"
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Nome do lead..."
                        className="px-2 py-1 bg-[#181818] border border-[#383838] focus:border-[#D6FF00] rounded-md text-xs text-white focus:outline-none w-full"
                      />
                      <button
                        onClick={() => handleSaveLeadName(lead.id)}
                        disabled={isSavingName}
                        className="p-1 rounded-md bg-[#D6FF00] text-[#121212] shrink-0"
                      >
                        {isSavingName ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingLeadId(null)}
                        className="p-1 rounded-md text-zinc-400 hover:text-white shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-sm text-white truncate">
                        {lead.name || 'Contato WhatsApp'}
                      </span>
                      <button
                        onClick={() => {
                          setEditingLeadId(lead.id)
                          setEditingName(lead.name || '')
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-[#D6FF00] transition-colors shrink-0"
                        title="Editar nome"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  
                  {/* Seletor Rápido de Status no Mobile */}
                  <div className="relative shrink-0">
                    <select
                      value={lead.status}
                      disabled={isProcessing}
                      onChange={(e) =>
                        handleSelectStatus(lead, e.target.value as any)
                      }
                      className={`text-[10px] font-semibold py-1 pl-2.5 pr-6 rounded-md border appearance-none focus:outline-none cursor-pointer ${
                        lead.status === 'pago'
                          ? 'bg-[#D6FF00] text-[#121212] font-bold border-[#D6FF00]'
                          : lead.status === 'teste_ativo'
                          ? 'bg-[#1e1e1e] text-[#D6FF00] border-[#333333]'
                          : 'bg-[#161616] text-white border-[#282828]'
                      }`}
                    >
                      <option value="novo_lead" className="bg-[#121212] text-white">
                        Novo Lead
                      </option>
                      <option value="teste_ativo" className="bg-[#121212] text-white">
                        Teste Ativo
                      </option>
                      <option value="pago" className="bg-[#121212] text-white">
                        Pago (R$ 29)
                      </option>
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#BCBCBC]">
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(lead.phone)}
                    title="Clique para copiar o número"
                    className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-[#D6FF00] hover:underline transition-colors group cursor-pointer"
                  >
                    {copiedPhone === lead.phone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#D6FF00]" />
                        <span className="font-bold text-white">{formatPhone(lead.phone)}</span>
                        <span className="text-[10px] text-[#D6FF00] font-bold bg-[#D6FF00]/15 px-1.5 py-0.2 rounded">
                          Copiado!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#BCBCBC] group-hover:text-[#D6FF00] transition-colors" />
                        <span>{formatPhone(lead.phone)}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#242424] text-[11px]">
                  <div>
                    <span className="text-[#BCBCBC] block text-[10px]">Início Conversa:</span>
                    <span className="text-white font-medium">{formatDate(lead.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-[#BCBCBC] block text-[10px]">Início do Teste:</span>
                    <span className="text-white font-medium">{formatDate(lead.trial_started_at)}</span>
                  </div>
                  {lead.paid_at && (
                    <div className="col-span-2">
                      <span className="text-[#D6FF00] block text-[10px]">Data Pagamento:</span>
                      <span className="text-white font-medium">{formatDate(lead.paid_at)}</span>
                    </div>
                  )}
                </div>
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
              <th className="px-5 py-3.5">Lead</th>
              <th className="px-5 py-3.5">Telefone / WhatsApp</th>
              <th className="px-5 py-3.5">Início Conversa</th>
              <th className="px-5 py-3.5">Início do Teste</th>
              <th className="px-5 py-3.5">Data Pagamento</th>
              <th className="px-5 py-3.5 text-right">Alterar Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f] font-medium">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#BCBCBC] text-xs">
                  Nenhum lead encontrado neste filtro.
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const isProcessing = processingId === lead.id

                return (
                  <tr key={lead.id} className="hover:bg-[#181818] transition-colors">
                    <td className="px-5 py-3.5">
                      {editingLeadId === lead.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveLeadName(lead.id)
                              if (e.key === 'Escape') setEditingLeadId(null)
                            }}
                            placeholder="Nome..."
                            className="px-2.5 py-1 bg-[#181818] border border-[#383838] focus:border-[#D6FF00] rounded-md text-xs text-white focus:outline-none w-36"
                          />
                          <button
                            onClick={() => handleSaveLeadName(lead.id)}
                            disabled={isSavingName}
                            title="Salvar"
                            className="p-1 rounded-md bg-[#D6FF00] text-[#121212] hover:bg-[#c4eb00] transition-colors"
                          >
                            {isSavingName ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingLeadId(null)}
                            disabled={isSavingName}
                            title="Cancelar"
                            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#222222] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className="font-semibold text-white">
                            {lead.name || 'Contato WhatsApp'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingLeadId(lead.id)
                              setEditingName(lead.name || '')
                            }}
                            title="Editar nome"
                            className="p-1 rounded-md text-zinc-500 hover:text-[#D6FF00] hover:bg-[#1f1f1f] transition-all opacity-60 group-hover:opacity-100"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(lead.phone)}
                        title="Clique para copiar o número"
                        className="inline-flex items-center gap-1.5 py-0.5 text-xs font-medium text-[#D6FF00] hover:underline transition-colors group cursor-pointer"
                      >
                        {copiedPhone === lead.phone ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#D6FF00]" />
                            <span className="font-bold text-white">{formatPhone(lead.phone)}</span>
                            <span className="text-[10px] text-[#D6FF00] font-bold bg-[#D6FF00]/15 px-1.5 py-0.2 rounded">
                              Copiado!
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#BCBCBC] group-hover:text-[#D6FF00] transition-colors" />
                            <span>{formatPhone(lead.phone)}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#BCBCBC]">
                      {formatDate(lead.trial_started_at)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#BCBCBC]">
                      {formatDate(lead.paid_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isProcessing ? (
                        <div className="inline-flex items-center gap-1 text-xs text-[#BCBCBC]">
                          <Loader2 className="w-4 h-4 animate-spin text-[#D6FF00]" />
                          Atualizando...
                        </div>
                      ) : (
                        <div className="relative inline-block text-left">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleSelectStatus(lead, e.target.value as any)
                            }
                            className={`text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg border appearance-none focus:outline-none cursor-pointer transition-all ${
                              lead.status === 'pago'
                                ? 'bg-[#D6FF00] text-[#121212] font-bold border-[#D6FF00] hover:bg-[#c2e600]'
                                : lead.status === 'teste_ativo'
                                ? 'bg-[#1e1e1e] text-[#D6FF00] border-[#333333] hover:bg-[#252525]'
                                : 'bg-[#161616] text-white border-[#282828] hover:bg-[#222222]'
                            }`}
                          >
                            <option value="novo_lead" className="bg-[#121212] text-white">
                              Novo Lead
                            </option>
                            <option value="teste_ativo" className="bg-[#121212] text-white">
                              Teste Ativo
                            </option>
                            <option value="pago" className="bg-[#121212] text-white">
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
        <div className="p-3.5 sm:p-4 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#BCBCBC]">
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
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#2c2c2c] bg-[#181818] hover:bg-[#222222] text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
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

      {/* Modal de Confirmação para Adicionar ou Remover Pago */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#141414] border border-[#2a2a2a] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <div className="flex items-center gap-2 text-[#D6FF00] font-semibold text-base">
                <AlertTriangle className="w-5 h-5 text-[#D6FF00]" />
                Confirmação de Alteração
              </div>
              <button
                onClick={() => setPendingChange(null)}
                className="p-1 text-[#BCBCBC] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-zinc-200">
              <p>
                Lead: <strong className="text-white">{pendingChange.lead.name || pendingChange.lead.phone}</strong>
              </p>

              {pendingChange.targetStatus === 'pago' ? (
                <div className="p-3.5 rounded-xl bg-[#1c2005] border border-[#3c4600] text-zinc-200 text-xs space-y-1.5">
                  <p className="font-bold text-[#D6FF00]">
                    Confirmar assinatura (Pago - R$ 29,00)?
                  </p>
                  <p className="text-[#BCBCBC]">
                    Isso registrará a venda no faturamento e enviará o evento <strong>Purchase</strong> diretamente para o Meta Pixel.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-200 text-xs space-y-1.5">
                  <p className="font-bold text-[#D6FF00]">
                    Remover marcação de Pago?
                  </p>
                  <p className="text-[#BCBCBC]">
                    O lead voltará para o status <strong>{getStatusLabel(pendingChange.targetStatus)}</strong> e o faturamento do painel será recalculado.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingChange(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1e1e1e] hover:bg-[#282828] border border-[#333333] transition-colors"
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#121212] bg-[#D6FF00] hover:bg-[#c2e600] shadow-lg shadow-[#D6FF00]/20 transition-all"
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
