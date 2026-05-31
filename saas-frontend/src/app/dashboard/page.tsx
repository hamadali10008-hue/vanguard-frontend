'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Shield, LogOut, Building2, Zap, Layers, CheckSquare, Presentation } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/api';

interface SummaryMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>('');
  const [role, setRole] = useState<string | null>('');
  const [metrics, setMetrics] = useState<SummaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedTenant = localStorage.getItem('tenantId');
    const storedRole = localStorage.getItem('role');

    if (!token) {
      router.push('/login');
      return;
    }

    setTenantId(storedTenant);
    setRole(storedRole);

    const fetchSummaryData = async () => {
      try {
        const currentTenantId = storedTenant || '1';
        const response = await api.get('/Dashboards/summary', {
          headers: { 'X-Tenant-Id': currentTenantId }
        });
        setMetrics(response.data);
      } catch (err) {
        console.error("Failed to fetch engine environment telemetry metrics.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";
    router.push('/login');
  };

  // 📊 Calculate project tracking layout distributions
  const totalProjects = metrics?.totalProjects || 0;
  const completedProjects = metrics?.completedProjects || 0;
  const projectCompletionPercentage = totalProjects > 0 
    ? Math.round((completedProjects / totalProjects) * 100) 
    : 0;

  const totalTasks = metrics?.totalTasks || 0;
  const completedTasks = metrics?.completedTasks || 0;
  const taskCompletionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400">
              <Shield className="h-4 w-4 text-slate-950 stroke-[2.5]" />
            </div>
            <span>vanguard<span className="text-emerald-400">.io</span></span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-indigo-600/10 px-3 py-2.5 text-sm font-semibold text-indigo-400 border border-indigo-500/10">
              <LayoutDashboard className="h-4 w-4" />
              <span>Console Overview</span>
            </Link>
            
            <Link href="/dashboard/projects" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200">
              <Layers className="h-4 w-4" />
              <span>Operational Projects</span>
            </Link>
            
            <Link href="/dashboard/team" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200">
              <Users className="h-4 w-4" />
              <span>Team Directory</span>
            </Link>
          </nav>
        </div>

        {/* Logout Action */}
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-10 space-y-8">
        
        {/* Header Section */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">System Architecture Control</h1>
            <p className="text-sm text-slate-400">Live analytics telemetry data for your active container node.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </div>
          </div>
        </header>

        {/* Dynamic Analytics Overview Displays */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-800 border-t-indigo-500" />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Top Identity Framework Rows */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Tenant Isolation</span>
                  <Building2 className="h-4 w-4 text-indigo-400" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-white font-mono">ID: {tenantId || '00'}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Assigned Identity Role</span>
                  <Shield className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-white capitalize">{role || 'User'}</p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">System Node Status</span>
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-3xl font-bold tracking-tight text-white">Optimal</p>
              </div>
            </div>

            {/* Live Infrastructure Data Analytics Matrix */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Project Allocation Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Presentation className="h-4 w-4" /> Project Architecture Footprint
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                      <p className="text-2xl font-extrabold text-white">{totalProjects}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1 font-semibold">Total Logged</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                      <p className="text-2xl font-extrabold text-indigo-400">{metrics?.activeProjects || 0}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1 font-semibold">Active</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                      <p className="text-2xl font-extrabold text-blue-400">{completedProjects}</p>
                      <p className="text-[10px] text-slate-500 uppercase mt-1 font-semibold">Completed</p>
                    </div>
                  </div>
                </div>

                {/* 📈 NEW: Project Distribution Summary Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Project Lifecycle Status</span>
                    <span className="text-indigo-400 font-bold">{projectCompletionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${projectCompletionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Milestones and Task Velocity Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" /> Milestone Operational Pipeline
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>Task Pipeline Volume: {completedTasks} / {totalTasks} Done</span>
                      <span className="text-emerald-400 font-bold">{taskCompletionPercentage}%</span>
                    </div>
                    {/* Visual Progress Bar track structure */}
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${taskCompletionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-xs font-mono pt-1">
                  <p className="text-slate-400">Pending Actions: <span className="text-amber-400 font-bold">{metrics?.pendingTasks || 0}</span></p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}