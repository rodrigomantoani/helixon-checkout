# 🔑 Como Obter o Platform ID

## ⚠️ IMPORTANTE
O checkout está retornando erro 401 porque o **RECEBA_PLATFORM_ID** não está configurado.

## 📋 Passos para Obter

### 1. Acessar Painel Receba.online

Já abri no seu browser: https://receba.online/user/api-tokens

### 2. Encontrar Platform ID

Geralmente está em uma dessas seções:
- **Integração** → Platform ID
- **API Tokens** → Platform Details
- **Configurações** → Dados da Plataforma

O formato é: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX` (UUID)

### 3. Copiar e Adicionar ao .env.local

Depois de copiar o Platform ID, execute:

```bash
# Abra o arquivo .env.local
code .env.local

# Ou via terminal
nano .env.local
```

Substitua a linha:
```
RECEBA_PLATFORM_ID=your_platform_id_here
```

Por:
```
RECEBA_PLATFORM_ID=seu-uuid-aqui
```

### 4. Também adicione ao .env

```bash
# Copie também para o .env
cp .env.local .env
```

### 5. Reiniciar o servidor

```bash
npm run dev
```

---

## 🧪 Testar

Depois de configurar:

1. Acesse http://localhost:3000
2. Preencha o formulário
3. Clique em "Pagar com PIX"
4. Deve gerar o QR Code sem erros

---

## ❓ Não Encontrou o Platform ID?

Se não encontrar no painel, pode ser que precise:
1. Criar uma aplicação/plataforma primeiro
2. Ou entrar em contato com suporte: support@receba.online

---

**Depois de configurar, me avise para continuar com os testes!**
