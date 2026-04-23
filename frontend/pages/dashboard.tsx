'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { apiService } from '@/services/api';

interface UserStats {
  completedCourses: number;
  totalCourses: number;
  currentStreak: number;
  points: number;
  totalHours: number;
  badges: any[];
}

export default function DashboardPage() {
  const { user, token, loading, enrolledCourses } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    completedCourses: 0,
    totalCourses: 12,
    currentStreak: 0,
    points: 0,
    totalHours: 0,
    badges: []
  });
  const [gamificationLoading, setGamificationLoading] = useState(true);

  const fetchGamificationStats = async () => {
    try {
      if (!token) {
        setGamificationLoading(false);
        return;
      }
      const response = await apiService.getGamificationStats(token || undefined);
      setStats(prev => ({
        ...prev,
        currentStreak: response.streak?.current_streak || 0,
        points: response.points?.total_points || 0,
        badges: response.badges || []
      }));
    } catch (error: any) {
      console.warn('Gamification stats not yet available:', error?.message);
      // Set default values if endpoint not available (new installation)
      setStats(prev => ({
        ...prev,
        currentStreak: 0,
        points: 0,
        badges: []
      }));
    } finally {
      setGamificationLoading(false);
    }
  };

  const handleRegionChange = async (newRegion: string) => {
    try {
      // Call API to update user region
      await apiService.updateUserRegion(newRegion, token || undefined);
      window.location.reload(); // Reload to see region changes apply
    } catch (error) {
      console.error('Failed to update region:', error);
    }
  };

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  useEffect(() => {
    if (token) {
      fetchGamificationStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  const completedCourses = enrolledCourses.filter(ec => ec.enrollment.completed_at).length;
  const totalEnrolled = enrolledCourses.length;
  const progressPercentage = totalEnrolled > 0 ? Math.round((completedCourses / totalEnrolled) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-primary/20 glow">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">
                Welcome back, <span className="text-primary glow-text">{user?.full_name}</span>!
              </h1>
              <p className="text-text-muted text-lg">
                Ready to continue your career journey? Here's your progress overview.
              </p>
            </div>
            <div className="text-left lg:text-right">
              <div className="text-sm text-text-muted mb-1">Member since</div>
              <div className="font-semibold text-foreground text-lg">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Progress Card */}
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow">
            <div className="flex items-center mb-4">
              <div className="p-4 bg-primary/20 rounded-xl">
                <span className="text-3xl">📊</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-text-muted">Courses Completed</div>
                <div className="text-3xl font-bold text-foreground font-display">{completedCourses}/{totalEnrolled}</div>
                <div className="text-sm text-text-muted">{progressPercentage}% complete</div>
              </div>
            </div>
            <div className="bg-surface rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary-dark h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 glow">
            <div className="flex items-center">
              <div className="p-4 bg-secondary/20 rounded-xl">
                <span className="text-3xl">🔥</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-text-muted">Current Streak</div>
                <div className="text-3xl font-bold text-foreground font-display">{stats.currentStreak}</div>
                <div className="text-sm text-text-muted">days active</div>
              </div>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow">
            <div className="flex items-center">
              <div className="p-4 bg-accent/20 rounded-xl">
                <span className="text-3xl">⭐</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-text-muted">Your Points</div>
                <div className="text-3xl font-bold text-foreground font-display">{stats.points}</div>
                <div className="text-sm text-text-muted">keep learning!</div>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow">
            <div className="flex items-center">
              <div className="p-4 bg-accent/20 rounded-xl">
                <span className="text-3xl">⏱️</span>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-text-muted">Hours Learned</div>
                <div className="text-3xl font-bold text-foreground font-display">{stats.totalHours}h</div>
                <div className="text-sm text-text-muted">this month</div>
              </div>
            </div>
          </div>

          {/* Region Selector Card */}
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 bg-primary/20 rounded-xl">
                  <span className="text-3xl">
                    {user?.region === 'uk' ? '🇬🇧' : user?.region === 'ie' ? '🇮🇪' : '🇪🇺'}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-text-muted">Career Region</div>
                  <div className="text-2xl font-bold text-foreground font-display capitalize">{user?.region}</div>
                </div>
              </div>
              <select
                value={user?.region || 'uk'}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="px-4 py-2 bg-surface border border-primary/30 rounded-lg text-foreground hover:border-primary/60 transition-colors cursor-pointer"
              >
                <option value="uk">🇬🇧 UK</option>
                <option value="ie">🇮🇪 Ireland</option>
                <option value="eu">🇪🇺 EU</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Hub */}
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground font-display">Learning Hub</h2>
              <Link href="/learning" className="text-primary hover:text-primary-dark font-medium transition-colors flex items-center">
                View all <span className="ml-1">→</span>
              </Link>
            </div>
            <p className="text-text-muted mb-6 leading-relaxed">Continue your learning journey with structured courses and resources.</p>
            <div className="space-y-4">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.slice(0, 2).map(({ course, enrollment }) => (
                  <Link key={course.id} href={`/course/${course.id}`}>
                    <div className="flex items-center p-4 bg-surface-light/50 rounded-xl hover:bg-surface-light/80 transition-all cursor-pointer border border-primary/10 hover:border-primary/30">
                      <span className="text-2xl mr-4">📚</span>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{course.title}</div>
                        <div className="text-sm text-text-muted">{course.category} • {course.difficulty}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="text-sm font-medium text-primary">{enrollment.progress_percentage}%</div>
                        <div className="w-16 bg-surface rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">📚</span>
                  <p className="text-text-muted mb-4">No courses enrolled yet</p>
                  <Link href="/learning" className="inline-flex items-center px-6 py-3 bg-primary text-background rounded-xl hover:bg-primary-dark font-medium transition-all hover:scale-105">
                    Browse courses <span className="ml-2">→</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Builder */}
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground font-display">Portfolio Builder</h2>
              <Link href="/portfolio" className="text-secondary hover:text-secondary/80 font-medium transition-colors flex items-center">
                Build now <span className="ml-1">→</span>
              </Link>
            </div>
            <p className="text-text-muted mb-6 leading-relaxed">Showcase your skills and projects to potential employers.</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-surface-light/50 rounded-xl border border-secondary/10">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">📄</span>
                  <div>
                    <div className="font-semibold text-foreground">Resume</div>
                    <div className="text-sm text-text-muted">Not started</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-secondary/20 text-secondary text-xs rounded-full font-medium">Draft</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-light/50 rounded-xl border border-secondary/10">
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🚀</span>
                  <div>
                    <div className="font-semibold text-foreground">Projects</div>
                    <div className="text-sm text-text-muted">0 projects added</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full font-medium">Empty</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Career Chat */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mt-8 border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground font-display">AI Career Assistant</h2>
            <Link href="/chat" className="text-accent hover:text-accent/80 font-medium transition-colors flex items-center">
              Start chatting <span className="ml-1">→</span>
            </Link>
          </div>
          <p className="text-text-muted mb-6 leading-relaxed">Get personalized career advice and guidance from our AI assistant.</p>
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-6 border border-accent/20">
            <div className="flex items-start">
              <span className="text-3xl mr-4">🤖</span>
              <div>
                <div className="font-semibold text-foreground mb-2">Ready to help!</div>
                <div className="text-text-muted">
                  Ask me about career paths, skill development, job search strategies, or get personalized recommendations.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
