import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface Course {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function MyCourses() {
  const { token } = useAdminAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/my-courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">My Courses</h1>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg">
            Create New Course
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading courses...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600">
                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                <p className="text-gray-500 text-xs mb-4">Created: {course.created_at}</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded">
                    Edit
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-400">No courses found. Create one to get started!</p>
        )}
      </div>
    </AdminLayout>
  );
}
