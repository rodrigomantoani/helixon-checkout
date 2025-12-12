/**
 * Cliente para integração com VPAY API (receba.online)
 * Baseado na documentação oficial: https://docs.receba.online
 */

const BASE_URLS = {
  sandbox: 'https://sandbox.receba.online',
  production: 'https://receba.online',
} as const;

type Environment = keyof typeof BASE_URLS;

interface RecebaConfig {
  apiKey: string;
  platformId: string;
  environment: Environment;
}

interface CashinRequest {
  name: string;
  email: string;
  phone: string;
  description: string;
  document: string;
  amount: number;
  platform: string;
  reference?: string;
  extra?: string;
}

interface CashinResponse {
  transaction: Array<{
    id: string;
    amount: string;
    commission: string;
    date_created: string;
    description: string;
    document: string;
    email: string;
    e2e_id: string;
    finished: string;
    name: string;
    operation: string;
    payment_link: string;
    phone: string;
    platform: string;
    qr_code: string; // PIX Copia e Cola
    qr_code_image: string; // Base64 QR Code image
    reference: string;
    extra: string;
    status: string;
    events: Array<{
      date_created: string;
      status: string;
    }>;
  }>;
}

interface TransactionResponse {
  transaction: {
    id: string;
    amount: string;
    commission: string;
    date_created: string;
    description: string;
    document: string;
    email: string;
    e2e_id: string;
    finished: string;
    name: string;
    operation: string;
    phone: string;
    platform: string;
    qr_code?: string;
    qr_code_image?: string;
    reference: string;
    extra: string;
    status: string;
    events: Array<{
      date_created: string;
      status: string;
    }>;
  };
}

class RecebaClient {
  private config: RecebaConfig;
  private baseUrl: string;

  constructor(config: RecebaConfig) {
    this.config = config;
    this.baseUrl = BASE_URLS[config.environment];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Receba.online API error: ${response.status} - ${JSON.stringify(error)}`
      );
    }

    return response.json();
  }

  /**
   * Cria uma cobrança PIX (cashin)
   * Endpoint: POST /api/v1/transaction/pix/cashin
   * Retorna QR Code e PIX Copia e Cola
   */
  async createCashin(data: Omit<CashinRequest, 'platform'>): Promise<CashinResponse> {
    const payload: Record<string, any> = { ...data };
    
    // Platform ID é opcional - se não configurado, envia sem ele
    if (this.config.platformId && this.config.platformId !== 'your_platform_id_here') {
      payload.platform = this.config.platformId;
    }
    
    return this.request<CashinResponse>('/api/v1/transaction/pix/cashin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Consulta o status de uma transação
   * Endpoint: GET /api/v1/transaction/{id}
   */
  async getTransaction(transactionId: string): Promise<TransactionResponse> {
    return this.request<TransactionResponse>(`/api/v1/transaction/${transactionId}`);
  }
}

// Export singleton
const recebaClient = new RecebaClient({
  apiKey: process.env.RECEBA_API_KEY || '',
  platformId: process.env.RECEBA_PLATFORM_ID || '',
  environment: (process.env.NEXT_PUBLIC_RECEBA_ENV as Environment) || 'sandbox',
});

export { recebaClient, RecebaClient };
export type { CashinRequest, CashinResponse, TransactionResponse };
