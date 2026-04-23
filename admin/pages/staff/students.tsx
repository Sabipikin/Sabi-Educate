import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface Student {
  id: number;
  email: string;
  name: string;
  enrollment_date: string;
  status: string;
}

export default function Students() {
  const { token } = useAdminAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Student Management</h1>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
            Suspend Student
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading students...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {students.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300">ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">Email</th>
                  <th className="px-6 py-3 text-left text-gray-300">Name</th>
                  <th className="px-6 py-3 text-left text-gray-300">Enrollment Date</th>
                  <th className="px-6 py-3 text-left text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-3 text-white">{student.id}</td>
                    <td className="px-6 py-3 text-white">{student.email}</td>
                    <td className="px-6 py-3 text-white">{student.name}</td>
                    <td className="px-6 py-3 text-gray-400">{student.enrollment_date}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          student.status === 'active'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex gap-2">
                      <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm">
                        Edit
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
          !loading && <p className="text-gray-400">No students found.</p>
        )}
      </div>
    </AdminLayout>
  );
}
