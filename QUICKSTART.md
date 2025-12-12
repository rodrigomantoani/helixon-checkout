# ⚡ Quick Start - Helixon Checkout

## 🎯 Status Atual

✅ API Key configurada: `rcb_dS1LSVkcrTzEeNB0ggE7J3wN4VGoGN1e0P880q0j266ebc45`  
⏳ **Próximo passo**: Configurar banco de dados

---

## 🚀 Início Rápido (3 minutos)

### 1️⃣ Configurar Banco (Escolha uma opção)

#### Opção A: Neon (Mais Rápido - Grátis)

```bash
# 1. Criar conta em https://neon.tech (aberto no browser)
# 2. Criar projeto "helixon-checkout"
# 3. Copiar Connection String
# 4. Colar no .env.local na linha DATABASE_URL

# Exemplo:
# DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

#### Opção B: Vercel Postgres (Integrado)

```bash
npx vercel login
npx vercel link
npx vercel storage create postgres helixon-db
npx vercel env pull .env.local
```

### 2️⃣ Criar Tabelas no Banco

```bash
npx prisma generate
npx prisma db push
```

### 3️⃣ Rodar Aplicação

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🔑 Configurações Faltando

Ainda precisa configurar no painel da Receba.online:

1. **Platform ID**: Obter no painel → Integração
2. **Webhook Secret**: Criar no painel → Webhooks

Adicione no `.env.local`:
```bash
RECEBA_PLATFORM_ID=seu_platform_id_aqui
RECEBA_WEBHOOK_SECRET=seu_webhook_secret_aqui
```

---

## 🧪 Testar o Checkout

### 1. Criar Pedido

Acesse http://localhost:3000 e preencha:
- Nome: Teste
- Email: teste@email.com
- Telefone: 11999999999
- CPF: 12345678900

### 2. Ver QR Code PIX

Você será redirecionado para `/payment` com:
- ✅ QR Code gerado automaticamente
- ✅ PIX Copia e Cola
- ✅ Timer de expiração (30 min)

### 3. Simular Pagamento (Sandbox)

```bash
# Obter transaction_id do console ou banco
curl https://sandbox.receba.online/checkout/transaction/{ID}/change/paid
```

### 4. Ver Confirmação

O checkout detecta automaticamente (polling 3s) e redireciona para `/success`

---

## 📊 Visualizar Banco

```bash
npx prisma studio
```

Abre interface web em http://localhost:5555 para ver:
- Orders criadas
- Status dos pagamentos
- Dados dos clientes

---

## 🚀 Deploy para Produção

Quando estiver tudo funcionando local:

```bash
# 1. Configurar variáveis na Vercel
npx vercel env add RECEBA_API_KEY
npx vercel env add RECEBA_PLATFORM_ID
npx vercel env add RECEBA_WEBHOOK_SECRET
npx vercel env add DATABASE_URL

# 2. Deploy
npx vercel --prod
```

---

## 🆘 Problemas?

### Erro de conexão com banco
```bash
# Verificar se DATABASE_URL está correta
npx prisma db pull
```

### QR Code não aparece
- Verificar se RECEBA_API_KEY está correta
- Ver logs: `npm run dev` (console mostrará erros)

### Webhook não funciona local
- Webhooks precisam de URL pública
- Para testar local: usar ngrok ou deploy preview na Vercel

---

## 📁 Estrutura do Projeto

```
helixon-checkout/
├── app/
│   ├── page.tsx              ← Checkout (formulário)
│   ├── payment/page.tsx      ← Pagamento (QR Code)
│   ├── success/page.tsx      ← Sucesso
│   └── api/
│       ├── checkout/create/  ← Cria cobrança
│       ├── checkout/status/  ← Consulta status
│       └── webhooks/payment/ ← Recebe confirmação
├── lib/
│   ├── prisma.ts             ← Cliente do banco
│   ├── receba-client.ts      ← Cliente da API
│   └── webhook-security.ts   ← Validação webhook
└── prisma/
    └── schema.prisma         ← Schema do banco
```

---

## ✅ Checklist Completo

- [x] Projeto Next.js criado
- [x] Dependências instaladas
- [x] API Key configurada
- [ ] Banco de dados criado
- [ ] Tabelas criadas (prisma db push)
- [ ] Platform ID configurado
- [ ] Webhook Secret configurado
- [ ] Testado localmente
- [ ] Deploy na Vercel

---

**Próximo passo**: Configurar banco de dados usando `DATABASE_SETUP.md`
