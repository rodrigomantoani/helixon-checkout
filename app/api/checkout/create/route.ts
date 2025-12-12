import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { recebaClient } from '@/lib/receba-client';

// Schema de validação
const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  document: z.string().min(11, 'Documento inválido (CPF/CNPJ)'),
  amount: z.number().min(100, 'Valor mínimo de R$ 1,00').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse e validação do body
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Configuração do produto
    const productName = process.env.PRODUCT_NAME || 'Helixon Labs Peptídeos';
    // Use o valor enviado ou o padrão do ambiente
    const productPrice = data.amount || parseInt(process.env.PRODUCT_PRICE || '29900'); // em centavos
    const productDescription = process.env.PRODUCT_DESCRIPTION || 'Peptídeos Premium';

    // Criar order no banco
    const order = await prisma.checkoutOrder.create({
      data: {
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        customerDocument: data.document,
        productName,
        productPrice,
        status: 'PENDING',
        reference: `ORDER-${Date.now()}`,
      },
    });

    // Criar cobrança PIX via Receba.online
    const cashinResponse = await recebaClient.createCashin({
      name: data.name,
      email: data.email,
      phone: data.phone,
      document: data.document,
      description: productDescription,
      amount: productPrice / 100, // API recebe em reais
      reference: order.id,
      extra: `checkout-${order.id}`,
    });

    const transaction = cashinResponse.transaction[0];

    // Atualizar order com dados do PIX
    await prisma.checkoutOrder.update({
      where: { id: order.id },
      data: {
        transactionId: transaction.id,
        pixCode: transaction.qr_code,
        pixQrCodeImage: transaction.qr_code_image,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      },
    });

    // Retornar dados para o frontend
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        transactionId: transaction.id,
        pixCode: transaction.qr_code,
        pixQrCodeImage: transaction.qr_code_image,
        amount: productPrice,
        status: transaction.status,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    });

  } catch (error) {
    console.error('Erro ao criar cobrança:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
