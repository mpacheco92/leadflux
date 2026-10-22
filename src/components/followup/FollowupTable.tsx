'use client'

import { useState } from 'react'
import {
  Search,
  MessageSquare,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react'

export interface FollowupRecord {
  id: string
  leadId: string
  phone: string
  name: string | null
  currentStatus: string
  grupo: 'grupo1' | 'grupo2' | string
  msgNumber: number
  sentAt: string
  messageText: string
}

interface FollowupTableProps {
  followups: FollowupRecord[]
  loading?: boolean
}

export function FollowupTable({ followups, loading = false }: FollowupTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [grupoFilter, setGrupoFilter] = useState<'all' | 'grupo1' | 'grupo2'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<FollowupRecord | null>(null)
  const [copiedText, setCopiedText] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null)

  const itemsPerPage = 10

  async function handleCopyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch {
      // fallback
    }
  }

  async function handleCopyPhone(phone: string) {
    const digits = phone.replace(/\D/g, '')
    const cleanPhone = digits.startsWith('55') ? digits : `55${digits}`
    try {
      await navigator.clipboard.writeText(cleanPhone)
      setCopiedPhone(phone)
      setTimeout(() => setCopiedPhone(null), 2000)
    } catch {
      // fallback
    }
  }

  const filteredItems = followups.filter((item) => {
    const matchesGrupo =
      grupoFilter === 'all' ? true : item.grupo === grupoFilter

    const matchesSearch =
      (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm)

    return matchesGrupo && matchesSearch
  })

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  function formatDateTime(dateString: string) {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatPhone(phone: string) {
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 13) {
      // 55 22 98153-7325
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
    }
    if (digits.length === 12) {
      return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 8)}-${digits.slice(8)}`
    }
    return phone
  }

  return (
    <div className="bg-[#121212] border border-[#242424] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header com Filtros e Busca */}
      <div className="p-4 sm:p-6 border-b border-[#242424] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#D6FF00]" />
              Envios de Follow-up
            </h2>
            <p className="text-xs text-[#BCBCBC]/70 mt-0.5">
              Histórico detalhado de disparos automáticos para cada lead
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#BCBCBC] bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
              Total de envios: <strong className="text-white">{filteredItems.length}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Tabs de Filtro de Grupo */}
          <div className="flex items-center gap-1.5 p-1 bg-[#181818] rounded-xl border border-[#242424] w-fit">
            <button
              onClick={() => {
                setGrupoFilter('all')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                grupoFilter === 'all'
                  ? 'bg-[#D6FF00] text-black shadow-sm'
                  : 'text-[#BCBCBC] hover:text-white'
              }`}
            >
              Todos ({followups.length})
            </button>
            <button
              onClick={() => {
                setGrupoFilter('grupo1')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                grupoFilter === 'grupo1'
                  ? 'bg-[#D6FF00] text-black shadow-sm'
                  : 'text-[#BCBCBC] hover:text-white'
              }`}
            >
              Lead Novo [Grupo 1]
            </button>
            <button
              onClick={() => {
                setGrupoFilter('grupo2')
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                grupoFilter === 'grupo2'
                  ? 'bg-[#D6FF00] text-black shadow-sm'
                  : 'text-[#BCBCBC] hover:text-white'
              }`}
            >
              Teste Ativo [Grupo 2]
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#BCBCBC]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full bg-[#181818] border border-[#282828] focus:border-[#D6FF00] text-xs text-white rounded-xl pl-9 pr-4 py-2 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tabela de Registros */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#242424] text-[11px] font-semibold text-[#BCBCBC]/60 uppercase tracking-wider bg-[#141414]">
              <th className="py-3.5 px-4 sm:px-6">Lead</th>
              <th className="py-3.5 px-4 sm:px-6">Telefone / WhatsApp</th>
              <th className="py-3.5 px-4 sm:px-6">Status / Grupo</th>
              <th className="py-3.5 px-4 sm:px-6">Mensagem</th>
              <th className="py-3.5 px-4 sm:px-6">Horário do Envio</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#BCBCBC]">
                  Carregando registros de follow-up...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#BCBCBC]/60">
                  Nenhum envio de follow-up encontrado.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const isGrupo1 = item.grupo === 'grupo1'
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-[#181818]/80 cursor-pointer transition-colors group"
                  >
                    {/* Nome do Lead */}
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#202020] border border-[#303030] flex items-center justify-center text-[11px] font-bold text-[#D6FF00]">
                          {(item.name || 'C')[0].toUpperCase()}
                        </span>
                        <span>{item.name || 'Contato WhatsApp'}</span>
                      </div>
                    </td>

                    {/* Telefone */}
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-[#BCBCBC]">
                      <div className="flex items-center gap-1.5">
                        <span>{formatPhone(item.phone)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyPhone(item.phone)
                          }}
                          className="p-1 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copiar telefone"
                        >
                          {copiedPhone === item.phone ? (
                            <Check className="w-3.5 h-3.5 text-[#D6FF00]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status / Grupo */}
                    <td className="py-3.5 px-4 sm:px-6">
                      {isGrupo1 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-950/40 text-sky-400 border border-sky-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          Lead Novo [Grupo 1]
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#D6FF00]/10 text-[#D6FF00] border border-[#D6FF00]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D6FF00]" />
                          Teste Ativo [Grupo 2]
                        </span>
                      )}
                    </td>

                    {/* Mensagem enviada */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#1e1e1e] border border-[#333] text-white">
                        MSG {item.msgNumber}
                      </span>
                    </td>

                    {/* Horário */}
                    <td className="py-3.5 px-4 sm:px-6 text-[#BCBCBC]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#BCBCBC]/60" />
                        <span>{formatDateTime(item.sentAt)}</span>
                      </div>
                    </td>

                    {/* Ação */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D6FF00] group-hover:underline">
                        <Eye className="w-3.5 h-3.5" />
                        Ver mensagem
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação (Máximo 10 por página) */}
      <div className="p-4 sm:p-5 border-t border-[#242424] flex items-center justify-between text-xs text-[#BCBCBC]">
        <span>
          Página <strong className="text-white">{currentPage}</strong> de{' '}
          <strong className="text-white">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#181818] border border-[#282828] hover:bg-[#202020] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#181818] border border-[#282828] hover:bg-[#202020] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal para Visualização da Mensagem Enviada */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-[#141414] border border-[#2c2c2c] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-[#242424] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D6FF00] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Mensagem Disparada no WhatsApp
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedItem.name || 'Contato WhatsApp'} &bull; MSG {selectedItem.msgNumber}
                </h3>
                <p className="text-xs text-[#BCBCBC]/70 mt-0.5">
                  Enviada em {formatDateTime(selectedItem.sentAt)} para {formatPhone(selectedItem.phone)}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-[#BCBCBC] hover:text-white hover:bg-[#202020] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balão de Mensagem Estilo WhatsApp Dark */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#BCBCBC]/60 uppercase tracking-wider block">
                Conteúdo da Mensagem:
              </span>
              <div className="bg-[#1f2c34] border border-[#2b3942] rounded-2xl rounded-tl-sm p-4 text-xs sm:text-sm text-gray-100 whitespace-pre-wrap leading-relaxed shadow-inner font-sans">
                {selectedItem.messageText || '(Mensagem sem conteúdo)'}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#BCBCBC]/60">
                {selectedItem.grupo === 'grupo1' ? 'Lead Novo [Grupo 1]' : 'Teste Ativo [Grupo 2]'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyText(selectedItem.messageText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202020] hover:bg-[#282828] text-xs font-medium text-white border border-[#333] transition-colors"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#D6FF00]" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar texto
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#D6FF00] hover:bg-[#c2e600] text-black text-xs font-bold transition-colors shadow-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
