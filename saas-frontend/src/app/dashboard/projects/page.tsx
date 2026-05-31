'use client';

import React, { useState, useEffect } from 'react';
import { FolderPlus, Layers, Calendar, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, CheckSquare, Square, UserPlus, Clock, PlusCircle, CheckCircle2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  tasks: Task[]; 
}

interface Task {
  id: number;
  title: string;
  status: string;
  projectId: number;
  assignedUserId?: number | null; 
  assignedUserName?: string;      
}

interface TeamMember {
  id: number;
  fullName: string;
}

interface LogEntry {
  id: number;
  userName: string;
  action: 'CREATED' | 'TOGGLED_STATUS' | 'ASSIGNED_USER' | 'DELETED';
  targetType: 'PROJECT' | 'TASK';
  targetName: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); 
  const [logs, setLogs] = useState<LogEntry[]>([]); 
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true); 

  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);

  const [userRole, setUserRole] = useState<string>('member');

  const fetchProjects = async () => {
    try {
      const currentTenantId = localStorage.getItem('tenantId') || '1';
      const response = await api.get('/Projects', {
        headers: { 'X-Tenant-Id': currentTenantId }
      });
      setProjects(response.data);
    } catch (err) {
      console.error("Failed to fetch tenant project infrastructure.", err);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const currentTenantId = localStorage.getItem('tenantId') || '1';
      const response = await api.get('/Users/tenant-team', {
        headers: { 'X-Tenant-Id': currentTenantId }
      });
      setTeamMembers(response.data);
    } catch (err) {
      console.error("Failed to fetch team options pool.", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const currentTenantId = localStorage.getItem('tenantId') || '1';
      const response = await api.get('/AuditLogs', {
        headers: { 'X-Tenant-Id': currentTenantId }
      });
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to sync audit infrastructure stream.", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
    fetchAuditLogs(); 
    
    const interval = setInterval(fetchAuditLogs, 15000);
    
    const savedRole = (localStorage.getItem('role') || 'member').toLowerCase().trim(); 
    setUserRole(savedRole);

    return () => clearInterval(interval);
  }, []);

  const toggleProjectExpansion = (projectId: number) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  const handleAddTask = async (e: React.FormEvent, projectId: number) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setTaskLoading(true);
    const currentTenantId = localStorage.getItem('tenantId') || '1';
    const currentUserName = localStorage.getItem('FullName') || 'Unknown User'; // ⚡ Dynamically fetch name

    try {
      const response = await api.post('/Tasks', 
        { title: newTaskTitle, projectId },
        { 
          headers: { 
            'X-Tenant-Id': currentTenantId, 
            'X-User-Role': userRole,
            'X-User-Name': currentUserName // ⚡ Header attached
          } 
        }
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, tasks: [...(p.tasks || []), { ...response.data, assignedUserName: 'Unassigned' }] }
            : p
        )
      );
      setNewTaskTitle('');
      fetchAuditLogs(); 
    } catch (err) {
      alert("Failed to commit new task milestone.");
    } finally {
      setTaskLoading(false);
    }
  };

  const handleToggleTaskStatus = async (projectId: number, taskId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    const currentTenantId = localStorage.getItem('tenantId') || '1';
    const currentUserName = localStorage.getItem('fullname') || 'Unknown User'; // ⚡ Dynamically fetch name

    try {
      await api.patch(`/Tasks/${taskId}/status`, 
        { status: newStatus },
        { 
          headers: { 
            'X-Tenant-Id': currentTenantId,
            'X-User-Name': currentUserName // ⚡ Header attached
          } 
        }
      );

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
              }
            : p
        )
      );
      fetchAuditLogs(); 
    } catch (err) {
      alert("Failed to patch operational milestone lane.");
    }
  };

  const handleAssignTaskUser = async (projectId: number, taskId: number, userId: number | null) => {
    const currentTenantId = localStorage.getItem('tenantId') || '1';
    const currentUserName = localStorage.getItem('FullName') || 'Unknown User'; // ⚡ Dynamically fetch name
    
    try {
      await api.patch(`/Tasks/${taskId}/assign`, 
        { assignedUserId: userId },
        { 
          headers: { 
            'X-Tenant-Id': currentTenantId,
            'X-User-Name': currentUserName // ⚡ Header attached
          } 
        }
      );

      const chosenUser = teamMembers.find(m => m.id === userId);
      const updatedName = chosenUser ? chosenUser.fullName : 'Unassigned';

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                tasks: p.tasks.map((t) => 
                  t.id === taskId ? { ...t, assignedUserId: userId, assignedUserName: updatedName } : t
                ),
              }
            : p
        )
      );
      fetchAuditLogs(); 
    } catch (err) {
      alert("Failed to update task identity routing parameter.");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const currentTenantId = localStorage.getItem('tenantId') || '1';
    const currentUserName = localStorage.getItem('FullName') || 'Unknown User'; // ⚡ Dynamically fetch name

    try {
      const response = await api.post('/Projects', 
        { name, description },
        { 
          headers: { 
            'X-Tenant-Id': currentTenantId, 
            'X-User-Role': userRole,
            'X-User-Name': currentUserName // ⚡ Header attached
          } 
        }
      );

      const completeNewProjectObject = { ...response.data, tasks: [] };

      setProjects((prev) => [completeNewProjectObject, ...prev]);
      setName('');
      setDescription('');
      setIsModalOpen(false);
      fetchAuditLogs(); 
    } catch (err) {
      alert("Failed to compile and commit new project node.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (projectId: number, newStatus: string) => {
    const currentTenantId = localStorage.getItem('tenantId') || '1';
    const currentUserName = localStorage.getItem('FullName') || 'Unknown User'; // ⚡ Dynamically fetch name
    
    try {
      await api.put(`/Projects/${projectId}`, 
        { status: newStatus },
        { 
          headers: { 
            'X-Tenant-Id': currentTenantId,
            'X-User-Name': currentUserName // ⚡ Header attached
          } 
        }
      );

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
      );
      fetchAuditLogs(); 
    } catch (err) {
      alert("Failed to patch project lifecycle status node.");
    }
  };

  const handleDeleteProject = async (projectId: number, projectName: string) => {
    const userConfirmed = window.confirm(
      `System Deletion Alert:\n\nAre you sure you want to permanently delete "${projectName}"?\nThis process cannot be undone.`
    );

    if (!userConfirmed) return;

    const currentTenantId = localStorage.getItem('tenantId') || '1';
    const currentUserName = localStorage.getItem('FullName') || 'Unknown User'; // ⚡ Dynamically fetch name
    
    try {
      await api.delete(`/Projects/${projectId}`, {
        headers: { 
          'X-Tenant-Id': currentTenantId, 
          'X-User-Role': userRole,
          'X-User-Name': currentUserName // ⚡ Header attached
        }
      });

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (expandedProjectId === projectId) setExpandedProjectId(null);
      fetchAuditLogs(); 
    } catch (err) {
      alert("Unauthorized access or database deletion block occurred.");
    }
  };

  const getStatusColorClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 focus:ring-emerald-500';
      case 'completed':
        return 'text-blue-400 border-blue-500/20 bg-blue-500/5 focus:ring-blue-500';
      default:
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5 focus:ring-amber-500';
    }
  };

  const getLogIconConfig = (action: LogEntry['action']) => {
    switch (action) {
      case 'CREATED':
        return { icon: <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />, bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'TOGGLED_STATUS':
        return { icon: <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />, bg: 'bg-indigo-500/10 border-indigo-500/20' };
      case 'ASSIGNED_USER':
        return { icon: <UserPlus className="h-3.5 w-3.5 text-purple-400" />, bg: 'bg-purple-500/10 border-purple-500/20' };
      case 'DELETED':
        return { icon: <Trash2 className="h-3.5 w-3.5 text-rose-400" />, bg: 'bg-rose-500/10 border-rose-500/20' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white font-sans antialiased">
      <div className="mx-auto max-w-5xl space-y-8">
        
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Command Center
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Layers className="h-8 w-8 text-indigo-400" /> Operational Projects
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage and track isolated operations belonging to this enterprise environment.</p>
          </div>
          
          {userRole === 'admin' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 self-start sm:self-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/10 transition-colors"
            >
              <Plus className="h-4 w-4" /> Initialize Project
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center space-y-4">
                <Layers className="h-12 w-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-300">No active environment data found</h3>
                <p className="text-sm text-slate-500">Initialize your first operational project module to begin logging tenant metrics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => {
                  const totalTasks = project.tasks?.length || 0;
                  const completedTasks = project.tasks?.filter((t) => t.status === 'Done').length || 0;
                  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                  return (
                    <div 
                      key={project.id} 
                      className={`group relative rounded-xl border bg-slate-900/30 backdrop-blur-sm transition-all flex flex-col justify-between p-6 shadow-xl space-y-4 ${
                        expandedProjectId === project.id ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleProjectExpansion(project.id)}>
                            <h2 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1">{project.name}</h2>
                            {expandedProjectId === project.id ? <ChevronUp className="h-4 w-4 text-indigo-400" /> : <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />}
                          </div>
                          
                          <select
                            value={project.status}
                            disabled={userRole !== 'admin'} 
                            onChange={(e) => handleUpdateStatus(project.id, e.target.value)}
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold border bg-slate-950 focus:outline-none focus:ring-1 transition-colors appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${getStatusColorClasses(project.status)}`}
                          >
                            <option value="Active" className="bg-slate-950 text-emerald-400 font-semibold">Active</option>
                            <option value="Completed" className="bg-slate-950 text-blue-400 font-semibold">Completed</option>
                            <option value="OnHold" className="bg-slate-950 text-amber-400 font-semibold">On Hold</option>
                          </select>
                        </div>
                        
                        <p className="text-sm text-slate-400 line-clamp-3">
                          {project.description || "No tactical description provided for this operational block."}
                        </p>
                      </div>

                      {totalTasks > 0 ? (
                        <div className="space-y-1.5 pt-2 border-t border-slate-900/40">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-400">Project Velocity</span>
                            <span className="text-indigo-400 font-bold">
                              {completedTasks}/{totalTasks} Tasks ({progressPercent}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-900">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 ease-out"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 text-[11px] text-slate-500 italic border-t border-slate-900/40">
                          No milestones configured yet. Expand view parameter fields to append targets.
                        </div>
                      )}

                      {expandedProjectId === project.id && (
                        <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" /> Operational Task Matrix
                          </h3>
                          
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                            {!project.tasks || project.tasks.length === 0 ? (
                              <p className="text-xs text-slate-500 italic py-2">No individual milestone action items assigned to this scope.</p>
                            ) : (
                              project.tasks.map((task) => (
                                <div 
                                  key={task.id} 
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-colors"
                                >
                                  <div 
                                    onClick={() => handleToggleTaskStatus(project.id, task.id, task.status)}
                                    className="flex items-center gap-3 cursor-pointer group/task flex-1"
                                  >
                                    {task.status === 'Done' ? (
                                      <CheckSquare className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                      <Square className="h-4 w-4 text-slate-600 group-hover/task:text-indigo-400 flex-shrink-0" />
                                    )}
                                    <span className={`text-xs font-mono transition-all ${task.status === 'Done' ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                      {task.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-md px-2 py-1">
                                    <UserPlus className="h-3 w-3 text-slate-500 flex-shrink-0" />
                                    <select
                                      value={task.assignedUserId || ""}
                                      disabled={userRole !== 'admin'}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        handleAssignTaskUser(project.id, task.id, val === "" ? null : Number(val));
                                      }}
                                      className="w-full bg-transparent text-[11px] text-slate-400 focus:outline-none cursor-pointer font-sans disabled:cursor-not-allowed"
                                      title={`Currently assigned to: ${task.assignedUserName}`}
                                    >
                                      <option value="" className="bg-slate-900 text-slate-400">Unassigned</option>
                                      {teamMembers.map((member) => (
                                        <option key={member.id} value={member.id} className="bg-slate-900 text-white">
                                          {member.fullName}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                </div>
                              ))
                            )}
                          </div>

                          {userRole === 'admin' ? (
                            <form onSubmit={(e) => handleAddTask(e, project.id)} className="space-y-2">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  New Milestone Specification
                                </label>
                                <textarea 
                                  rows={2}
                                  required
                                  value={newTaskTitle}
                                  onChange={(e) => setNewTaskTitle(e.target.value)}
                                  placeholder="Type architecture objective..."
                                  className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs focus:border-indigo-500 focus:outline-none text-white placeholder-slate-600 resize-y font-mono"
                                />
                              </div>
                              
                              <div className="flex justify-end">
                                <button 
                                  type="submit"
                                  disabled={taskLoading}
                                  className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-4 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                  {taskLoading ? 'Committing...' : 'Append Objective'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="rounded-lg bg-slate-950/60 border border-slate-900 p-3 text-center">
                              <p className="text-[11px] text-slate-500 italic">
                                🔒 Task alterations are restricted to workspace administrators.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-900/60">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Configured: {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteProject(project.id, project.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Purge Project Scope"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-900/20 backdrop-blur-md p-6 space-y-4 sticky top-8">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" /> Tenant Audit Trail
              </h3>
              <span className="inline-flex items-center rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-mono text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                Live Sync
              </span>
            </div>

            {logsLoading ? (
              <div className="space-y-3 animate-pulse py-2">
                <div className="h-10 w-full bg-slate-950/60 rounded border border-slate-900" />
                <div className="h-10 w-full bg-slate-950/60 rounded border border-slate-900" />
                <div className="h-10 w-full bg-slate-950/60 rounded border border-slate-900" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-600 italic py-4 text-center">No structural actions recorded on this tenant instance.</p>
            ) : (
              <div className="relative pl-4 border-l border-slate-900/60 space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {logs.map((log) => {
                  const uiConfig = getLogIconConfig(log.action);
                  return (
                    <div key={log.id} className="relative flex flex-col gap-1 text-xs">
                      <div className={`absolute -left-[24px] top-0 rounded-full p-0.5 border bg-slate-950 ${uiConfig?.bg}`}>
                        {uiConfig?.icon}
                      </div>

                      <div className="pl-2">
                        <p className="text-slate-300 leading-normal">
                          <span className="text-slate-100 font-semibold font-mono">{log.userName}</span>
                          {log.action === 'CREATED' && ' initialized '}
                          {log.action === 'TOGGLED_STATUS' && ' updated '}
                          {log.action === 'ASSIGNED_USER' && ' re-assigned '}
                          {log.action === 'DELETED' && ' deleted '}
                          <span className="text-indigo-400 font-medium">
                            {log.targetType.toLowerCase()} &ldquo;{log.targetName}&rdquo;
                          </span>
                        </p>
                        <span className="text-[10px] font-mono text-slate-600">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <FolderPlus className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold">Initialize New Project Node</h2>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Scope Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g., Q2 Security Ledger Audits" 
                    className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none text-white" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tactical Description</label>
                  <textarea 
                    rows={4}
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Outline the operational targets and boundaries..." 
                    className="block w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none text-white resize-none" 
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Committing...' : 'Confirm Deploy'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}