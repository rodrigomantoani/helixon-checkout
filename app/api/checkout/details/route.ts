import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar order completa no banco
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Retornar todos os dados do pedido
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        transactionId: order.transactionId,
        status: order.status,
        pixCode: order.pixCode,
        pixQrCodeImage: order.pixQrCodeImage,
        productName: order.productName,
        productPrice: order.productPrice,
        expiresAt: order.expiresAt?.toISOString(),
        paidAt: order.paidAt?.toISOString(),
        createdAt: order.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar detalhes' },
      { status: 500 }
    );
  }
}
