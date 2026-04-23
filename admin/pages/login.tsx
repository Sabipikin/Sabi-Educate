'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface to-background px-4">
      <div className="w-full max-w-md p-8 bg-surface/90 backdrop-blur-sm rounded-2xl border border-primary/20 glow">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 font-display">Admin Console</h1>
          <p className="text-text-muted">Sign in to your admin account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-secondary/20 border border-secondary/30 text-secondary rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface-light border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground placeholder-text-muted"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 bg-surface-light border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground placeholder-text-muted"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-background py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 hover:scale-105 glow"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign in to Admin'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
