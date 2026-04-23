import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface StudentProgress {
  student_id: number;
  course_id: number;
  progress_percent: number;
  last_accessed: string;
}

export default function Assignments() {
  const { token } = useAdminAuth();
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchProgress = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/course/1/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch student progress');
        const data = await response.json();
        setProgress(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Student Progress & Assignments</h1>

        {loading && <p className="text-gray-400">Loading student progress...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {progress.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300">Student ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">Course ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">Progress</th>
                  <th className="px-6 py-3 text-left text-gray-300">Last Accessed</th>
                  <th className="px-6 py-3 text-left text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-3 text-white">{item.student_id}</td>
                    <td className="px-6 py-3 text-white">{item.course_id}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-cyan-600 h-2 rounded-full"
                            style={{ width: `${item.progress_percent}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm">{item.progress_percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{item.last_accessed}</td>
                    <td className="px-6 py-3">
                      <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-gray-400">No student progress data found.</p>
        )}
      </div>
    </AdminLayout>
  );
}
