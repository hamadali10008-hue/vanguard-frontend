'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
     const response = await axios.post('https://localhost:7066/api/Users/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tenantId', response.data.tenantId);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('fullname', response.data.FullName); 
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data || 'Invalid corporate credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 font-sans antialiased">
      <div className="relative hidden w-0 flex-1 lg:block bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="relative flex h-full flex-col justify-between p-12 z-10">
          <div className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 shadow-lg">
              <ShieldCheck className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span>vanguard<span className="text-emerald-400">.io</span></span>
          </div>
          <div className="max-w-xl space-y-4">
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-400 uppercase border border-indigo-500/20">
              Enterprise Hub v2.0
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-tight">
              Isolated workloads. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Zero trust architecture.
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-500">&copy; 2026 Vanguard Core Systems Inc.</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-slate-950 border-l border-slate-800">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Console Identity Login</h2>
            <p className="text-sm text-slate-400">Enter your provisioned organization credentials.</p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Corporate Email</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3"><Mail className="h-4 w-4 text-slate-500" /></div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-slate-400 uppercase">Access Key / Password</label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3"><Lock className="h-4 w-4 text-slate-500" /></div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}