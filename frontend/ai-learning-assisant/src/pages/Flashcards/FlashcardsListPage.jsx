import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/apiService';
import { BrainCircuit, ChevronRight, Loader2 } from 'lucide-react';

const PALETTES = [
  {
    text: 'text-[#ed7e99]',
    bg: 'bg-[#ffeff2]',
    border: 'hover:border-[#ed7e99]/50',
    hoverText: 'group-hover:text-[#ed7e99]',
    pill: 'bg-[#fffdfb] text-[#ed7e99] border-[#f3eae0]',
  },
  {
    text: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'hover:border-violet-300',
    hoverText: 'group-hover:text-violet-600',
    pill: 'bg-[#fffdfb] text-violet-500 border-violet-100',
  },
  {
    text: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'hover:border-emerald-300',
    hoverText: 'group-hover:text-emerald-600',
    pill: 'bg-[#fffdfb] text-emerald-500 border-emerald-100',
  },
  {
    text: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'hover:border-amber-300',
    hoverText: 'group-hover:text-amber-600',
    pill: 'bg-[#fffdfb] text-amber-500 border-amber-100',
  }
];

const FlashcardsListPage = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await api.get('/flashcards');
        setSets(res.data.data);
      } catch (err) {
        console.error('Failed to fetch flashcard sets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">Your Flashcard Collections</h1>
      </div>

      {sets.length === 0 ? (
        <div className="py-20 text-center bg-white/70 rounded-2xl border border-dashed border-[#f3eae0] shadow-sm">
          <BrainCircuit className="w-14 h-14 text-zinc-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-zinc-700">No flashcards yet</h2>
          <p className="text-zinc-450 mt-1 mb-6 text-sm max-w-xs mx-auto">Upload a document and let our AI engine automatically extract flashcard sets.</p>
          <Link to="/documents" className="bg-[#ed7e99] hover:bg-[#eb6d8a] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#ed7e99]/20 text-sm">
            Go to Documents
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set, idx) => {
            const palette = PALETTES[idx % PALETTES.length];
            return (
              <Link 
                key={set._id} 
                to={`/documents/${set.documentId?._id}/flashcards`}
                className={`card-standard p-6 transition-all group flex flex-col h-full ${palette.border}`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${palette.bg}`}>
                     <BrainCircuit className={`w-5 h-5 ${palette.text}`} />
                  </div>
                  <div className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${palette.pill}`}>
                    {set.cards.length} Cards
                  </div>
                </div>
                
                <h3 className={`text-lg font-bold text-zinc-855 mb-1 transition-colors line-clamp-1 ${palette.hoverText}`}>{set.documentId?.title || 'Collection'}</h3>
                <p className="text-sm text-zinc-400 mb-5 flex-grow line-clamp-2">Reinforce your memory with this AI-curated Q&A set.</p>
                
                <div className={`flex items-center text-xs font-bold pt-3.5 border-t border-[#f3eae0] ${palette.text}`}>
                  Practice Collection
                  <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashcardsListPage;
