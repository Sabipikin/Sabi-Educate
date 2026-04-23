'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

export default function CreateCourse() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [difficulty, setDifficulty] = useState('beginner');
  const [durationHours, setDurationHours] = useState(10);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    if (!token) {
      setError('Authentication required. Please login again.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:8000/api/admin/courses', {
        method: 'POST',
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
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || `HTTP ${response.status}`);
      }

      const course = await response.json();
      setSuccess(true);
      alert(`✓ Course "${title}" created successfully!`);
      setTitle('');
      setDescription('');
      
      setTimeout(() => router.push('/super-admin/courses'), 2000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error:', errorMsg);
      setError(`Failed to create course: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Create New Course</h1>

        {/* Status Indicators */}
        <div className={`p-3 rounded text-sm ${token ? 'bg-green-900/30 border border-green-600 text-green-300' : 'bg-red-900/30 border border-red-600 text-red-300'}`}>
          {token ? '✓ Authenticated' : '✗ Not authenticated - Please login'}
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500 text-green-300 rounded-lg">
            ✓ Course created! Redirecting...
          </div>
        )}

        <form onSubmit={handleCreateCourse} className="space-y-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          
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
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                <option>Programming</option>
                <option>Design</option>
                <option>Business</option>
                <option>Data Science</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Duration (hrs)</label>
              <input type="number" value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} min="1" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !title.trim()}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading || !token || !title.trim() ? 'bg-gray-600 opacity-50' : 'bg-cyan-600 hover:bg-cyan-700'}`}
          >
            {loading ? '⏳ Creating...' : '✓ Create Course'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">After creating the course, you can add modules and content.</p>
      </div>
    </AdminLayout>
  );
}
