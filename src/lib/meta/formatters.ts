import { createHash } from 'crypto'

/**
 * Normaliza o telefone para o formato exigido pela Meta CAPI:
 * - Remove espaços, traços, parênteses, +
 * - Garante prefixo 55 (Brasil)
 * - Retorna apenas dígitos
 */
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '')

  // Se começa com 0, remove
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }

  // Se não tem código do país (menos de 12 dígitos), adiciona 55
  if (cleaned.length <= 11) {
    cleaned = '55' + cleaned
  }

  return cleaned
}

/**
 * Gera hash SHA-256 em lowercase de uma string.
 * Exigência da Meta Conversions API para dados de correspondência (user_data).
 */
export function hashSHA256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/**
 * Normaliza e gera o hash do telefone pronto para envio à Meta CAPI.
 */
export function hashPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  return hashSHA256(normalized)
}
