const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL!
const EVOLUTION_GLOBAL_API_KEY = process.env.EVOLUTION_API_KEY!

// Número de WhatsApp conectado à instância de envio de follow-ups
const CONNECTED_NUMBER = '5522981695694'

// Cache em memória do token da instância para não precisar consultar a cada envio
let cachedInstanceToken: string | null = null

/**
 * Busca o token da instância conectada ao número configurado na Evolution Go.
 * Mesmo que a instância seja renomeada, ela é identificada pelo jid (número conectado).
 */
async function getInstanceToken(): Promise<string> {
  if (cachedInstanceToken) {
    return cachedInstanceToken
  }

  const res = await fetch(`${EVOLUTION_API_URL}/instance/all`, {
    method: 'GET',
    headers: {
      apikey: EVOLUTION_GLOBAL_API_KEY,
    },
  })

  if (!res.ok) {
    throw new Error(`Erro ao buscar instâncias: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()
  const instances: any[] = json.data || []

  const instance = instances.find((inst: any) => {
    const rawJid = inst.jid || ''
    const cleanJid = rawJid.split(':')[0].replace(/\D/g, '')
    return cleanJid === CONNECTED_NUMBER
  })

  if (!instance || !instance.token) {
    throw new Error(`Nenhuma instância conectada encontrada com o número ${CONNECTED_NUMBER}`)
  }

  cachedInstanceToken = instance.token
  return instance.token
}

/**
 * Envia uma mensagem de texto simples via Evolution Go API.
 */
export async function sendTextMessage(phone: string, text: string): Promise<any> {
  const instanceToken = await getInstanceToken()

  // Garante DDI 55 e apenas dígitos
  const cleanPhone = phone.replace(/\D/g, '')
  const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  const res = await fetch(`${EVOLUTION_API_URL}/send/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: instanceToken,
    },
    body: JSON.stringify({
      number: formattedPhone,
      text,
    }),
  })

  if (!res.ok) {
    // Se o token falhar por algum motivo, limpa o cache
    if (res.status === 401 || res.status === 403) {
      cachedInstanceToken = null
    }
    const errBody = await res.text()
    throw new Error(`Erro ao enviar mensagem: ${res.status} - ${errBody}`)
  }

  return res.json()
}
