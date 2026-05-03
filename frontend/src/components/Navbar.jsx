import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Briefcase } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
        <Briefcase size={24} className="text-indigo-500" />
        TaskFlow
      </div>
      <div className="flex items-center gap-4">
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${location.pathname === '/dashboard' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <span className="text-slate-600">|</span>
        <span className="font-semibold text-slate-200">{user.name}</span>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-lg border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
