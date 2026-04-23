'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLayout } from '@/components/AdminLayout';

interface Module {
  id: number;
  title: string;
  description?: string;
  order: number;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  status: string;
  created_at: string;
}

export default function ManageCourse() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Module form state
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState(1);
  const [submittingModule, setSubmittingModule] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);

  // Fetch course and modules
  useEffect(() => {
    if (!token || !courseId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Get course - from student API
        const courseRes = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!courseRes.ok) throw new Error('Failed to fetch course');
        const courseData = await courseRes.json();
        setCourse(courseData);

        // Get modules - from admin API
        const modulesRes = await fetch(`http://localhost:8000/api/admin/courses/${courseId}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!modulesRes.ok) throw new Error('Failed to fetch modules');
        const modulesData = await modulesRes.json();
        setModules(Array.isArray(modulesData) ? modulesData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, courseId]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setModuleError(null);

    if (!moduleTitle.trim()) {
      setModuleError('Module title is required');
      return;
    }

    if (!token || !courseId) {
      setModuleError('Authentication required');
      return;
    }

    setSubmittingModule(true);

    try {
      const response = await fetch(`http://localhost:8000/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: moduleTitle,
          description: moduleDescription,
          order: moduleOrder,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      const newModule = await response.json();
      setModules([...modules, newModule]);
      setModuleTitle('');
      setModuleDescription('');
      setModuleOrder(modules.length + 1);
      setShowModuleForm(false);
      
      // Auto-redirect to manage content for the newly created module
      setTimeout(() => {
        router.push(`/super-admin/manage-module?id=${newModule.id}&courseId=${courseId}`);
      }, 500);
    } catch (err) {
      setModuleError(err instanceof Error ? err.message : 'Failed to create module');
    } finally {
      setSubmittingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete module');

      setModules(modules.filter(m => m.id !== moduleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="text-gray-300 mt-4">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!course) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-300">Course not found</p>
          <button
            onClick={() => router.push('/super-admin/courses')}
            className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Courses
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Course Header */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-gray-400 mb-4">{course.description}</p>
              <div className="flex gap-4 text-sm">
                <span className="bg-gray-700 px-3 py-1 rounded text-cyan-300">{course.category}</span>
                <span className="bg-gray-700 px-3 py-1 rounded text-cyan-300">{course.difficulty}</span>
                <span className="bg-gray-700 px-3 py-1 rounded text-cyan-300">{course.duration_hours} hours</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/super-admin/courses')}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Modules Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Course Modules</h2>
            <button
              onClick={() => setShowModuleForm(!showModuleForm)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {showModuleForm ? '✕ Cancel' : '+ Add Module'}
            </button>
          </div>

          {/* Add Module Form */}
          {showModuleForm && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              {moduleError && (
                <div className="p-3 mb-4 bg-red-900/20 border border-red-500 text-red-300 rounded">
                  {moduleError}
                </div>
              )}

              <form onSubmit={handleAddModule} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Module Title *</label>
                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="e.g., Chapter 1: Basics"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    placeholder="What will this module cover?"
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Module Order</label>
                  <input
                    type="number"
                    value={moduleOrder}
                    onChange={(e) => setModuleOrder(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submittingModule}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium"
                  >
                    {submittingModule ? '⏳ Creating...' : '✓ Create Module'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModuleForm(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modules List */}
          {modules.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 border-dashed text-center">
              <p className="text-gray-400">No modules yet. Add your first module to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {modules.map((module) => (
                <div key={module.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">Module {module.order}: {module.title}</h3>
                      {module.description && (
                        <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => router.push(`/super-admin/manage-module?id=${module.id}&courseId=${courseId}`)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                    >
                      → Manage Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
