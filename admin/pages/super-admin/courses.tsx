import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  status: string;
  instructor_id: number;
  created_at: string;
}

export default function Courses() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/courses/', {
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

  const handleDeleteCourse = async (courseId: number) => {
    if (!token) return;

    if (
      !confirm(
        'Are you sure you want to delete this course? This will also delete all modules, content, and enrollments. This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingId(courseId);

    try {
      const response = await fetch(`http://localhost:8000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete course');

      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSelect = (courseId: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(courseId)) {
      newSelectedIds.delete(courseId);
    } else {
      newSelectedIds.add(courseId);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === courses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(courses.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      setError('Please select at least one course to delete');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} course(s)? This will also delete all modules, content, and enrollments. This action cannot be undone.`
      )
    ) {
      return;
    }

    setBulkLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/courses/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ course_ids: Array.from(selectedIds) }),
      });

      if (!response.ok) throw new Error('Failed to delete courses');
      
      const result = await response.json();
      setCourses(courses.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setError(null);
      alert(`Successfully deleted ${result.success_count} course(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete courses');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) {
      setError('Please select at least one course to publish');
      return;
    }

    setBulkLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/courses/bulk-publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ course_ids: Array.from(selectedIds) }),
      });

      if (!response.ok) throw new Error('Failed to publish courses');
      
      const result = await response.json();
      // Update course statuses to published
      const updatedCourses = courses.map(c => 
        selectedIds.has(c.id) ? { ...c, status: 'published' } : c
      );
      setCourses(updatedCourses);
      setSelectedIds(new Set());
      setError(null);
      alert(`Successfully published ${result.success_count} course(s)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish courses');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">All Courses</h1>
          <Link
            href="/super-admin/create-course"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            + Create Course
          </Link>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-cyan-950 border border-cyan-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-cyan-300 font-medium">{selectedIds.size} course(s) selected</span>
              <button
                onClick={handleBulkPublish}
                disabled={bulkLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
              >
                {bulkLoading ? '⏳' : '📤'} Publish Selected
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
              >
                {bulkLoading ? '⏳' : '🗑️'} Delete Selected
              </button>
            </div>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              ✕ Clear
            </button>
          </div>
        )}

        {loading && <p className="text-gray-400">Loading courses...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {courses.length > 0 ? (
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-gray-300">
                    <input
                      type="checkbox"
                      checked={courses.length > 0 && selectedIds.size === courses.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-gray-300">ID</th>
                  <th className="px-6 py-3 text-left text-gray-300">Title</th>
                  <th className="px-6 py-3 text-left text-gray-300">Category</th>
                  <th className="px-6 py-3 text-left text-gray-300">Difficulty</th>
                  <th className="px-6 py-3 text-left text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300">Created</th>
                  <th className="px-6 py-3 text-center text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className={`border-b border-gray-700 hover:bg-gray-750 ${selectedIds.has(course.id) ? 'bg-cyan-900/20' : ''}`}>
                    <td className="px-6 py-3 text-white">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(course.id)}
                        onChange={() => handleToggleSelect(course.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-3 text-white">{course.id}</td>
                    <td className="px-6 py-3 text-white font-medium">{course.title}</td>
                    <td className="px-6 py-3 text-white">{course.category}</td>
                    <td className="px-6 py-3 text-white">
                      <span className="px-2 py-1 bg-cyan-900 text-cyan-300 rounded text-sm">
                        {course.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 bg-green-900/30 border border-green-600 text-green-300 rounded text-sm">
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400">{new Date(course.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => router.push(`/super-admin/course-details?id=${course.id}`)}
                          className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
                          title="View & Edit Course"
                        >
                          ℹ️
                        </button>
                        <button
                          onClick={() => router.push(`/super-admin/manage-course?id=${course.id}`)}
                          className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                          title="Manage Modules"
                        >
                          📚
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          disabled={deletingId === course.id}
                          className="text-red-400 hover:text-red-300 font-medium text-sm disabled:opacity-50"
                          title="Delete Course"
                        >
                          {deletingId === course.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-gray-400">No courses found. <Link href="/super-admin/create-course" className="text-cyan-400 hover:underline">Create one now!</Link></p>
        )}
      </div>
    </AdminLayout>
  );
}
