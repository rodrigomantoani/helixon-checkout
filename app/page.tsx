'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    amount: '299.00', // Default value
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert amount string (e.g. "299.00") to cents integer (29900)
      const amountInCents = Math.round(parseFloat(formData.amount.replace(',', '.')) * 100);

      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: amountInCents,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/payment?orderId=${data.order.id}`);
      } else {
        setError(data.error || 'Erro ao processar pagamento');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-[#36b49f]">Helixon Labs</h1>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-6">
        
        {/* Produto */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Helixon Labs Peptídeos Premium
          </h2>
          <p className="text-gray-600 mb-1">Dosagem: 10mg</p>
          <p className="text-gray-500 text-sm mb-4">
            Peptídeos de alta qualidade para uso profissional
          </p>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
              <input
                type="text"
                id="amount"
                required
                value={formData.amount}
                onChange={(e) => {
                  // Allow only numbers and one comma/dot
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setFormData({ ...formData, amount: val });
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36b49f] focus:border-transparent text-gray-900 text-2xl font-bold"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              id="name"
              required
              minLength={3}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36b49f] focus:border-transparent text-gray-900"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36b49f] focus:border-transparent text-gray-900"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              required
              minLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36b49f] focus:border-transparent text-gray-900"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <input
              type="text"
              id="document"
              required
              minLength={11}
              maxLength={14}
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value.replace(/\D/g, '') })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36b49f] focus:border-transparent text-gray-900"
              placeholder="000.000.000-00"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#36b49f] text-white font-bold py-4 px-6 rounded-lg hover:bg-[#2d9682] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg shadow-lg"
          >
            {loading ? 'Processando...' : 'Pagar com PIX'}
          </button>
        </form>

        {/* Info de segurança */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>🔒 Pagamento 100% seguro</p>
          <p>✓ Confirmação instantânea</p>
          <p>✓ Sem taxas adicionais</p>
        </div>
      </main>
    </div>
  );
}
