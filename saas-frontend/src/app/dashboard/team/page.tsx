'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, ArrowLeft, ShieldAlert, Users, ShieldCheck, Search, MailQuestion } from 'lucide-react'; // Added MailQuestion icon
import Link from 'next/link';
import api from '../../../lib/api';

interface TeamMember {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
}

// 💡 NEW INTERFACE: Structure for pending invites
interface PendingInvitation {
  id: number;
  email: string;
  expiryDate: string;
}

export default function TeamPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [teamList, setTeamList] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 💡 NEW STATE: Store the unaccepted email invitations
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);

  // Fetches fully registered active users
  const fetchTeamRoster = async () => {
    try {
      const currentTenantId = localStorage.getItem('tenantId') || '1';
      const rawToken = localStorage.getItem('token');
      const cleanToken = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';

      const response = await api.get('/Users/tenant-team', {
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'X-Tenant-Id': currentTenantId 
        }
      });
      
      setTeamList(response.data);
    } catch (err) {
      console.error("Failed to fetch tenant isolation directory.", err);
    }
  };

  // 💡 NEW FUNCTION: Fetches pending emails from the UserInvitations table
  const fetchPendingInvitations = async () => {
    try {
      const currentTenantId = localStorage.getItem('tenantId') || '1';
      const response = await api.get('/Users/pending-invitations', {
        headers: { 'X-Tenant-Id': currentTenantId }
      });
      setPendingInvites(response.data);
    } catch (err) {
      console.error("Failed to fetch pending registration logs.", err);
    }
  };

// 💡 NEW FUNCTION: Sends a DELETE request to your C# backend to remove the token row
const handleRevokeInvite = async (inviteId: number, targetEmail: string) => {
  const confirmRevoke = window.confirm(
    `Security Protocol:\n\nAre you sure you want to permanently revoke the invitation link sent to ${targetEmail}?`
  );

  if (!confirmRevoke) return;

  try {
    const currentTenantId = localStorage.getItem('tenantId') || '1';
    await api.delete(`/Users/revoke-invitation/${inviteId}`, {
      headers: { 'X-Tenant-Id': currentTenantId }
    });

    // Optimistically filter out the deleted invite from the UI list instantly
    setPendingInvites(prevInvites => prevInvites.filter(invite => invite.id !== inviteId));
  } catch (err: any) {
    alert(err.response?.data || "Failed to revoke invitation link.");
  }
};

  const handleRoleChange = async (userId: number, newRole: string) => {
    const targetEmployee = teamList.find(member => member.id === userId);
    const employeeEmail = targetEmployee ? targetEmployee.email : "this operator";

    const userConfirmed = window.confirm(
      `Security Warning:\n\nAre you sure you want to change the clearance level of ${employeeEmail} to ${newRole}?`
    );

    if (!userConfirmed) return;

    try {
      await api.put(`/Users/update-role/${userId}`, { role: newRole });
      setTeamList(prevList => 
        prevList.map(member => 
          member.id === userId ? { ...member, role: newRole } : member
        )
      );
    } catch (err: any) {
      alert(err.response?.data || "Failed to update operator clearance levels.");
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawRole = localStorage.getItem('role');
      const cleanedRole = rawRole ? rawRole.replace(/['"]+/g, '').trim().toLowerCase() : '';

      if (cleanedRole === 'admin') {
        setIsAuthorized(true);
        fetchTeamRoster(); 
        fetchPendingInvitations(); // 💡 Fetch invites alongside the main roster
      } else {
        setIsAuthorized(false);
      }
    }
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    const currentTenantId = localStorage.getItem('tenantId') || '1';

    try {
      await api.post('/Users/invite-coworker', {
        email: email,
        role: role,
        tenantId: currentTenantId
      });

      setSuccessMessage(`Success! A secure invitation link has been dispatched to ${email}`);
      setEmail('');
      fetchTeamRoster(); 
      fetchPendingInvitations(); // 💡 Refresh the list automatically when a new invite is generated!
    } catch (err: any) {
      alert(err.response?.data || 'Failed to dispatch corporate invitation.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeamList = teamList.filter((member) => {
    const normalizeQuery = searchQuery.toLowerCase();
    return (
      member.email.toLowerCase().includes(normalizeQuery) ||
      member.role.toLowerCase().includes(normalizeQuery)
    );
  });

  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">
        <div className="text-sm font-semibold tracking-wider uppercase animate-pulse">Verifying security clearance nodes...</div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-white font-sans antialiased">
        <div className="w-full max-w-md text-center space-y-6 rounded-xl border border-red-500/20 bg-slate-900/40 p-8 backdrop-blur-sm shadow-xl">
          <ShieldAlert className="h-14 w-14 text-red-400 mx-auto" />
          <h1 className="text-2xl font-extrabold text-red-400">Access Restricted</h1>
          <p className="text-sm text-slate-400">Your security clearance level is insufficient to access this administrative control node.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"><ArrowLeft className="h-4 w-4" /> Return to Command Center</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white font-sans antialiased">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Command Center
        </Link>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Identity & Access Control</h1>
          <p className="text-sm text-slate-400 mt-1">Provision and onboard new operators to your isolated organizational workspace node.</p>
        </div>

        {/* Invitation Form Component */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
            <UserPlus className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Invite Corporate Co-worker</h2>
          </div>
          {successMessage && <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">{successMessage}</div>}
          <form onSubmit={handleSendInvite} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none text-white" />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none text-white bg-no-repeat appearance-none">
                <option value="Member">Member (Read-Only)</option>
                <option value="Admin">Admin (Full Control)</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {loading ? 'Dispatched Request...' : 'Generate & Send Invite'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Workspace Directory Grid Section */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur-sm space-y-4">
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold">Active Workspace Directory</h2>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search operator or clearance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-4 text-xs focus:border-indigo-500 focus:outline-none text-white placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  <th className="p-4">Operator Identity</th>
                  <th className="p-4">Clearance Level</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-sm">
                {filteredTeamList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                      {teamList.length === 0 
                        ? "No other concurrent workspace operators found inside this tenant cluster node."
                        : "No matching directory nodes found for your current query."}
                    </td>
                  </tr>
                ) : (
                  filteredTeamList.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-medium text-slate-200">{member.email}</td>
                      <td className="p-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className={`rounded-md px-2 py-1 text-xs font-medium border bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none cursor-pointer ${
                            member.role === 'Admin' 
                              ? 'text-purple-400 border-purple-500/20 bg-purple-500/5' 
                              : 'text-blue-400 border-blue-500/20 bg-blue-500/5'
                          }`}
                        >
                          <option value="Admin" className="bg-slate-950 text-purple-400">Admin</option>
                          <option value="Member" className="bg-slate-950 text-blue-400">Member</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5" /> Operational
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 💡 NEW ELEMENT: Pending Invitations Tracking Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <MailQuestion className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold">Pending Outbound Invitations</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  <th className="p-4">Invited Email Target</th>
                  <th className="p-4">Link Expiration Threshold</th>
                  <th className="p-4">Delivery Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-sm">
                {pendingInvites.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-slate-500 italic">
                      No outstanding or unaccepted registration invitations found.
                    </td>
                  </tr>
                ) : (
                  pendingInvites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 text-slate-300 font-mono text-xs">{invite.email}</td>
                      <td className="p-4 text-slate-400 text-xs">
                        {new Date(invite.expiryDate).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                          Awaiting Registration
                        </span>
                      </td>
                      <td className="p-4 text-right">
                     <button
            onClick={() => handleRevokeInvite(invite.id, invite.email)}
            className="rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Revoke
          </button>
        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}