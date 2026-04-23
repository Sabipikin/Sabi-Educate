'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/courses', label: 'Explore' },
    { href: '/my-courses', label: 'My Courses' },
    { href: '/portfolio', label: 'Portfolio' },
  ];

  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="text-3xl font-bold text-foreground font-display glow-text hover:scale-105 transition-transform">
              Sabipath
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-foreground hover:text-primary font-medium transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
            <a href="#" className="text-foreground hover:text-primary font-medium transition-colors relative group">
              Help
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </a>
          </div>

          {/* User Menu & Mobile Button */}
          <div className="flex items-center space-x-4">
            {/* Desktop User Info */}
            <div className="hidden sm:block text-right">
              <div className="font-semibold text-foreground text-sm">{user?.full_name}</div>
              <div className="text-text-muted text-xs">{user?.email}</div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:block px-6 py-3 bg-secondary text-background rounded-xl hover:bg-secondary/80 font-medium transition-all hover:scale-105 glow"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary/20 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href="#" className="block px-4 py-2 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
              Help
            </a>
            <div className="border-t border-primary/20 pt-3 space-y-2">
              <div className="px-4 py-2">
                <div className="font-semibold text-foreground text-sm">{user?.full_name}</div>
                <div className="text-text-muted text-xs">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full mx-4 px-4 py-2 bg-secondary text-background rounded-lg hover:bg-secondary/80 font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
