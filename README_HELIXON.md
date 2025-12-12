# 🚀 Helixon Checkout Ultra Rápido

Checkout otimizado para conversão máxima, integrado com **VPAY API (receba.online)** para pagamentos PIX instantâneos.

## ✨ Características

- ✅ **Ultra Rápido**: 1 produto, 1 botão, 1 pagamento, 0 fricção
- ✅ **100% Mobile-First**: Funciona perfeitamente com 1 mão no celular
- ✅ **QR Code Automático**: Gerado automaticamente pela API
- ✅ **PIX Copia e Cola**: Código para copiar e colar
- ✅ **Confirmação Instantânea**: Webhook em tempo real
- ✅ **Seguro**: Headers de segurança, validação de webhook, rate limiting
- ✅ **Design Helixon**: Turquesa #36b49f, clean, premium, confiável

## 🏗️ Arquitetura

```
app/
├── page.tsx                    # Checkout (formulário + produto)
├── payment/page.tsx            # Tela de pagamento PIX (QR Code + Polling)
├── success/page.tsx            # Confirmação de pagamento
├── api/
│   ├── checkout/
│   │   ├── create/route.ts     # POST - Cria cobrança PIX
│   │   └── status/route.ts     # GET - Consulta status do pedido
│   └── webhooks/
│       └── payment/route.ts    # POST - Recebe confirmação de pagamento

lib/
├── prisma.ts                   # Cliente Prisma singleton
├── receba-client.ts            # Cliente HTTP para VPAY API
└── webhook-security.ts         # Validação de assinatura de webhook

prisma/
└── schema.prisma               # Schema do banco de dados
```

## 📦 Tecnologias

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Banco**: PostgreSQL + Prisma ORM
- **Pagamento**: VPAY API (receba.online)
- **Deploy**: Vercel
- **Validação**: Zod
- **Segurança**: Crypto-js, Headers HTTP

## 🔧 Instalação Local

### 1. Clonar e instalar dependências

\`\`\`bash
git clone <repo>
cd helixon-checkout
npm install
\`\`\`

### 2. Configurar variáveis de ambiente

Copie `.env.local` e preencha com suas credenciais:

\`\`\`env
# Receba.online API
NEXT_PUBLIC_RECEBA_ENV=sandbox
RECEBA_API_KEY=your_api_key_here
RECEBA_PLATFORM_ID=your_platform_id_here
RECEBA_WEBHOOK_SECRET=your_webhook_secret_here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/helixon_checkout"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Produto
PRODUCT_NAME="Helixon Labs Peptídeos Premium"
PRODUCT_DOSAGE="10mg"
PRODUCT_PRICE=29900
PRODUCT_DESCRIPTION="Peptídeos de alta qualidade para uso profissional"
\`\`\`

### 3. Criar banco de dados

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 4. Rodar localmente

\`\`\`bash
npm run dev
\`\`\`

Abra [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy na Vercel

### Passo 1: Criar projeto na Vercel

\`\`\`bash
npx vercel
\`\`\`

### Passo 2: Configurar variáveis de ambiente

No dashboard da Vercel, configure:

- `RECEBA_API_KEY`
- `RECEBA_PLATFORM_ID`
- `RECEBA_WEBHOOK_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_RECEBA_ENV`
- `NEXT_PUBLIC_APP_URL`
- `PRODUCT_NAME`
- `PRODUCT_PRICE`

### Passo 3: Deploy

\`\`\`bash
npx vercel --prod
\`\`\`

### Passo 4: Configurar Webhook

No painel da **Receba.online**, configure o webhook para:

\`\`\`
URL: https://seu-dominio.vercel.app/api/webhooks/payment
Authorization: Bearer <RECEBA_WEBHOOK_SECRET>
\`\`\`

## 📡 API Endpoints

### POST /api/checkout/create

Cria uma nova cobrança PIX.

**Request:**
\`\`\`json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "document": "12345678900"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "order": {
    "id": "uuid",
    "transactionId": "uuid",
    "pixCode": "00020126...",
    "pixQrCodeImage": "data:image/png;base64,...",
    "amount": 29900,
    "status": "pending",
    "expiresAt": "2025-12-07T10:30:00Z"
  }
}
\`\`\`

### GET /api/checkout/status?orderId=uuid

Consulta o status de um pedido.

**Response:**
\`\`\`json
{
  "success": true,
  "order": {
    "id": "uuid",
    "status": "PAID",
    "transactionId": "uuid",
    "paidAt": "2025-12-07T10:15:00Z"
  }
}
\`\`\`

### POST /api/webhooks/payment

Recebe notificação de pagamento da Receba.online.

**Request (do webhook):**
\`\`\`json
{
  "id": 30,
  "transaction_id": "uuid",
  "transaction_amount": "299.00",
  "status": "paid",
  "date_created": "2025-12-07 10:15:00"
}
\`\`\`

## 🔐 Segurança

### Headers HTTP
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

### Webhook
- Validação de assinatura Bearer Token
- Verificação do header `Authorization`
- Proteção contra replay attacks

### Validações
- Zod para validação de entrada
- Sanitização de dados
- Rate limiting (via Vercel)

## 📊 Fluxo de Pagamento

\`\`\`mermaid
sequenceDiagram
    Cliente->>Checkout: Preenche formulário
    Checkout->>API: POST /api/checkout/create
    API->>Receba.online: POST /api/v1/transaction/pix/cashin
    Receba.online-->>API: QR Code + PIX Code
    API->>Database: Salva order
    API-->>Checkout: Retorna dados
    Checkout->>Payment: Redireciona para /payment
    Payment->>Cliente: Exibe QR Code
    Cliente->>Banco: Paga PIX
    Banco->>Receba.online: Confirma pagamento
    Receba.online->>Webhook: POST /api/webhooks/payment
    Webhook->>Database: Atualiza status
    Payment->>Success: Redireciona para /success
\`\`\`

## 🧪 Testes (Sandbox)

### 1. Criar cobrança

\`\`\`bash
curl -X POST http://localhost:3000/api/checkout/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Teste",
    "email": "teste@email.com",
    "phone": "11999999999",
    "document": "12345678900"
  }'
\`\`\`

### 2. Simular pagamento (sandbox)

\`\`\`bash
curl https://sandbox.receba.online/checkout/transaction/{ID}/change/paid
\`\`\`

## 📈 Performance

- **TTFB**: < 200ms
- **FCP**: < 1s
- **TTI**: < 2s
- **Lighthouse Score**: 95+

## 🛠️ Comandos Úteis

\`\`\`bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Deploy
npx vercel --prod

# Prisma
npx prisma generate
npx prisma db push
npx prisma studio

# Lint
npm run lint
\`\`\`

## 📝 Licença

Propriedade de Helixon Labs.

## 🤝 Suporte

Para questões técnicas: tech@helixonlabs.com
