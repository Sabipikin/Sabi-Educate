import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface Payment {
  id: number;
  user_id: number;
  amount_cents: number;
  currency: string;
  status: string;
  transaction_id: string;
  processed_by: string;
  created_at: string;
}

export default function Payments() {
  const { token } = useAdminAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchPayments = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/payments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch payments');
        const data = await response.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [token]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount_cents, 0) / 100;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Payment Management</h1>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
            Export Payments
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-cyan-400">£{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Total Transactions</h3>
            <p className="text-2xl font-bold text-cyan-400">{payments.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Completed</h3>
            <p className="text-2xl font-bold text-green-400">
              {payments.filter((p) => p.status === 'completed').length}
            </p>
          </div>
        </div>

        {loading && <p className="text-gray-400">Loading payments...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {payments.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300">ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">User ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300">Transaction</th>
                  <th className="px-6 py-3 text-left text-gray-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-3 text-white">{payment.id}</td>
                    <td className="px-6 py-3 text-white">{payment.user_id}</td>
                    <td className="px-6 py-3 text-white font-medium">
                      {(payment.amount_cents / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          payment.status === 'completed'
                            ? 'bg-green-900 text-green-300'
                            : payment.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">{payment.transaction_id}</td>
                    <td className="px-6 py-3 text-gray-400">{payment.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-gray-400">No payments found.</p>
        )}
      </div>
    </AdminLayout>
  );
}
