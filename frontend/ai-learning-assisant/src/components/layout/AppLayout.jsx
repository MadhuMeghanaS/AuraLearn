import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Files, 
  BrainCircuit, 
  UserCircle, 
  LogOut, 
  Search,
  Bell,
  BarChart2,
  Sparkles
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/documents', icon: Files, label: 'Documents' },
    { path: '/flashcards', icon: BrainCircuit, label: 'Flashcards' },
    { path: '/infographics', icon: BarChart2, label: 'Infographics' },
    { path: '/profile', icon: UserCircle, label: 'Profile' }
  ];

  return (
    <div className="flex h-screen bg-transparent">
      {/* Sidebar - Structured like screenshots */}
      <aside className="w-64 border-r border-[#f3eae0] flex flex-col bg-white/80 backdrop-blur-md z-20">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#ed7e99] to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-[#ed7e99]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="text-white w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-800">
              Aura<span className="text-[#ed7e99]">Learn</span>
            </span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-1.5 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname.startsWith(item.path)
                  ? 'bg-[#ffeff2] text-[#ed7e99]'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
              }`}
            >
              <item.icon size={20} className={location.pathname.startsWith(item.path) ? 'text-[#ed7e99]' : 'group-hover:text-zinc-800'} />
              <span className="font-bold text-sm">{item.label}</span>
              {location.pathname.startsWith(item.path) && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ed7e99]" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#f3eae0] mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Header - Structured like screenshots */}
        <header className="h-20 border-b border-[#f3eae0] bg-white/60 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="relative w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#ed7e99] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#ed7e99]/50 focus:ring-1 focus:ring-[#ed7e99]/20 transition-all"
            />
          </div>

          <div className="flex items-center space-x-6">
            <button className="text-zinc-400 hover:text-zinc-700 transition-colors relative">
              <Bell size={20} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#ed7e99] border-2 border-white rounded-full"></div>
            </button>
            
            <div className="flex items-center space-x-3 pl-6 border-l border-[#f3eae0]">
              <div className="text-right">
                <p className="text-sm font-bold text-zinc-800">{user?.username || 'Alex'}</p>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest">{user?.email || 'Student'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffd6e7] to-[#ed7e99] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#fffcf9] flex items-center justify-center border border-black/5 overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Alex'}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-[#f3eae0] scrollbar-track-transparent">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
