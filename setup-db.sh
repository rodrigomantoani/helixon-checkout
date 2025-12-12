#!/bin/bash

# Script para criar banco de dados PostgreSQL local com Docker

echo "🐘 Configurando PostgreSQL local com Docker..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker Desktop."
    exit 1
fi

# Criar e iniciar container PostgreSQL
docker run --name helixon-postgres \
  -e POSTGRES_USER=helixon \
  -e POSTGRES_PASSWORD=helixon123 \
  -e POSTGRES_DB=helixon_checkout \
  -p 5432:5432 \
  -d postgres:15-alpine

echo "⏳ Aguardando PostgreSQL iniciar..."
sleep 3

# Atualizar .env.local
cat > .env.local << 'EOF'
# Receba.online API Configuration
NEXT_PUBLIC_RECEBA_ENV=sandbox
RECEBA_API_KEY=rcb_dS1LSVkcrTzEeNB0ggE7J3wN4VGoGN1e0P880q0j266ebc45
RECEBA_PLATFORM_ID=your_platform_id_here
RECEBA_WEBHOOK_SECRET=your_webhook_secret_here

# Database
DATABASE_URL="postgresql://helixon:helixon123@localhost:5432/helixon_checkout?schema=public"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Produto Helixon
PRODUCT_NAME="Helixon Labs Peptídeos Premium"
PRODUCT_DOSAGE="10mg"
PRODUCT_PRICE=29900
PRODUCT_DESCRIPTION="Peptídeos de alta qualidade para uso profissional"
EOF

echo "✅ PostgreSQL criado com sucesso!"
echo ""
echo "📊 Detalhes do banco:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: helixon_checkout"
echo "  User: helixon"
echo "  Password: helixon123"
echo ""
echo "🔧 Próximos passos:"
echo "  1. npx prisma generate"
echo "  2. npx prisma db push"
echo "  3. npm run dev"
echo ""
echo "🛑 Para parar o banco: docker stop helixon-postgres"
echo "🗑️  Para remover: docker rm helixon-postgres"
