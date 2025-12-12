# 🗄️ Configuração do Banco de Dados

## Opção 1: Neon (Recomendado - Grátis)

### Passo 1: Criar conta no Neon

1. Acesse [neon.tech](https://neon.tech)
2. Clique em "Sign Up" (pode usar GitHub)
3. Crie um novo projeto: "helixon-checkout"

### Passo 2: Obter connection string

1. No dashboard do Neon, copie a **Connection String**
2. Formato: `postgresql://user:password@host/database?sslmode=require`

### Passo 3: Atualizar .env.local

```bash
# Substitua a DATABASE_URL no arquivo .env.local
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Passo 4: Criar tabelas

```bash
npx prisma generate
npx prisma db push
```

---

## Opção 2: Vercel Postgres

### Via Dashboard Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione o projeto "helixon-checkout"
3. Vá em **Storage** → **Create Database** → **Postgres**
4. Nome: "helixon-db"
5. Clique em **Create**

### Via CLI Vercel

```bash
# Fazer login
npx vercel login

# Criar storage
npx vercel storage create postgres helixon-db

# Pull das variáveis
npx vercel env pull .env.local
```

### Criar tabelas

```bash
npx prisma generate
npx prisma db push
```

---

## Opção 3: Docker Local (Requer Docker Desktop)

### Passo 1: Iniciar Docker Desktop

Certifique-se que o Docker Desktop está rodando.

### Passo 2: Executar script

```bash
./setup-db.sh
```

O script vai:
- Criar container PostgreSQL
- Configurar .env.local
- Mostrar próximos passos

---

## ✅ Verificar Conexão

Após configurar, teste a conexão:

```bash
npx prisma db push
```

Se conectar com sucesso, você verá:
```
✔ Generated Prisma Client
✔ Database synced
```

---

## 🚀 Próximos Passos

Após configurar o banco:

1. **Gerar Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Criar tabelas**:
   ```bash
   npx prisma db push
   ```

3. **Rodar aplicação**:
   ```bash
   npm run dev
   ```

4. **Visualizar dados** (opcional):
   ```bash
   npx prisma studio
   ```

---

## ⚠️ Importante para Produção

Ao fazer deploy na Vercel:

1. Configure a `DATABASE_URL` nas **Environment Variables**
2. A Vercel Postgres é recomendada para produção
3. O Neon também funciona perfeitamente (tier gratuito generoso)
