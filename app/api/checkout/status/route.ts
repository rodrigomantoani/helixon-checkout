import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recebaClient } from '@/lib/receba-client';

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

    // Buscar order no banco
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Se tem transactionId, buscar status atualizado na Receba.online
    if (order.transactionId) {
      try {
        const transactionData = await recebaClient.getTransaction(order.transactionId);
        const transaction = transactionData.transaction;

        // Mapear status da API para o enum do banco
        const statusMap: Record<string, any> = {
          'pending': 'PENDING',
          'paid': 'PAID',
          'partially_paid': 'PARTIALLY_PAID',
          'denied': 'DENIED',
          'canceled': 'CANCELED',
          'refund': 'REFUND',
          'in_process': 'IN_PROCESS',
          'in_analysis': 'IN_ANALYSIS',
          'expired': 'EXPIRED',
        };

        const newStatus = statusMap[transaction.status] || 'PENDING';

        // Atualizar status no banco se mudou
        if (order.status !== newStatus) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: newStatus,
              paidAt: newStatus === 'PAID' ? new Date() : order.paidAt,
            },
          });
        }

        return NextResponse.json({
          success: true,
          order: {
            id: order.id,
            status: newStatus,
            transactionId: order.transactionId,
            paidAt: newStatus === 'PAID' ? new Date().toISOString() : null,
          },
        });

      } catch (apiError) {
        console.error('Erro ao consultar Receba.online:', apiError);
        // Retorna status do banco se API falhar
      }
    }

    // Retornar status do banco
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        transactionId: order.transactionId,
        paidAt: order.paidAt?.toISOString() || null,
      },
    });

  } catch (error) {
    console.error('Erro ao consultar status:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao consultar status' },
      { status: 500 }
    );
  }
}
