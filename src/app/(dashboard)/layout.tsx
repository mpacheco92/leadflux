'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users,
  Activity,
  LogOut,
  Flame,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navItems = [
    {
      label: 'Leads & Funil',
      href: '/dashboard',
      icon: Users,
    },
    {
      label: 'Follow-ups',
      href: '/dashboard/followup',
      icon: MessageSquare,
    },
    {
      label: 'Auditoria Meta CAPI',
      href: '/dashboard/auditoria',
      icon: Activity,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden h-16 flex items-center justify-between px-5 border-b border-[#242424] bg-[#121212] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] flex items-center justify-center shadow-sm">
            <Flame className="w-4 h-4 text-[#D6FF00]" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-wide uppercase">LeadFlux</span>
            <span className="block text-[10px] text-[#D6FF00] font-semibold tracking-widest uppercase">CRM TECH</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-[#BCBCBC] hover:text-white transition-colors"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 top-16 bg-black/75 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Mobile & Desktop */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-full sm:w-72 md:w-64 md:top-0 md:bottom-auto md:min-h-screen bg-[#121212] border-r border-[#242424] p-5 sm:p-6 flex flex-col justify-between overflow-y-auto transition-transform duration-200 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="hidden md:flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2c2c2c] flex items-center justify-center shadow-md">
              <Flame className="w-5 h-5 text-[#D6FF00]" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-wider uppercase">LeadFlux</span>
              <span className="block text-xs text-[#D6FF00] font-semibold tracking-wider uppercase">CRM TECH</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-xs sm:text-sm tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#1a1a1a] text-[#D6FF00] border border-[#2c2c2c] shadow-sm font-semibold'
                      : 'text-[#BCBCBC] hover:text-white hover:bg-[#181818] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D6FF00]' : 'text-[#BCBCBC]'}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-6 border-t border-[#242424] space-y-4">
          <div className="px-3 py-2 rounded-lg bg-[#181818] border border-[#282828] text-xs text-[#BCBCBC] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D6FF00] shadow-[0_0_8px_#D6FF00] animate-pulse" />
              <span className="text-[11px] text-white">Pixel CAPI Ativo</span>
            </span>
            <span className="text-[10px] text-[#BCBCBC]/60">1655...086</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#BCBCBC] hover:text-rose-400 hover:bg-[#201516] border border-transparent hover:border-rose-950 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen p-3.5 sm:p-6 md:p-10 bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
