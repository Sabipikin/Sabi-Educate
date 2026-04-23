'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login
    window.location.href = 'http://localhost:3002/login';
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Sabi Admin
        </h1>
        <p className="text-text-muted font-light">Redirecting to login...</p>
      </div>
    </div>
  );
}
