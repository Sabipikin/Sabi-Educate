import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface Complaint {
  id: number;
  user_id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string;
  created_at: string;
}

export default function Complaints() {
  const { token } = useAdminAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchComplaints = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/complaints', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch complaints');
        const data = await response.json();
        setComplaints(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Support Complaints</h1>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
            Filter
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading complaints...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600 cursor-pointer"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white">{complaint.subject}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      complaint.priority === 'high'
                        ? 'bg-red-900 text-red-300'
                        : complaint.priority === 'medium'
                        ? 'bg-yellow-900 text-yellow-300'
                        : 'bg-green-900 text-green-300'
                    }`}
                  >
                    {complaint.priority} priority
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{complaint.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-gray-500 text-xs">
                    <p>User ID: {complaint.user_id}</p>
                    <p>Assigned to: {complaint.assigned_to}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      complaint.status === 'resolved'
                        ? 'bg-green-900 text-green-300'
                        : complaint.status === 'in_progress'
                        ? 'bg-blue-900 text-blue-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {complaint.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-400">No complaints found.</p>
        )}

        {selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedComplaint.subject}</h2>
              <p className="text-gray-400 mb-6">{selectedComplaint.description}</p>
              <div className="space-y-2 mb-6 text-sm text-gray-400">
                <p>Status: <span className="text-gray-300">{selectedComplaint.status}</span></p>
                <p>Priority: <span className="text-gray-300">{selectedComplaint.priority}</span></p>
                <p>Created: <span className="text-gray-300">{selectedComplaint.created_at}</span></p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
