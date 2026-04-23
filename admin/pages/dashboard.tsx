'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface DashboardStats {
  [key: string]: number | string;
}

export default function Dashboard() {
  const router = useRouter();
  const { token, role } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      window.location.href = 'http://localhost:3002/login';
    }
  }, [token]);

  useEffect(() => {
    if (!token || !role) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/admin/dashboard-stats', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.warn(`API returned ${response.status}: ${response.statusText}`);
          // Even if API fails, show the dashboard with role-based sections
          setStats({});
          setError(null);
          return;
        }

        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        // Show dashboard even if API fails
        setStats({});
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, role]);

  const StatCard = ({ label, value, icon }: { label: string; value: any; icon: string }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-cyan-600 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-400 text-sm mb-2">{label}</h3>
          <p className="text-3xl font-bold text-cyan-400">{value || 0}</p>
        </div>
        <span className="text-4xl text-gray-600">{icon}</span>
      </div>
    </div>
  );

  const QuickActionButton = ({ label, icon, href, color = 'blue' }: { label: string; icon: string; href: string; color?: string }) => {
    const colorClasses = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      red: 'bg-red-600 hover:bg-red-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      cyan: 'bg-cyan-600 hover:bg-cyan-700',
    };
    return (
      <a
        href={href}
        className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors`}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </a>
    );
  };

  const renderRoleSpecificContent = () => {
    switch (role) {
      case 'super_admin':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats?.total_users} icon="👥" />
              <StatCard label="Total Courses" value={stats?.total_courses} icon="📚" />
              <StatCard label="Complaints" value={stats?.total_complaints} icon="⚠️" />
              <StatCard label="Revenue" value={`£${stats?.total_revenue || 0}`} icon="💰" />
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Super Admin Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <QuickActionButton label="Manage Users" icon="👥" href="/super-admin/users" color="cyan" />
                <QuickActionButton label="Create Course" icon="📝" href="/super-admin/create-course" color="green" />
                <QuickActionButton label="View Courses" icon="📚" href="/super-admin/courses" color="blue" />
                <QuickActionButton label="View Analytics" icon="📊" href="/super-admin/analytics" color="purple" />
                <QuickActionButton label="View Payments" icon="💳" href="/accounts/payments" color="cyan" />
              </div>
            </div>
          </>
        );

      case 'teacher':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="My Courses" value={stats?.my_courses} icon="📚" />
              <StatCard label="Total Students" value={stats?.total_students} icon="👨‍🎓" />
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Teacher Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton label="My Courses" icon="📚" href="/teacher/my-courses" color="blue" />
                <QuickActionButton label="Create Assignment" icon="✏️" href="/teacher/assignments" color="green" />
                <QuickActionButton label="Grade Submissions" icon="📝" href="/teacher/assignments" color="purple" />
                <QuickActionButton label="View Students" icon="👨‍🎓" href="/staff/students" color="cyan" />
              </div>
            </div>
          </>
        );

      case 'admin_staff':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Complaints" value={stats?.total_complaints} icon="⚠️" />
              <StatCard label="Open Tickets" value={stats?.open_complaints} icon="🔴" />
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Staff Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton label="View Complaints" icon="⚠️" href="/staff/complaints" color="red" />
                <QuickActionButton label="Manage Students" icon="👨‍🎓" href="/staff/students" color="blue" />
                <QuickActionButton label="View All Users" icon="👥" href="/super-admin/users" color="cyan" />
                <QuickActionButton label="System Reports" icon="📊" href="/super-admin/analytics" color="purple" />
              </div>
            </div>
          </>
        );

      case 'accounts':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Payments" value={stats?.total_payments} icon="💳" />
              <StatCard label="Pending Payments" value={stats?.pending_payments} icon="⏳" />
              <StatCard label="Total Revenue" value={`£${stats?.total_revenue || 0}`} icon="💰" />
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Accounts Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionButton label="View Payments" icon="💳" href="/accounts/payments" color="green" />
                <QuickActionButton label="Process Invoice" icon="📋" href="/accounts/invoices" color="blue" />
                <QuickActionButton label="Revenue Report" icon="📊" href="/super-admin/analytics" color="purple" />
                <QuickActionButton label="Manage Users" icon="👥" href="/super-admin/users" color="cyan" />
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="bg-yellow-900/20 border border-yellow-600 text-yellow-300 p-4 rounded-lg">
            ⚠️ Unknown admin role: {role}
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, Admin</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Role</p>
            <p className="text-cyan-400 capitalize font-bold">{role?.replace('_', ' ') || 'N/A'}</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-600 text-red-300 p-4 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400">⏳ Loading dashboard...</p>
          </div>
        )}

        {/* Content - Show even if stats are loading/empty */}
        {!loading && stats !== null && renderRoleSpecificContent()}
        
        {/* Fallback if no role detected */}
        {!loading && !role && (
          <div className="bg-yellow-900/20 border border-yellow-600 text-yellow-300 p-4 rounded-lg">
            ⚠️ No admin role detected. Please login again.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
