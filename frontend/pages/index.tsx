'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      router.push('/dashboard');
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-text-muted ml-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto relative">
        <div className="text-3xl font-bold text-foreground font-display glow-text">Sabipath</div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-foreground hover:text-primary font-medium transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="bg-primary text-background px-6 py-3 rounded-xl hover:bg-primary-dark font-semibold glow transition-all hover:scale-105">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight font-display">
            Land Your Tech Career<br />
            <span className="text-primary glow-text">Faster</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            Learn real skills. Build a real portfolio. Get hired. No fluff, no gatekeeping—just a region-aware career operating system built for you.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24">
          <Link href="/signup" className="bg-primary text-background px-10 py-5 rounded-xl hover:bg-primary-dark font-semibold text-lg glow transition-all hover:scale-105 hover:shadow-2xl">
            Start for free
          </Link>
          <Link href="/#features" className="border-2 border-primary/50 text-primary px-10 py-5 rounded-xl hover:bg-primary/10 hover:border-primary font-semibold text-lg transition-all hover:scale-105">
            Learn more
          </Link>
        </div>

        {/* Features Preview */}
        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Accelerated Learning</h3>
            <p className="text-text-muted leading-relaxed">
              Structured programs designed with employers in mind. Get from zero to job-ready in weeks, not years.
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Portfolio Builder</h3>
            <p className="text-text-muted leading-relaxed">
              Create portfolio projects that employers actually care about. No generic apps—real, impactful work.
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">⚡</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">AI-Powered Career</h3>
            <p className="text-text-muted leading-relaxed">
              Smart career guidance, interview prep, and job matching. Your competitive advantage in tech.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 text-center">
          <div className="bg-surface/50 rounded-xl p-8 border border-primary/20">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-display">2-3 weeks</div>
            <p className="text-text-muted">From signup to job-ready</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-8 border border-secondary/20">
            <div className="text-4xl md:text-5xl font-bold text-secondary mb-2 font-display">UK, IE, EU</div>
            <p className="text-text-muted">Region-aware, not generic</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-8 border border-accent/20">
            <div className="text-4xl md:text-5xl font-bold text-accent mb-2 font-display">100% Free</div>
            <p className="text-text-muted">No gatekeeping</p>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="text-center py-24 border-t border-primary/20 bg-surface/30">
        <h2 className="text-4xl font-bold text-foreground mb-6 font-display">Ready to start?</h2>
        <p className="text-text-muted mb-10 text-lg">Join hundreds learning real tech skills</p>
        <Link href="/signup" className="bg-primary text-background px-10 py-5 rounded-xl hover:bg-primary-dark font-semibold text-lg glow transition-all hover:scale-105 hover:shadow-2xl inline-block">
          Get started free
        </Link>
      </div>
    </div>
  );
}
