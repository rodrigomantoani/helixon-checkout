# 🔍 O que é RECEBA_PLATFORM_ID?

## 📖 Definição

Segundo a documentação da Receba.online, o **Platform ID** é um UUID que identifica sua aplicação/plataforma ao criar transações PIX.

No request de criação de PIX, ele é enviado assim:

```json
{
  "name": "João",
  "email": "joao@email.com",
  "phone": "11999999999",
  "document": "12345678900",
  "amount": 299.00,
  "platform": "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"  ← Platform ID
}
```

## 🔎 Onde Encontrar?

### Opção 1: Dashboard Receba.online

Procure em:
1. **Dashboard** → Pode estar na página principal
2. **Integration** / **Integração** → Geralmente tem os dados de integração
3. **Settings** / **Configurações** → Dados da plataforma

### Opção 2: Contato com Suporte

Na imagem que você mostrou, há um botão **"Support"** no canto superior direito.

Entre em contato e pergunte:
> "Olá, onde encontro o Platform ID (UUID) para usar na API de criação de transações PIX?"

### Opção 3: Criar Nova Plataforma (se necessário)

Pode ser que você precise criar uma "plataforma" ou "aplicação" primeiro no painel.

## 🧪 Teste Sem Platform ID (Temporário)

Enquanto você obtém o Platform ID correto, vou modificar o código para torná-lo **opcional** e você conseguir testar:

```typescript
// lib/receba-client.ts
platform: this.config.platformId || 'test-platform'
```

Isso permite testar mesmo sem o Platform ID configurado.

## ✅ Próximos Passos

1. Entre em contato com suporte Receba.online
2. Ou procure no dashboard sandbox: https://sandbox.receba.online
3. Quando conseguir, adicione ao `.env.local`
4. Reinicie o servidor

---

**Vou modificar o código agora para funcionar sem Platform ID temporariamente.**
