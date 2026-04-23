'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLayout } from '@/components/AdminLayout';

interface Course {
  id: number;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  prerequisites?: string;
  status: string;
  instructor_id: number;
  created_at: string;
  updated_at?: string;
}

export default function CourseDetails() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [durationHours, setDurationHours] = useState(10);
  const [prerequisites, setPrerequisites] = useState('');

  // Fetch course details
  useEffect(() => {
    if (!token || !courseId) return;

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/admin/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch course');

        const courseData = await response.json();
        setCourse(courseData);

        // Set form fields
        setTitle(courseData.title);
        setDescription(courseData.description || '');
        setCategory(courseData.category);
        setDifficulty(courseData.difficulty);
        setDurationHours(courseData.duration_hours);
        setPrerequisites(courseData.prerequisites || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [token, courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    if (!token || !courseId) {
      setError('Authentication required');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`http://localhost:8000/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          duration_hours: durationHours,
          prerequisites: prerequisites || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      const updatedCourse = await response.json();
      setCourse(updatedCourse);
      setIsEditing(false);
      alert('✓ Course updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !courseId) return;

    if (
      !confirm(
        'Are you sure you want to delete this course? This will also delete all modules, content, and enrollments. This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete course');

      alert('✓ Course deleted successfully!');
      router.push('/super-admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const handleManageModules = () => {
    router.push(`/super-admin/manage-course?id=${courseId}`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <p className="text-gray-300 mt-4">Loading course details...</p>
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
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">Course Details</h1>
            <p className="text-gray-400 mt-2">ID: {course.id}</p>
          </div>
          <button
            onClick={() => router.push('/super-admin/courses')}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* View Mode */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Course Title</p>
                  <p className="text-white text-xl font-bold">{course.title}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Description</p>
                  <p className="text-gray-300">{course.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Category</p>
                    <p className="text-cyan-300 font-medium">{course.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Difficulty</p>
                    <p className="text-cyan-300 font-medium capitalize">{course.difficulty}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-cyan-300 font-medium">{course.duration_hours} hours</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className="inline-block px-3 py-1 bg-green-900/30 border border-green-600 text-green-300 rounded text-sm font-medium">
                      {course.status}
                    </span>
                  </div>
                </div>

                {course.prerequisites && (
                  <div>
                    <p className="text-gray-400 text-sm">Prerequisites</p>
                    <p className="text-gray-300">{course.prerequisites}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="text-gray-300">{new Date(course.created_at).toLocaleDateString()}</p>
                  </div>
                  {course.updated_at && (
                    <div>
                      <p className="text-gray-400">Updated</p>
                      <p className="text-gray-300">{new Date(course.updated_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                ✎ Edit Course Details
              </button>

              <button
                onClick={handleManageModules}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                📚 Manage Modules & Content
              </button>

              <button
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                🗑️ Delete Course
              </button>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Course Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., Python Fundamentals"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will students learn..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option>Programming</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Duration (hrs)</label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Prerequisites</label>
                <input
                  type="text"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  placeholder="e.g., Basic JavaScript knowledge"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium"
                >
                  {isSaving ? '⏳ Saving...' : '✓ Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    if (course) {
                      setTitle(course.title);
                      setDescription(course.description || '');
                      setCategory(course.category);
                      setDifficulty(course.difficulty);
                      setDurationHours(course.duration_hours);
                      setPrerequisites(course.prerequisites || '');
                    }
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
