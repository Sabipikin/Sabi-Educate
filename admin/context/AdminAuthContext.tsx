'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminUser {
  id: number;
  user_id: number;
  role_id: number;
  username: string;
  department?: string;
  theme_preference: string;
  is_verified: boolean;
  role_name?: string;  // Will be populated from backend
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  token: string | null;
  role: string | null;
  theme: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTheme: (theme: string) => void;
  isLoading: boolean;
  error: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with default values (server-safe)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [theme, setThemeState] = useState<string>('dark');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration (client-only)
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedRole = localStorage.getItem('adminRole');
    const savedTheme = localStorage.getItem('adminTheme') || 'dark';
    
    setToken(savedToken);
    setRole(savedRole);  // Now stores role_name like "super_admin"
    setThemeState(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    setIsHydrated(true);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Authenticate as admin using /api/admin/login endpoint
      const authRes = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!authRes.ok) {
        const data = await authRes.json();
        throw new Error(data.detail || 'Login failed');
      }

      const authData = await authRes.json();
      const adminToken = authData.access_token;
      const adminData = authData.admin_user;

      // Store admin-only tokens and role name
      localStorage.setItem('adminToken', adminToken);
      localStorage.setItem('adminRole', adminData.role_name || 'super_admin');  // Store role name like "super_admin"
      localStorage.setItem('adminTheme', adminData.theme_preference || 'dark');
      localStorage.setItem('adminUsername', adminData.username || '');
      
      setToken(adminToken);
      setAdminUser(adminData);
      setRole(adminData.role_name || 'super_admin');  // Store role name
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminTheme');
    setAdminUser(null);
    setToken(null);
    setRole(null);
    setThemeState('dark');
    setError(null);
    document.documentElement.setAttribute('data-theme', 'dark');
  };

  const setTheme = (newTheme: string) => {
    const validTheme = newTheme === 'white' ? 'white' : 'dark';
    setThemeState(validTheme);
    localStorage.setItem('adminTheme', validTheme);
    document.documentElement.setAttribute('data-theme', validTheme);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, token, role, theme, login, logout, setTheme, isLoading, error }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
