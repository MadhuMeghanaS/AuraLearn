import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-transparent">
      {/* Decorative Warm Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ffeff2]/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#ffd6e7]/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#ed7e99] rounded-2xl flex items-center justify-center shadow-md shadow-[#ed7e99]/20 mb-5">
            <BrainCircuit className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">Welcome back</h1>
          <p className="text-zinc-405 mt-1.5 font-semibold text-sm">Sign in to continue your journey</p>
        </div>

        <div className="card-standard p-6 bg-white border border-[#f3eae0] rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 text-xs font-bold p-3.5 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#ed7e99] transition-colors" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2.5 pl-11 pr-4 text-zinc-800 focus:outline-none focus:border-[#ed7e99]/50 focus:ring-1 focus:ring-[#ed7e99]/20 transition-all text-sm placeholder:text-zinc-400 font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 ml-1">
                 <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                 <Link to="#" className="text-xs font-bold text-[#ed7e99] hover:text-[#eb6d8a] transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#ed7e99] transition-colors" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2.5 pl-11 pr-4 text-zinc-800 focus:outline-none focus:border-[#ed7e99]/50 focus:ring-1 focus:ring-[#ed7e99]/20 transition-all text-sm placeholder:text-zinc-400 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ed7e99] hover:bg-[#eb6d8a] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#ed7e99]/20 transition-all flex items-center justify-center space-x-1.5 group active:scale-[0.98] mt-2 text-sm"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#ed7e99] hover:text-[#eb6d8a] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
