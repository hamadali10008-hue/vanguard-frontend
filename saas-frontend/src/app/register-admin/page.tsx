'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Building2, CheckCircle2, ShieldAlert } from 'lucide-react';
import axios from 'axios';

export default function RegisterAdminPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegisterAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 💡 CALLING YOUR ACTUAL .NET ENDPOINT: [HttpPost("register-admin")]
      await axios.post('https://localhost:7066/api/Users/register-admin', {
        email: email,
        password: password,
        companyName: companyName
      });

      setSuccess(true);
      // Wait 3 seconds so they can enjoy the victory state, then boot them to login
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data || 'Platform initialization failed. System rejected requests.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white font-sans antialiased">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Provision Enterprise Core</h1>
          <p className="text-xs text-slate-400">Initialize your root administrative identity and dedicated workspace node.</p>
        </div>

        {success ? (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6 text-center space-y-3 text-emerald-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
            <p className="font-bold text-lg">Platform Initialized Successfully!</p>
            <p className="text-xs text-slate-400">Your isolated database partition is active. Routing to terminal gateway login...</p>
          </div>
        ) : (
          <form onSubmit={handleRegisterAdmin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400 font-medium">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Company Name Input */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Corporate Entity Name</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3"><Building2 className="h-4 w-4 text-slate-500" /></div>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Operations Corp"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Root Admin Email</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-slate-500" /></div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="root@company.com"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Master Access Key</label>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Executing Provisioning Scripts...' : 'Initialize Master Node'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}