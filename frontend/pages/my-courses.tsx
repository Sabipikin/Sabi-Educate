'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface EnrolledCourse {
  id: number;
  user_id: number;
  course_id: number;
  course: {
    id: number;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration_hours: number;
    status: string;
  };
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  modules_count: number;
  content_items_count: number;
  completed_items: number;
}

export default function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');
  const router = useRouter();

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    if (!authToken) {
      router.push('/login');
      return;
    }

    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterStatus !== 'all') {
          params.append('status_filter', filterStatus);
        }

        const response = await fetch(
          `http://localhost:8000/api/enrollment/courses/enrolled${params.toString() ? '?' + params.toString() : ''}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch enrolled courses');
        const data = await response.json();
        setEnrolledCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading courses');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [authToken, filterStatus, router]);

  const inProgressCourses = enrolledCourses.filter(e => !e.completed_at);
  const completedCourses = enrolledCourses.filter(e => e.completed_at);

  const getStatusBadge = (course: EnrolledCourse) => {
    if (course.completed_at) {
      return <span className="px-3 py-1 bg-green-900/30 border border-green-600 text-green-300 rounded-full text-xs font-medium">✓ Completed</span>;
    }
    return <span className="px-3 py-1 bg-blue-900/30 border border-blue-600 text-blue-300 rounded-full text-xs font-medium">In Progress</span>;
  };

  return (
    <main className="min-h-screen bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Courses</h1>
          <p className="text-gray-400">
            {loading ? 'Loading...' : `${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''} enrolled`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-4">
          {['all', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                filterStatus === status
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : 'Completed'} ({status === 'all' ? enrolledCourses.length : status === 'in_progress' ? inProgressCourses.length : completedCourses.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 mt-4">Loading your courses...</p>
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center bg-gray-800 rounded-lg p-12 border border-gray-700">
            <p className="text-gray-400 text-lg mb-4">No enrolled courses yet</p>
            <button
              onClick={() => router.push('/courses')}
              className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium"
            >
              Explore Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((enrollment) => {
              const { course } = enrollment;
              const completionPercent = enrollment.progress_percentage;
              const daysEnrolled = Math.floor(
                (Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={enrollment.id}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all group cursor-pointer"
                  onClick={() => router.push(`/learning?courseId=${course.id}`)}
                >
                  {/* Header */}
                  <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity"></div>
                    <div className="text-center relative z-10">
                      <p className="text-white text-sm font-medium">{course.category}</p>
                      <p className="text-cyan-100 text-xs mt-1">Level: {course.difficulty}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>

                    {/* Status Badge */}
                    <div className="mb-4">
                      {getStatusBadge(enrollment)}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs font-bold text-cyan-400">{completionPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${completionPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs mb-4 bg-gray-700/30 p-3 rounded">
                      <div className="text-center">
                        <p className="text-gray-500">Modules</p>
                        <p className="text-cyan-400 font-bold">{enrollment.modules_count}</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-600">
                        <p className="text-gray-500">Content</p>
                        <p className="text-cyan-400 font-bold">{enrollment.completed_items}/{enrollment.content_items_count}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Days</p>
                        <p className="text-cyan-400 font-bold">{daysEnrolled}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{course.duration_hours} hours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(enrollment.enrolled_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full py-2 rounded-lg font-medium bg-cyan-600 hover:bg-cyan-700 text-white transition-all">
                      {completionPercent === 100 ? '✓ Review Course' : '→ Continue Learning'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
