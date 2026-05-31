import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/apiService';
import { ArrowLeft, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const FlashcardPage = () => {
  const { id } = useParams(); // documentId
  const navigate = useNavigate();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await api.get(`/flashcards/${id}`);
        setFlashcardSets(res.data.data);
      } catch (err) {
        console.error('Failed to fetch flashcards', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [id]);

  const currentSet = flashcardSets[currentSetIndex];
  const currentCard = currentSet?.cards[currentCardIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex < currentSet.cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      }
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex > 0) {
        setCurrentCardIndex(currentCardIndex - 1);
      }
    }, 150);
  };

  const handleToggleStar = async () => {
    try {
      await api.put(`/flashcards/${currentCard._id}/star`);
      // Update local state
      const updatedSets = [...flashcardSets];
      updatedSets[currentSetIndex].cards[currentCardIndex].isStarred = !currentCard.isStarred;
      setFlashcardSets(updatedSets);
    } catch (err) {
      console.error('Failed to toggle star', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10 mb-4" />
        <p className="text-zinc-400 font-semibold text-sm font-sans">Compiling card decks...</p>
      </div>
    );
  }

  if (flashcardSets.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-[#f3eae0] rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-zinc-800 mb-4">No flashcards found</h2>
        <Link to={`/documents/${id}`} className="text-[#ed7e99] hover:underline font-bold text-sm">Back to Document</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <Link to={`/documents/${id}`} className="p-2 hover:bg-[#ffeff2] rounded-full transition-colors text-zinc-400 hover:text-[#ed7e99]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 truncate max-w-[200px] sm:max-w-md">{currentSet.documentId.title}</h1>
            <p className="text-xs text-zinc-400 font-semibold">Deck {currentSetIndex + 1} of {flashcardSets.length}</p>
          </div>
        </div>
        <div className="text-xs bg-[#fffdfb] px-3.5 py-1.5 rounded-xl text-zinc-500 font-bold border border-[#f3eae0]">
          {currentCardIndex + 1} / {currentSet.cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#f3eae0] h-1 rounded-full overflow-hidden">
        <div 
          className="bg-[#ed7e99] h-full transition-all duration-300"
          style={{ width: `${((currentCardIndex + 1) / currentSet.cards.length) * 100}%` }}
        ></div>
      </div>

      {/* Flashcard Container */}
      <div 
        className="perspective-1000 h-[380px] w-full cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front Side */}
          <div className="absolute w-full h-full backface-hidden bg-white border border-[#f3eae0] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(224,204,188,0.15)] group-hover:border-[#ed7e99]/40 transition-colors">
            <span className="absolute top-6 left-8 text-[10px] font-bold text-[#ed7e99] uppercase tracking-widest bg-[#ffeff2] px-2.5 py-1 rounded-lg">Question</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleToggleStar(); }}
              className={`absolute top-6 right-8 p-1 transition-colors ${currentCard.isStarred ? 'text-amber-400 hover:text-amber-500' : 'text-zinc-300 hover:text-[#ed7e99]'}`}
            >
              <Star size={20} fill={currentCard.isStarred ? 'currentColor' : 'none'} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 leading-snug px-4">
              {currentCard.question}
            </h2>
            <p className="absolute bottom-6 text-zinc-400 text-xs font-semibold tracking-wider uppercase animate-pulse">Tap to reveal answer</p>
          </div>

          {/* Back Side */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#ed7e99] rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(237,126,153,0.25)]">
            <span className="absolute top-6 left-8 text-[10px] font-bold text-white/80 uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-lg">Answer</span>
            <div className="max-h-full overflow-y-auto px-4">
               <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                 {currentCard.answer}
               </p>
            </div>
            <p className="absolute bottom-6 text-white/70 text-xs font-semibold tracking-wider uppercase animate-pulse">Tap to see question</p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button 
          onClick={handlePrev}
          disabled={currentCardIndex === 0}
          className="p-3 bg-white border border-[#f3eae0] rounded-xl text-zinc-650 hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex space-x-2">
          {flashcardSets.length > 1 && (
             <select 
              value={currentSetIndex}
              onChange={(e) => { setCurrentSetIndex(parseInt(e.target.value)); setCurrentCardIndex(0); setIsFlipped(false); }}
              className="bg-[#fffdfb] border border-[#f3eae0] text-zinc-600 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#ed7e99]/50 transition-all font-semibold shadow-sm cursor-pointer"
             >
               {flashcardSets.map((_, idx) => <option key={idx} value={idx}>Decks {idx + 1}</option>)}
             </select>
          )}
        </div>

        <button 
          onClick={handleNext}
          disabled={currentCardIndex === currentSet.cards.length - 1}
          className="p-3 bg-[#ed7e99] rounded-xl text-white hover:bg-[#eb6d8a] shadow-md shadow-[#ed7e99]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="text-center pt-4">
        <p className="text-zinc-400 text-xs font-medium italic">Active Decks generated using advanced Gemini learning templates.</p>
      </div>
    </div>
  );
};

export default FlashcardPage;
