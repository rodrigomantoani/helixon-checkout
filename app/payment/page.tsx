'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos

  // Buscar dados do pedido
  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    fetchOrder();
  }, [orderId, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/checkout/details?orderId=${orderId}`);
      const data = await response.json();

      if (data.success) {
        if (data.order.status === 'PAID') {
          router.push(`/success?orderId=${orderId}`);
          return;
        }
        setOrder(data.order);
      } else {
        setError(data.error || 'Pedido não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  // Polling para verificar status (a cada 3 segundos)
  useEffect(() => {
    if (!orderId || order?.status === 'PAID') return;

    const interval = setInterval(() => {
      fetch(`/api/checkout/status?orderId=${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.order.status === 'PAID') {
            router.push(`/success?orderId=${orderId}`);
          }
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, order?.status, router]);

  // Timer de expiração
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const copyPixCode = () => {
    if (order?.pixCode) {
      navigator.clipboard.writeText(order.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#36b49f] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Pedido não encontrado'}</p>
          <button
            onClick={() => router.push('/')}
            className="text-[#36b49f] font-medium"
          >
            Voltar ao início
          </button>
        </div>
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
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
        
        {/* Timer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-gray-700 mb-1">Tempo restante para pagamento</p>
          <p className="text-2xl font-bold text-[#36b49f]">{formatTime(timeLeft)}</p>
        </div>

        {/* Instruções */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Pagamento PIX</h2>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-[#36b49f] mr-2">1.</span>
              <span>Abra o app do seu banco</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-[#36b49f] mr-2">2.</span>
              <span>Escolha pagar com QR Code ou Pix Copia e Cola</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-[#36b49f] mr-2">3.</span>
              <span>Confirme o pagamento</span>
            </li>
          </ol>
        </div>

        {/* QR Code - placeholder por enquanto */}
        {order.pixQrCodeImage && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 flex justify-center">
            <Image
              src={order.pixQrCodeImage}
              alt="QR Code PIX"
              width={280}
              height={280}
              className="rounded-lg"
            />
          </div>
        )}

        {/* PIX Copia e Cola */}
        {order.pixCode && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIX Copia e Cola
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={order.pixCode}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600 font-mono"
              />
              <button
                onClick={copyPixCode}
                className="px-6 py-3 bg-[#36b49f] text-white font-medium rounded-lg hover:bg-[#2d9682] transition-colors whitespace-nowrap"
              >
                {copied ? '✓ Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="animate-pulse mb-2">
            <div className="w-8 h-8 bg-blue-400 rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-700 font-medium">Aguardando pagamento...</p>
          <p className="text-sm text-gray-600 mt-1">
            A confirmação é automática e instantânea
          </p>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#36b49f]"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
