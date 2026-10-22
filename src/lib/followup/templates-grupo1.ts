/**
 * Templates de mensagem para o GRUPO 1: leads que iniciaram conversa mas NÃO testaram.
 *
 * Schedule:
 *   MSG1 - 2 horas após ter iniciado a conversa (qualquer horário)
 *   MSG2 - D+1 às 18h (Brasília)
 *   MSG3 - D+3 às 18h (Brasília)
 *   MSG4 - D+5 às 18h (Brasília)
 *
 * O fluxo PARA se o lead virar 'teste_ativo' ou 'pago'.
 */

export function grupo1Msg1(name: string | null): string {
  if (name) {
    return `${name}, esqueceu de testar?

Responda "teste" que mando seu teste agora.`
  }
  return `Esqueceu de testar?

Responda "teste" que mando seu teste agora.`
}

export function grupo1Msg2(name: string | null): string {
  if (name) {
    return `${name}, chega de passar raiva com TV travando no meio do jogo...

Temos tecnologia antitravamento e servidor reserva para você NUNCA ficar sem sinal.

Responde "teste" que mando seu acesso agora mesmo.`
  }
  return `Chega de passar raiva com TV travando no meio do jogo...

Temos tecnologia antitravamento e servidor reserva para você NUNCA ficar sem sinal.

Responde "teste" que mando seu acesso agora mesmo.`
}

export function grupo1Msg3(name: string | null): string {
  if (name) {
    return `${name}, seu teste grátis ainda está reservado...

Chega de pagar caro em vários aplicativos. Tenha um só com todos eles.

Só enviar "teste" que mando seu login!`
  }
  return `Seu teste grátis ainda está reservado...

Chega de pagar caro em vários aplicativos. Tenha um só com todos eles.

Só enviar "teste" que mando seu login!`
}

export function grupo1Msg4(name: string | null): string {
  if (name) {
    return `⚠️ ÚLTIMO AVISO: OPORTUNIDADE!

${name}, é a última vez que te mando mensagem. Teste hoje e, se gostar, garanta o plano mensal de 29,90 por apenas 25,00.

Responda "teste" para liberar seu acesso e garantir a oferta válida até 22h de hoje!`
  }
  return `⚠️ ÚLTIMO AVISO: OPORTUNIDADE!

É a última vez que te mando mensagem. Teste hoje e, se gostar, garanta o plano mensal de 29,90 por apenas 25,00.

Responda "teste" para liberar seu acesso e garantir a oferta válida até 22h de hoje!`
}
