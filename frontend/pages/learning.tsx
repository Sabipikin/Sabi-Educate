'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Course, apiService } from '@/services/api';

export default function LearningPage() {
  const { user, token, loading, refreshEnrolledCourses, enrolledCourses } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await apiService.getCourses(token || undefined);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  const handleEnroll = async (courseId: number) => {
    setEnrolling(courseId);
    try {
      await apiService.enrollCourse(courseId, token || undefined);
      await refreshEnrolledCourses(); // Refresh enrolled courses in context
      alert('Successfully enrolled in the course!');
    } catch (error: any) {
      console.error('Failed to enroll:', error);
      // Check if the error is "Already enrolled in this course"
      if (error.message && error.message.includes('Already enrolled in this course')) {
        alert('You are already enrolled in this course.');
      } else {
        alert('Failed to enroll in the course. Please try again.');
      }
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId: number) => {
    return enrolledCourses.some(enrollment => enrollment.course.id === courseId);
  };

  const getLevelColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-primary/20 glow">
          <div className="flex flex-col lg:flex-row items-start justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <Link href="/dashboard" className="text-primary hover:text-primary-dark font-medium mb-6 inline-flex items-center transition-colors">
                <span className="mr-2">←</span> Back to Dashboard
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">Learning Hub</h1>
              <p className="text-text-muted text-lg">
                Discover courses and resources to advance your career in data and technology.
              </p>
            </div>
          </div>
        </div>

        {/* Course Categories */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-primary/20 glow">
          <h2 className="text-2xl font-bold text-foreground mb-6 font-display">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {['All', 'Data Science', 'Programming', 'Database', 'Visualization', 'AI/ML', 'Career'].map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-surface-light text-foreground rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition text-sm font-medium border border-primary/20"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-primary/20 hover:border-primary/50 hover:bg-surface-light transition p-6 glow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                <span className="text-sm text-gray-500">{course.category}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{course.duration_hours} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Instructor:</span>
                  <span className="font-medium">Course {course.id}</span>
                </div>
              </div>

              <div className="space-y-2">
                {isEnrolled(course.id) ? (
                  <Link href={`/course/${course.id}`}>
                    <div className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition text-center cursor-pointer">
                      Continue Learning
                    </div>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      isEnrolled(course.id)
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {enrolling === course.id
                      ? 'Enrolling...'
                      : 'Enroll Now'
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Learning Path Recommendation */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mt-12 border border-primary/20 glow">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4 font-display">Recommended Learning Path</h2>
            <p className="text-text-muted mb-8 max-w-2xl mx-auto text-lg">
              Based on your region ({user?.region?.toUpperCase()}) and career goals, we recommend starting with our
              Data Analyst learning path. This comprehensive program will give you the skills needed for high-demand roles.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-primary hover:bg-primary-dark text-background px-6 py-3 rounded-xl font-medium transition glow">
                Start Data Analyst Path
              </button>
              <button className="bg-transparent text-primary px-6 py-3 rounded-xl font-medium border border-primary/50 hover:bg-primary/10 transition">
                Customize My Path
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}