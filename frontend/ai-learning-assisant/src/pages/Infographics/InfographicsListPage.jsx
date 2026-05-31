import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/apiService';
import {
  BarChart2,
  Sparkles,
  ChevronRight,
  Loader2,
  Trash2,
  FileText,
  Clock,
  Lightbulb
} from 'lucide-react';

const ACCENT_PALETTES = [
  { bg: 'bg-[#ffeff2]', text: 'text-[#ed7e99]', dot: 'bg-[#ed7e99]', border: 'border-[#ffd6e7]' },
  { bg: 'bg-violet-50',  text: 'text-violet-500', dot: 'bg-violet-400', border: 'border-violet-100' },
  { bg: 'bg-emerald-50', text: 'text-emerald-500', dot: 'bg-emerald-400', border: 'border-emerald-100' },
  { bg: 'bg-amber-50',   text: 'text-amber-500',   dot: 'bg-amber-400',   border: 'border-amber-100'   },
];

const InfographicsListPage = () => {
  const navigate = useNavigate();
  const [infographics, setInfographics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchInfographics();
  }, []);

  const fetchInfographics = async () => {
    try {
      const res = await api.get('/infographics');
      setInfographics(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch infographics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    try {
      await api.delete(`/infographics/${id}`);
      setInfographics((prev) => prev.filter((info) => info._id !== id));
    } catch (err) {
      console.error('Failed to delete infographic:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10 mb-4" />
        <p className="text-zinc-400 font-semibold text-sm">Loading Infographics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">
            Visual <span className="text-[#ed7e99]">Infographics</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm font-medium">
            AI-generated visual knowledge maps from your documents
          </p>
        </div>
        <Link
          to="/documents"
          className="flex items-center space-x-2 bg-[#ed7e99] hover:bg-[#eb6d8a] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md shadow-[#ed7e99]/20 transition-all active:scale-95"
        >
          <Sparkles size={16} />
          <span>Generate from Doc</span>
        </Link>
      </div>

      {infographics.length === 0 ? (
        /* Empty State */
        <div className="card-standard p-16 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-[#ffeff2] rounded-2xl flex items-center justify-center">
            <BarChart2 className="text-[#ed7e99]" size={36} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-800">No Infographics Yet</h2>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              Open any document and generate a stunning AI visual infographic to see it appear here.
            </p>
          </div>
          <Link
            to="/documents"
            className="bg-[#ed7e99] hover:bg-[#eb6d8a] text-white font-bold px-8 py-3 rounded-xl text-sm shadow-md shadow-[#ed7e99]/20 transition-all active:scale-95 flex items-center space-x-2"
          >
            <FileText size={16} />
            <span>Go to Documents</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {infographics.map((info, idx) => {
            const palette = ACCENT_PALETTES[idx % ACCENT_PALETTES.length];
            return (
              <div
                key={info._id}
                onClick={() => navigate(`/infographics/${info._id}`)}
                className={`card-standard p-6 cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-200 border ${palette.border} relative overflow-hidden`}
              >
                {/* Accent blob */}
                <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${palette.bg} opacity-50 blur-xl pointer-events-none`} />

                {/* Icon + Delete */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${palette.bg} rounded-xl flex items-center justify-center ${palette.text}`}>
                    <BarChart2 size={20} />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, info._id)}
                    disabled={deletingId === info._id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-red-500 p-1 rounded-lg"
                    title="Delete Infographic"
                  >
                    {deletingId === info._id
                      ? <Loader2 size={16} className="animate-spin" />
                      : <Trash2 size={16} />}
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-zinc-800 leading-tight mb-1 line-clamp-2">
                  {info.title}
                </h3>
                <p className="text-xs text-zinc-400 font-medium mb-4 line-clamp-1">{info.subtitle}</p>

                {/* Stats row */}
                <div className="flex items-center space-x-3 mb-4">
                  {[
                    { count: info.metrics?.length, label: 'Metrics' },
                    { count: info.concepts?.length, label: 'Concepts' },
                    { count: info.timeline?.length, label: 'Steps' },
                  ].map((stat) => (
                    <div key={stat.label} className={`flex items-center space-x-1.5 text-xs font-bold ${palette.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${palette.dot}`} />
                      <span>{stat.count} {stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Document + Date */}
                <div className="pt-4 border-t border-[#f3eae0] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-zinc-400 text-xs font-medium overflow-hidden">
                    <FileText size={12} />
                    <span className="truncate">{info.documentId?.title || 'Document'}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-zinc-300 text-xs font-medium shrink-0 ml-2">
                    <Clock size={11} />
                    <span>{formatDate(info.createdAt)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute bottom-6 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={18} className={palette.text} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {infographics.length > 0 && (
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center space-x-2 text-zinc-400 text-xs font-medium">
            <Lightbulb size={14} className="text-[#ed7e99]" />
            <span>{infographics.length} infographic{infographics.length !== 1 ? 's' : ''} generated — click any card to view the full visual</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfographicsListPage;
