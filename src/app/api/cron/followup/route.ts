import { NextRequest, NextResponse } from 'next/server'
import { processFollowups } from '@/lib/followup/processor'

export const maxDuration = 300 // 5 minutes max duration

/**
 * CRON endpoint para processar follow-ups.
 *
 * Chamado via crontab do sistema:
 * curl -s -X GET "https://..." -H "Authorization: Bearer <CRON_SECRET>"
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON FOLLOWUP] Iniciando processamento...')
    const startTime = Date.now()

    const result = await processFollowups()

    const duration = Date.now() - startTime
    console.log(`[CRON FOLLOWUP] Concluído em ${duration}ms:`, result)

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      ...result,
    })
  } catch (err: any) {
    console.error('[CRON FOLLOWUP] Erro:', err)
    return NextResponse.json(
      { error: err.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
