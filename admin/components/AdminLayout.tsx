'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const { logout, role, token } = useAdminAuth();

  const userRole = role;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getNavItems = () => {
    const baseItems: any[] = [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    ];

    const roleSpecificItems: Record<string, any[]> = {
      super_admin: [
        { label: 'Analytics', href: '/super-admin/analytics', icon: '📈' },
        { label: 'Users', href: '/super-admin/users', icon: '👥' },
        { label: 'Frontend Users', href: '/super-admin/frontend-users', icon: '🌐' },
        { label: 'Courses', href: '/super-admin/courses', icon: '📚' },
        { label: 'Payments', href: '/super-admin/payments', icon: '💳' },
      ],
      teacher: [
        { label: 'My Courses', href: '/teacher/my-courses', icon: '📖' },
        { label: 'Assignments', href: '/teacher/assignments', icon: '📋' },
      ],
      admin_staff: [
        { label: 'Students', href: '/staff/students', icon: '🎓' },
        { label: 'Complaints', href: '/staff/complaints', icon: '⚠️' },
      ],
      accounts: [
        { label: 'Payments', href: '/accounts/payments', icon: '💰' },
        { label: 'Invoices', href: '/accounts/invoices', icon: '📄' },
      ],
    };

    const items = [...baseItems];
    if (userRole && roleSpecificItems[userRole]) {
      items.push(...roleSpecificItems[userRole]);
    }

    return items;
  };

  const navItems = getNavItems();

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-surface border-r border-border transition-all duration-300 flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {sidebarOpen ? (
            <div>
              <h2 className="text-primary font-display font-bold text-lg">Sabi</h2>
              <p className="text-text-muted text-xs">Admin Portal</p>
            </div>
          ) : (
            <div className="text-primary font-display font-bold text-lg">S</div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-surface-light rounded transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 border-l-2 border-primary text-primary'
                      : 'text-text-muted hover:bg-surface-light hover:text-foreground'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4 space-y-3">
          <div className={`${sidebarOpen ? 'block' : 'hidden'}`}>
            <p className="text-text-muted text-xs mb-1">Role</p>
            <p className="text-foreground text-sm font-medium capitalize">{userRole || 'User'}</p>
          </div>
          <Link href="/settings">
            <button className="w-full py-2 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all">
              {sidebarOpen ? '⚙️ Settings' : '⚙️'}
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg text-sm font-medium transition-all"
          >
            {sidebarOpen ? 'Logout' : '⬅'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-surface border-b border-border px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-text-muted text-sm">Logged in as</span>
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary font-bold">
              {userRole?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
