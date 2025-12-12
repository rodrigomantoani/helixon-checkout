'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    fetch(`/api/checkout/status?orderId=${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.order);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#36b49f]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-[#36b49f]">Helixon Labs</h1>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 py-12">
        
        {/* Ícone de sucesso */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Mensagem */}
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Pagamento Confirmado!
        </h2>
        
        <p className="text-gray-600 text-center mb-8">
          Seu pedido foi liberado para envio.
        </p>

        {/* Detalhes */}
        {order && (
          <div className="w-full bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3">Detalhes do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pedido:</span>
                <span className="font-medium text-gray-900">{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Pago em:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.paidAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Próximos passos */}
        <div className="w-full bg-[#36b49f]/10 border border-[#36b49f]/20 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-[#36b49f] mb-3">Próximos Passos</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-[#36b49f] mr-2">1.</span>
              <span>Você receberá um email de confirmação em instantes</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-[#36b49f] mr-2">2.</span>
              <span>Seu pedido será processado e enviado</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-[#36b49f] mr-2">3.</span>
              <span>Você receberá o código de rastreamento por email</span>
            </li>
          </ol>
        </div>

        {/* Botão */}
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-[#36b49f] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#2d9682] transition-colors"
        >
          Fazer Novo Pedido
        </button>

      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#36b49f]"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
