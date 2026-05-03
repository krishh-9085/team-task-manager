import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, UserPlus, ArrowLeft, Trash2 } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assigneeId: ''
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // Member form state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) navigate('/dashboard');
    }
  };

  const isAdmin = project?.members.some(m => (m.user.id === currentUser?.id || m.user._id === currentUser?.id) && m.role === 'Admin');

  // Member Management
  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProject();
    } catch (error) {
      setMemberError(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  // Task Management
  const handleOpenTaskModal = (task = null) => {
    if (task) {
      setEditingTaskId(task.id || task._id);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assigneeId: task.assignee?.id || task.assignee?._id || task.assignee || ''
      });
    } else {
      setEditingTaskId(null);
      setTaskForm({
        title: '', description: '', status: 'To Do', priority: 'Medium', dueDate: '', assigneeId: ''
      });
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, taskForm);
      } else {
        await api.post('/tasks', { ...taskForm, projectId: id });
      }
      setShowTaskModal(false);
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (!project) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  const tasksByStatus = {
    'To Do': project.tasks.filter(t => t.status === 'To Do'),
    'In Progress': project.tasks.filter(t => t.status === 'In Progress'),
    'Done': project.tasks.filter(t => t.status === 'Done')
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 px-4 py-2 mb-8 font-medium transition-colors border rounded-lg text-slate-300 border-white/10 hover:bg-white/5"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1.5">{project.name}</h1>
          <p className="text-slate-400">{project.description}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <>
              <button 
                className="flex items-center gap-2 px-4 py-2 font-medium transition-colors border rounded-lg text-slate-300 border-white/10 hover:bg-white/5" 
                onClick={() => setShowMemberModal(true)}
              >
                <UserPlus size={18} /> Add Member
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-500/30" 
                onClick={() => handleOpenTaskModal()}
              >
                <Plus size={18} /> New Task
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {project.members.map(m => {
          const mId = m.user.id || m.user._id;
          return (
          <div key={mId} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-full bg-white/5 border-white/10 text-slate-300">
            {m.user.name} <span className="opacity-50">({m.role})</span>
            {isAdmin && mId !== currentUser.id && (
              <button onClick={() => handleRemoveMember(mId)} className="ml-1 transition-colors text-red-400 hover:text-red-300">✕</button>
            )}
          </div>
        )})}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {['To Do', 'In Progress', 'Done'].map(status => (
          <div key={status} className="flex flex-col p-4 border border-white/10 bg-slate-800/40 rounded-2xl">
            <h3 className={`flex items-center justify-between mb-4 font-semibold ${status === 'To Do' ? 'text-slate-400' : status === 'In Progress' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {status}
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-black/30 text-white/70">{tasksByStatus[status].length}</span>
            </h3>
            <div className="flex flex-col gap-3">
              {tasksByStatus[status].map(task => {
                const taskId = task.id || task._id;
                const assigneeId = task.assignee?.id || task.assignee?._id || task.assignee;
                const isAssignee = assigneeId === currentUser?.id;
                const canEdit = isAdmin || isAssignee;
                
                return (
                  <div key={taskId} className="p-4 transition-all border border-white/5 shadow-lg bg-slate-800/90 rounded-xl hover:border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-white">{task.title}</div>
                      {isAdmin && (
                        <div className="flex gap-2 ml-3">
                          <button onClick={() => handleOpenTaskModal(task)} className="transition-colors text-slate-400 hover:text-slate-200">✎</button>
                          <button onClick={() => handleDeleteTask(taskId)} className="transition-colors text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                    {task.description && <p className="mb-4 text-sm text-slate-400 line-clamp-3">{task.description}</p>}
                    
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className={`px-2 py-1 rounded-md font-medium ${
                        task.priority === 'High' ? 'bg-red-500/20 text-red-400' : 
                        task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-slate-400">{task.assignee?.name || 'Unassigned'}</span>
                    </div>

                    {canEdit && (
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(taskId, e.target.value)}
                        className="w-full px-2 py-1.5 mt-4 text-sm border rounded-lg bg-slate-900/50 border-white/10 text-slate-300 focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border shadow-2xl bg-slate-900 border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Team Member</h2>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            {memberError && <div className="p-3 mb-4 text-sm text-center text-red-200 bg-red-500/20 border border-red-500/50 rounded-lg">{memberError}</div>}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">User Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" 
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-4 py-2 font-medium transition-colors border rounded-lg text-slate-300 border-white/10 hover:bg-white/5" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 border shadow-2xl bg-slate-900 border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingTaskId ? 'Edit Task' : 'New Task'}</h2>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Task Title</label>
                <input type="text" className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows="3"></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col flex-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Status</label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="flex flex-col flex-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Priority</label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col flex-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Due Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>
                <div className="flex flex-col flex-1 gap-1.5">
                  <label className="text-sm font-medium text-slate-300">Assignee</label>
                  <select className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" value={taskForm.assigneeId} onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => {
                      const mId = m.user.id || m.user._id;
                      return (
                      <option key={mId} value={mId}>{m.user.name}</option>
                    )})}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-4 py-2 font-medium transition-colors border rounded-lg text-slate-300 border-white/10 hover:bg-white/5" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
