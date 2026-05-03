import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckSquare, Clock, AlertCircle, Users, Plus, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/projects'),
        api.get('/tasks/my-tasks')
      ]);
      setStats(statsRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', { name: newProjectName, description: newProjectDesc });
      setShowProjectModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (!stats) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1.5">Dashboard</h1>
          <p className="text-slate-400">Here's an overview of your projects and tasks.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2.5 font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-500/30" 
          onClick={() => setShowProjectModal(true)}
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden p-6 border border-white/10 bg-slate-800/70 backdrop-blur-md rounded-2xl flex flex-col">
          <span className="mb-2 text-sm font-medium text-slate-400">Total Tasks</span>
          <span className="text-4xl font-bold text-white">{stats.totalTasks}</span>
          <CheckSquare className="absolute text-blue-500/20 right-4 bottom-4" size={64} />
        </div>
        <div className="relative overflow-hidden p-6 border border-white/10 bg-slate-800/70 backdrop-blur-md rounded-2xl flex flex-col">
          <span className="mb-2 text-sm font-medium text-slate-400">In Progress</span>
          <span className="text-4xl font-bold text-white">
            {stats.tasksByStatus.find(t => t.status === 'In Progress')?.count || 0}
          </span>
          <Clock className="absolute text-emerald-500/20 right-4 bottom-4" size={64} />
        </div>
        <div className="relative overflow-hidden p-6 border border-white/10 bg-slate-800/70 backdrop-blur-md rounded-2xl flex flex-col">
          <span className="mb-2 text-sm font-medium text-slate-400">Overdue</span>
          <span className="text-4xl font-bold text-red-500">{stats.overdueTasks}</span>
          <AlertCircle className="absolute text-red-500/20 right-4 bottom-4" size={64} />
        </div>
        <div className="relative overflow-hidden p-6 border border-white/10 bg-slate-800/70 backdrop-blur-md rounded-2xl flex flex-col">
          <span className="mb-2 text-sm font-medium text-slate-400">My Projects</span>
          <span className="text-4xl font-bold text-white">{projects.length}</span>
          <Users className="absolute text-purple-500/20 right-4 bottom-4" size={64} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold text-white">Your Projects</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.length === 0 ? (
              <p className="p-4 text-slate-400 border border-dashed rounded-xl border-white/10">You don't have any projects yet.</p>
            ) : (
              projects.map(project => (
                <Link to={`/projects/${project.id || project._id}`} key={project.id || project._id} className="block p-5 transition-all border border-white/10 bg-slate-800/50 backdrop-blur-md rounded-xl hover:bg-slate-800/80 hover:border-white/20 group">
                  <h3 className="mb-2 text-lg font-bold text-white">{project.name}</h3>
                  <p className="mb-4 text-sm line-clamp-2 text-slate-400">{project.description || 'No description provided.'}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-white/5">{project.members.length} members</span>
                    <span className="flex items-center gap-1 text-blue-400 transition-transform group-hover:translate-x-1">
                      View <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">My Assigned Tasks</h2>
          <div className="flex flex-col gap-3">
            {tasks.length === 0 ? (
              <p className="p-4 text-slate-400 border border-dashed rounded-xl border-white/10">You don't have any tasks assigned to you.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id || task._id} className="p-4 border border-white/10 bg-slate-800/50 backdrop-blur-md rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-white">{task.title}</div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-medium ${
                      task.status === 'Done' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                      'bg-slate-700 text-slate-300 border border-slate-600'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Project: <span className="text-slate-300">{task.project.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border shadow-2xl bg-slate-900 border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button className="text-slate-400 hover:text-white transition-colors" onClick={() => setShowProjectModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Project Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea 
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white" 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-4 py-2 font-medium transition-colors border rounded-lg text-slate-300 border-white/10 hover:bg-white/5" onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-500">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
