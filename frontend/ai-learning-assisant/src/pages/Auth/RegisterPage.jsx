import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrainCircuit, Mail, Lock, User, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try a different email.');
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
          <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">Create Account</h1>
          <p className="text-zinc-405 mt-1.5 font-semibold text-sm">Join us and start learning smarter</p>
        </div>

        <div className="card-standard p-6 bg-white border border-[#f3eae0] rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 text-xs font-bold p-3.5 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#ed7e99] transition-colors" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2.5 pl-11 pr-4 text-zinc-800 focus:outline-none focus:border-[#ed7e99]/50 focus:ring-1 focus:ring-[#ed7e99]/20 transition-all text-sm placeholder:text-zinc-400 font-medium"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2.5 px-4 text-zinc-800 focus:outline-none focus:border-[#ed7e99]/50 transition-all text-sm placeholder:text-zinc-400 font-medium"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Confirm</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2.5 px-4 text-zinc-800 focus:outline-none focus:border-[#ed7e99]/50 transition-all text-sm placeholder:text-zinc-400 font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#ed7e99] hover:bg-[#eb6d8a] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#ed7e99]/20 transition-all flex items-center justify-center space-x-1.5 group active:scale-[0.98] mt-3 text-sm"
            >
              <span>{isSubmitting ? 'Creating account...' : 'Sign up'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ed7e99] hover:text-[#eb6d8a] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
