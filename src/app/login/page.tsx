'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('Senha incorreta')
      }
    } catch {
      setError('Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e0e]">
      <div className="w-full max-w-md px-6 sm:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#1a1a1a] border border-[#2c2c2c] mb-5 shadow-md">
            <Lock className="w-6 h-6 text-[#D6FF00]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wider uppercase">LeadFlux</h1>
          <p className="text-[#D6FF00] text-xs sm:text-sm mt-1 uppercase tracking-widest font-semibold">CRM TECH</p>
        </div>

        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#BCBCBC] mb-1.5 font-medium">
                Chave de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full px-4 py-3 bg-[#181818] border border-[#282828] rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#D6FF00] transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-rose-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D6FF00] hover:bg-[#c2e600] disabled:opacity-40 disabled:cursor-not-allowed text-[#121212] uppercase tracking-wider text-xs font-bold rounded-xl transition-all shadow-md shadow-[#D6FF00]/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#121212]" />
              ) : (
                <>
                  Acessar Sistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
