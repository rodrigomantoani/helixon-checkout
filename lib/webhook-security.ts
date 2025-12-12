/**
 * Validação de segurança para webhooks da Receba.online
 * Baseado na documentação: https://docs.receba.online/webhooks#security
 */

/**
 * Valida o token de autorização do webhook
 * Header: Authorization: Bearer {key}
 */
export function validateWebhookSignature(
  authHeader: string | null,
  webhookSecret: string
): boolean {
  if (!authHeader) {
    return false;
  }

  // Remove "Bearer " prefix
  const token = authHeader.replace('Bearer ', '').trim();
  
  return token === webhookSecret;
}

/**
 * Extrai o token do header de autorização
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
