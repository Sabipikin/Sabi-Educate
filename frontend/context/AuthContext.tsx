'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, apiService, Course, Enrollment } from '@/services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  enrolledCourses: { enrollment: Enrollment; course: Course }[];
  signup: (email: string, password: string, full_name: string, region?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshEnrolledCourses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<{ enrollment: Enrollment; course: Course }[]>([]);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Optionally fetch current user here
    }
    setLoading(false);
  }, []);

  const refreshEnrolledCourses = async () => {
    if (!token) return;
    try {
      const courses = await apiService.getEnrolledCourses(token || undefined);
      setEnrolledCourses(courses);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch enrolled courses:', errorMessage);
      
      // If user not found or any 404/401 error, clear the invalid token
      if (
        errorMessage.includes('User not found') || 
        errorMessage.includes('404') || 
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        console.warn('Stored token is invalid. Clearing authentication.');
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      }
      // Set empty enrolled courses on error
      setEnrolledCourses([]);
    }
  };

  // Load enrolled courses when user is authenticated
  useEffect(() => {
    if (token) {
      refreshEnrolledCourses();
    }
  }, [token]);

  const signup = async (email: string, password: string, full_name: string, region = 'uk') => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.signup(email, password, full_name, region);
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('authToken', response.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.login(email, password);
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('authToken', response.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, enrolledCourses, signup, login, logout, refreshEnrolledCourses }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
