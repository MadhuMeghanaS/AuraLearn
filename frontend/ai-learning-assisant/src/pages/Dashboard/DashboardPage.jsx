import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/apiService';
import { Files, BrainCircuit, Trophy, ArrowRight, Clock } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ documents: 0, flashcards: 0, quizzes: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/documents');
        const docs = res.data.data;
        setRecentDocs(docs.slice(0, 4));
        
        const flashcardCount = docs.reduce((acc, doc) => acc + (doc.flashcardCount || 0), 0);
        const quizCount = docs.reduce((acc, doc) => acc + (doc.quizCount || 0), 0);
        
        setStats({
          documents: docs.length,
          flashcards: flashcardCount,
          quizzes: quizCount
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#ed7e99]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 mt-1 font-semibold text-sm">Track your learning progress and activity</p>
      </div>

      {/* Stats Grid - Pastel gradients matches screenshots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Documents" 
          value={stats.documents} 
          icon={Files}
          color="text-[#ed7e99] bg-[#ffeff2]"
        />
        <StatCard 
          title="Total Flashcards" 
          value={stats.flashcards} 
          icon={BrainCircuit}
          color="text-violet-500 bg-violet-50"
        />
        <StatCard 
          title="Total Quizzes" 
          value={stats.quizzes} 
          icon={Trophy}
          color="text-amber-500 bg-amber-50"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="card-standard p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
             <div className="p-2.5 bg-[#ffeff2] rounded-xl">
                <Clock className="text-[#ed7e99]" size={18} />
             </div>
             <h2 className="text-lg font-bold text-zinc-800">Recent Activity</h2>
          </div>
          <Link to="/documents" className="text-[#ed7e99] hover:text-[#eb6d8a] text-sm font-bold flex items-center group">
            View All <ArrowRight size={15} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="space-y-3.5">
          {recentDocs.length > 0 ? (
            recentDocs.map(doc => (
              <Link 
                key={doc._id} 
                to={`/documents/${doc._id}`} 
                className="flex items-center p-3.5 bg-[#fffdfb] hover:bg-[#fffcf9] rounded-xl border border-[#f3eae0] transition-all group"
              >
                <div className="w-10 h-10 bg-[#ffeff2] rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform">
                  <Files className="w-5 h-5 text-[#ed7e99]" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-zinc-700 group-hover:text-[#ed7e99] transition-colors">{doc.title}</h3>
                  <div className="flex items-center mt-0.5 space-x-3">
                    <p className="text-xs text-zinc-400 font-medium">
                      {new Date(doc.uploadDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                    <p className="text-xs text-zinc-400 font-medium">{doc.flashcardCount || 0} Flashcards</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 border border-[#f3eae0] hover:border-transparent rounded-lg text-xs font-bold text-zinc-500 group-hover:bg-[#ed7e99] group-hover:text-white transition-all">
                  Open
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 bg-white/70 rounded-2xl border border-dashed border-[#f3eae0] shadow-sm">
              <p className="text-zinc-400 font-bold text-sm">No activity yet. Let's start learning!</p>
              <Link to="/documents" className="mt-4 inline-block bg-[#ed7e99] hover:bg-[#eb6d8a] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#ed7e99]/10 text-sm">
                Upload First Material
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card-standard p-5 group hover:translate-y-[-2px] transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1.5">{title}</p>
        <p className="text-3xl font-extrabold text-zinc-800">{value}</p>
      </div>
      <div className={`p-3.5 rounded-xl ${color}`}>
        <Icon size={26} />
      </div>
    </div>
  </div>
);

export default DashboardPage;
