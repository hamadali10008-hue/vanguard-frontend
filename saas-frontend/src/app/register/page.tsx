'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Automatically grab the token and tenantId straight out of the URL bar!
  const token = searchParams.get('token');
  const tenantId = searchParams.get('tenantId');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFinalizeAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 2. Pass everything back to our C# backend to complete the registration
      await axios.post('https://localhost:7066/api/Users/complete-registration', {
        token: token,
        tenantId: tenantId,
        password: password
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to complete corporate onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white font-sans antialiased">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Finalize Credentials</h1>
          <p className="text-xs text-slate-400">
            Initializing node attachment for Tenant ID Group: <span className="text-indigo-400 font-mono font-bold">#{tenantId}</span>
          </p>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center space-y-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto animate-bounce" />
            <p className="font-bold">Account Securely Provisioned!</p>
            <p className="text-xs text-slate-400">Redirecting to terminal login node...</p>
          </div>
        ) : (
          <form onSubmit={handleFinalizeAccount} className="space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">{error}</div>}

            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Choose Security Password</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-slate-500" /></div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Confirm Password</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3"><KeyRound className="h-4 w-4 text-slate-500" /></div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Securing Identity Node...' : 'Complete System Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}