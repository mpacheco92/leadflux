/**
 * Templates de mensagem para o GRUPO 2: leads que testaram mas NÃO compraram.
 *
 * Schedule:
 *   MSG1 - 3 horas após virar teste (qualquer horário)
 *   MSG2 - D+1 às 19h (Brasília)
 *   MSG3 - D+3 às 19h (Brasília)
 *   MSG4 - D+5 às 19h (Brasília)
 *   MSG5 - D+7 às 19h (Brasília)
 *
 * O fluxo PARA se o lead virar 'pago'.
 */

export function grupo2Msg1(name: string | null): string {
  if (name) {
    return `E aí, ${name}. Curtiu o aplicativo? 😊

Vi que seu teste encerrou, mas já deixei seu acesso definitivo engatilhado aqui.

Posso reativar o sinal agora?`
  }
  return `E aí, curtiu o aplicativo? 😊

Vi que seu teste encerrou, mas já deixei seu acesso definitivo engatilhado aqui.

Posso reativar o sinal agora?`
}

export function grupo2Msg2(name: string | null): string {
  if (name) {
    return `${name}, seu acesso ainda tá configurado aqui. Ficou alguma dúvida em relação ao funcionamento ou valores?`
  }
  return `Seu acesso ainda tá configurado aqui. Ficou alguma dúvida em relação ao funcionamento ou valores?`
}

export function grupo2Msg3(name: string | null): string {
  if (name) {
    return `${name}, aqui vc vai ter todos os streamings em 1 só app...

Netflix, Globoplay, Prime, entre outros, além de todos os canais abertos e fechados na sua TV sem travar.

Responda "sim" e libero seu sinal novamente agora mesmo.`
  }
  return `Aqui vc vai ter todos os streamings em 1 só app...

Netflix, Globoplay, Prime, entre outros, além de todos os canais abertos e fechados na sua TV sem travar.

Responda "sim" e libero seu sinal novamente agora mesmo.`
}

export function grupo2Msg4(name: string | null): string {
  if (name) {
    return `${name}, chega de passar raiva com TV travando na hora do jogo.

Você testou e viu: nossa tecnologia CDN antitravamento faz o sinal rodar 100% liso.

Aproveite, seu acesso ainda está salvo aqui...`
  }
  return `Chega de passar raiva com TV travando na hora do jogo.

Você testou e viu: nossa tecnologia CDN antitravamento faz o sinal rodar 100% liso.

Aproveite, seu acesso ainda está salvo aqui...`
}

export function grupo2Msg5(name: string | null): string {
  if (name) {
    return `⚠️ ÚLTIMO AVISO: Desconto exclusivo liberado!

${name}, é minha última mensagem. Para não falar que não tentei de tudo, baixei o valor para você não ficar de fora: de 29,90 por apenas 24,90 fechando hoje!

Aproveite antes que expire:
🔑 Chave PIX (Celular): 22981219223

Envie o comprovante aqui assim que pagar para ativar seu acesso imediatamente.`
  }
  return `⚠️ ÚLTIMO AVISO: Desconto exclusivo liberado!

É minha última mensagem. Para não falar que não tentei de tudo, baixei o valor para você não ficar de fora: de 29,90 por apenas 24,90 fechando hoje!

Aproveite antes que expire:
🔑 Chave PIX (Celular): 22981219223

Envie o comprovante aqui assim que pagar para ativar seu acesso imediatamente.`
}
