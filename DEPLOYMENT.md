# 🚀 Guia de Deployment - Helixon Checkout

## ✅ Checklist Pré-Deploy

- [ ] Credenciais da API Receba.online (sandbox ou produção)
- [ ] Banco PostgreSQL configurado (pode usar Vercel Postgres ou Neon)
- [ ] Conta Vercel ativa

## 📋 Passo a Passo

### 1. Preparar Banco de Dados

#### Opção A: Vercel Postgres (Recomendado)

No dashboard da Vercel:
1. Ir em Storage → Create Database → Postgres
2. Copiar a `DATABASE_URL`

#### Opção B: Neon (Grátis)

1. Criar conta em [neon.tech](https://neon.tech)
2. Criar novo projeto
3. Copiar a connection string

### 2. Obter Credenciais Receba.online

No painel da Receba.online:
1. Ir em **Integração**
2. Copiar:
   - API Key
   - Platform ID
   - Webhook Secret

### 3. Deploy na Vercel

```bash
# No diretório do projeto
npx vercel
```

Siga o wizard:
- Link to existing project? → No
- Project name? → helixon-checkout
- Directory? → ./
- Override settings? → No

### 4. Configurar Variáveis de Ambiente

No dashboard da Vercel → Settings → Environment Variables:

```
RECEBA_API_KEY=<sua_api_key>
RECEBA_PLATFORM_ID=<seu_platform_id>
RECEBA_WEBHOOK_SECRET=<seu_webhook_secret>
DATABASE_URL=<sua_database_url>
NEXT_PUBLIC_RECEBA_ENV=sandbox
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
PRODUCT_NAME=Helixon Labs Peptídeos Premium
PRODUCT_PRICE=29900
PRODUCT_DESCRIPTION=Peptídeos de alta qualidade
```

### 5. Criar Tabelas do Banco

```bash
npx prisma generate
npx prisma db push
```

### 6. Deploy em Produção

```bash
npx vercel --prod
```

### 7. Configurar Webhook

No painel da Receba.online:

1. Ir em **Integração** → **Webhooks**
2. Adicionar novo webhook:
   - URL: `https://seu-projeto.vercel.app/api/webhooks/payment`
   - Authorization: `Bearer <RECEBA_WEBHOOK_SECRET>`
   - Eventos: `transaction.paid`, `transaction.cancelled`

### 8. Testar no Sandbox

```bash
# Criar pedido
curl -X POST https://seu-projeto.vercel.app/api/checkout/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@email.com",
    "phone": "11999999999",
    "document": "12345678900"
  }'

# Pegar o transaction_id da resposta e simular pagamento
curl https://sandbox.receba.online/checkout/transaction/{ID}/change/paid
```

## 🔄 Alternar para Produção

1. Atualizar variável de ambiente:
   ```
   NEXT_PUBLIC_RECEBA_ENV=production
   ```

2. Usar credenciais de produção da Receba.online

3. Atualizar webhook URL no painel

4. Redeploy:
   ```bash
   npx vercel --prod
   ```

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

Verificar se `DATABASE_URL` está correta e acessível.

```bash
# Testar conexão
npx prisma db pull
```

### Erro: "Receba.online API error"

Verificar se:
- `RECEBA_API_KEY` está correta
- `RECEBA_PLATFORM_ID` está correto
- Ambiente (sandbox/production) está correto

### Webhook não recebe notificações

1. Verificar URL do webhook está pública
2. Testar manualmente:
   ```bash
   curl -X POST https://seu-projeto.vercel.app/api/webhooks/payment \
     -H "Authorization: Bearer <WEBHOOK_SECRET>" \
     -H "Content-Type: application/json" \
     -d '{
       "transaction_id": "test",
       "status": "paid"
     }'
   ```

## 📊 Monitoramento

Após deploy, monitorar:

1. **Vercel Dashboard** → Analytics
   - Requests
   - Errors
   - Response time

2. **Prisma Studio**
   ```bash
   npx prisma studio
   ```

3. **Logs**
   - Vercel → Project → Logs
   - Real-time monitoring

## 🔐 Segurança Pós-Deploy

- [ ] Verificar headers de segurança estão ativos
- [ ] Testar webhook signature validation
- [ ] Configurar rate limiting (Vercel faz automaticamente)
- [ ] Backup do banco (Vercel Postgres faz automaticamente)

## ✅ Deploy Completo!

Seu checkout está no ar em: `https://seu-projeto.vercel.app`

Para suporte: tech@helixonlabs.com
