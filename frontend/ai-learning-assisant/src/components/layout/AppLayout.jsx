import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Menu,
  X
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Automatically close sidebar when navigation path changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/documents', icon: Files, label: 'Documents' },
    { path: '/flashcards', icon: BrainCircuit, label: 'Flashcards' },
    { path: '/infographics', icon: BarChart2, label: 'Infographics' },
    { path: '/profile', icon: UserCircle, label: 'Profile' }
  ];

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      {/* Backdrop overlay for mobile screens */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Collapsible drawer on mobile, static on desktop */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-[#f3eae0] flex flex-col bg-white/95 md:bg-white/80 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#ed7e99] to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-[#ed7e99]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="text-white w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-800">
              Aura<span className="text-[#ed7e99]">Learn</span>
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors md:hidden focus:outline-none"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
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
        <header className="h-20 border-b border-[#f3eae0] bg-white/60 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center space-x-3 flex-grow md:flex-grow-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/50 rounded-xl md:hidden transition-colors focus:outline-none"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <div className="relative w-full max-w-[200px] sm:max-w-xs md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#ed7e99] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#ed7e99]/50 focus:ring-1 focus:ring-[#ed7e99]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <button className="text-zinc-400 hover:text-zinc-700 transition-colors relative">
              <Bell size={20} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#ed7e99] border-2 border-white rounded-full"></div>
            </button>
            
            <div className="flex items-center space-x-2 md:space-x-3 pl-3 md:pl-6 border-l border-[#f3eae0]">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-zinc-800">{user?.username || 'Alex'}</p>
                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-widest">{user?.email || 'Student'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ffd6e7] to-[#ed7e99] p-[2px] flex-shrink-0">
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
        <div className="flex-grow overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#f3eae0] scrollbar-track-transparent">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
