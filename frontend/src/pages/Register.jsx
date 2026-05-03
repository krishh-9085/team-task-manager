import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ id: res.data.id, name: res.data.name, email: res.data.email }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-md p-8 border border-white/10 shadow-2xl bg-slate-800/70 backdrop-blur-xl rounded-2xl">
        <h1 className="mb-2 text-3xl font-bold text-center text-white">Create Account</h1>
        <p className="mb-6 text-center text-slate-400">Join TaskFlow and collaborate with your team</p>
        
        {error && <div className="p-3 mb-6 text-sm text-center text-red-200 bg-red-500/20 border border-red-500/50 rounded-lg">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="w-full py-3 mt-4 font-semibold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-500/30">
            Sign Up
          </button>
        </form>
        
        <div className="mt-6 text-sm text-center text-slate-400">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
