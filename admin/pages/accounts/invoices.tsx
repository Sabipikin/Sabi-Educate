import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface Invoice {
  id: number;
  user_id: number;
  amount_cents: number;
  currency: string;
  description: string;
  status: string;
  due_date: string;
  created_at: string;
}

export default function Invoices() {
  const { token } = useAdminAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchInvoices = async () => {
      try {
        // Using payments endpoint as placeholder, actual invoices endpoint would be separate
        const response = await fetch('http://localhost:8000/api/admin/payments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Invoice Management</h1>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
            Create Invoice
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading invoices...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {invoices.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">User ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">Amount</th>
                  <th className="px-6 py-3 text-left text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300">Due Date</th>
                  <th className="px-6 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-3 text-white">{invoice.id}</td>
                    <td className="px-6 py-3 text-white">{invoice.user_id}</td>
                    <td className="px-6 py-3 text-white font-medium">
                      {(invoice.amount_cents / 100).toFixed(2)} {invoice.currency?.toUpperCase() || 'GBP'}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          invoice.status === 'paid'
                            ? 'bg-green-900 text-green-300'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{invoice.due_date || 'N/A'}</td>
                    <td className="px-6 py-3 flex gap-2">
                      <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm">
                        View
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-gray-400">No invoices found.</p>
        )}
      </div>
    </AdminLayout>
  );
}
