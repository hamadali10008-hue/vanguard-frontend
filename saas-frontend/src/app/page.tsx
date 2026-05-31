'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Terminal, Users, Cpu, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans antialiased selection:bg-indigo-500/30">
      
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-400" />
          <span className="text-xl font-black tracking-tight">vanguard<span className="text-indigo-500">.io</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/register-admin" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative px-8 pt-24 pb-20 mx-auto max-w-6xl text-center space-y-8">
        {/* Glow Effect */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 tracking-wide uppercase">
          <Terminal className="h-3.5 w-3.5" /> Next-Gen Isolated Cluster Architecture
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Secure multi-tenant operations. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Isolated by default.
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
          Deploy, audit, and provision enterprise workspace environments with built-in row-level database virtualization and zero-trust identity gates.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/register-admin" className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-bold text-white hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 group">
            Launch Your Workspace
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      {/* Core Architectural Pillars */}
      <section className="px-8 py-16 mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Tenant Group Isolation</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Each organization maps directly onto its own logical slice via automated .NET Core interceptors and Entity Framework global query filters.</p>
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Cryptographic Identity</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Secure JSON Web Tokens enforce fine-grained claims handling custom roles and strict permission verification checks.</p>
        </div>

        <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Automated Onboarding</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Administrators generate one-time cryptographically secure invite links that automatically inherit the parent tenant configuration.</p>
        </div>

      </section>
    </div>
  );
}