import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateWebhookSignature } from '@/lib/webhook-security';

/**
 * Webhook de pagamento da Receba.online
 * Documentação: https://docs.receba.online/webhooks
 * 
 * Payload esperado:
 * {
 *   "id": 30,
 *   "transaction_id": "uuid",
 *   "transaction_amount": "0.00",
 *   "transaction_e2e_id": "xxx",
 *   "transaction_operation": "in or out",
 *   "transaction_reference": "generated_by_client",
 *   "extra": "generated_by_client",
 *   "date_created": "YYYY-mm-dd HH:mm:ss",
 *   "status": "paid",
 *   "path": "/api/v1/transaction/uuid"
 * }
 */

interface WebhookPayload {
  id: number;
  transaction_id: string;
  transaction_amount: string;
  transaction_e2e_id: string;
  transaction_operation: string;
  transaction_reference: string;
  extra: string;
  date_created: string;
  status: string;
  path: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validar assinatura do webhook
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.RECEBA_WEBHOOK_SECRET || '';

    if (!validateWebhookSignature(authHeader, webhookSecret)) {
      console.error('Webhook signature inválida');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: WebhookPayload = await request.json();

    console.log('Webhook recebido:', {
      transactionId: payload.transaction_id,
      status: payload.status,
      reference: payload.transaction_reference,
    });

    // Buscar order pelo transactionId
    const order = await prisma.checkoutOrder.findUnique({
      where: { transactionId: payload.transaction_id },
    });

    if (!order) {
      console.error('Order não encontrada:', payload.transaction_id);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Mapear status
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

    const newStatus = statusMap[payload.status] || 'PENDING';

    // Atualizar order
    await prisma.checkoutOrder.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : order.paidAt,
        updatedAt: new Date(),
      },
    });

    console.log('Order atualizada:', {
      orderId: order.id,
      oldStatus: order.status,
      newStatus,
    });

    // Se pagamento confirmado, enviar para o sistema de admin
    if (newStatus === 'PAID') {
      const adminApiUrl = process.env.ADMIN_API_URL || 'https://helixonlabs.com';
      
      try {
        // Preparar dados para envio ao admin
        const adminPayload = {
          sessionId: payload.transaction_id,
          paymentStatus: 'paid',
          amountTotal: order.productPrice,
          customer: {
            name: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone,
            cpf: order.customerDocument,
          },
          shipping: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
          },
          items: [{
            id: 'checkout-item',
            name: order.productName,
            price: order.productPrice,
            quantity: 1,
          }],
          shippingCost: 0,
          createdAt: order.paidAt || new Date().toISOString(),
        };

        console.log('Enviando order para admin:', {
          url: `${adminApiUrl}/api/orders/ingest-from-shop`,
          orderId: order.id,
        });

        const adminResponse = await fetch(`${adminApiUrl}/api/orders/ingest-from-shop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminPayload),
        });

        if (adminResponse.ok) {
          console.log('Order enviada para admin com sucesso');
        } else {
          const errorText = await adminResponse.text();
          console.error('Erro ao enviar order para admin:', {
            status: adminResponse.status,
            error: errorText,
          });
        }
      } catch (adminError) {
        console.error('Erro ao comunicar com admin:', adminError);
        // Não falhar o webhook se o envio ao admin falhar
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processado',
    });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
