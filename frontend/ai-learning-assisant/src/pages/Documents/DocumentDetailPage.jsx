import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/apiService';
import { 
  FileText, 
  MessageSquare, 
  Sparkles, 
  BrainCircuit, 
  Trophy, 
  ArrowLeft,
  Send,
  Loader2,
  BarChart2
} from 'lucide-react';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');
  
  // Full Chat Integration States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef(null);

  // Concept Explanation States
  const [conceptInput, setConceptInput] = useState('');
  const [conceptExplanation, setConceptExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  // Flashcard Generation States
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [existingFlashcards, setExistingFlashcards] = useState(null);
  const [flashcardsChecked, setFlashcardsChecked] = useState(false);

  // Quiz Generation States
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [existingQuizzes, setExistingQuizzes] = useState(null);
  const [quizzesChecked, setQuizzesChecked] = useState(false);

  // Infographic Generation States
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
  const [existingInfographic, setExistingInfographic] = useState(null);
  const [infographicChecked, setInfographicChecked] = useState(false);

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'actions', label: 'AI Tools', icon: Sparkles },
    { id: 'flashcards', label: 'Flashcards', icon: BrainCircuit },
    { id: 'quizzes', label: 'Quizzes', icon: Trophy },
    { id: 'infographics', label: 'Infographics', icon: BarChart2 }
  ];

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        setDocument(res.data.data);
      } catch (err) {
        console.error('Failed to fetch document', err);
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id, navigate]);

  // Load chat history when switching to chat tab
  useEffect(() => {
    if (activeTab === 'chat' && id) {
      const fetchChatHistory = async () => {
        try {
          const res = await api.get(`/ai/chat-history/${id}`);
          setChatMessages(res.data.data || []);
        } catch (err) {
          console.error('Failed to fetch chat history', err);
        }
      };
      fetchChatHistory();
    }
  }, [activeTab, id]);

  // Check for existing flashcards when switching to flashcards tab
  useEffect(() => {
    if (activeTab === 'flashcards' && id && !flashcardsChecked) {
      const checkFlashcards = async () => {
        try {
          const res = await api.get(`/flashcards/${id}`);
          setExistingFlashcards(res.data.data || []);
        } catch (err) {
          console.error('Failed to check flashcards', err);
          setExistingFlashcards([]);
        } finally {
          setFlashcardsChecked(true);
        }
      };
      checkFlashcards();
    }
  }, [activeTab, id, flashcardsChecked]);

  // Check for existing quizzes when switching to quizzes tab
  useEffect(() => {
    if (activeTab === 'quizzes' && id && !quizzesChecked) {
      const checkQuizzes = async () => {
        try {
          const res = await api.get(`/quizzes/${id}`);
          setExistingQuizzes(res.data.data || []);
        } catch (err) {
          console.error('Failed to check quizzes', err);
          setExistingQuizzes([]);
        } finally {
          setQuizzesChecked(true);
        }
      };
      checkQuizzes();
    }
  }, [activeTab, id, quizzesChecked]);

  // Check for existing infographic when switching to actions tab
  useEffect(() => {
    if (activeTab === 'infographics' && id && !infographicChecked) {
      const checkInfographic = async () => {
        try {
          const res = await api.get(`/infographics/document/${id}`);
          setExistingInfographic(res.data.data);
        } catch {
          setExistingInfographic(null);
        } finally {
          setInfographicChecked(true);
        }
      };
      checkInfographic();
    }
  }, [activeTab, id, infographicChecked]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isSendingChat]);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate-summary', { documentId: id });
      setSummary(res.data.data.summary);
    } catch (err) {
      console.error('Failed to generate summary', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const currentInput = chatInput;
    setChatInput('');
    
    const userMsg = { role: 'user', content: currentInput, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      const res = await api.post('/ai/chat', { documentId: id, question: currentInput });
      const assistantMsg = { 
        role: 'assistant', 
        content: res.data.data.answer, 
        timestamp: new Date() 
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to send chat message', err);
      setChatMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: 'I encountered an error trying to process that question. Please try again.', timestamp: new Date() }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleExplainConcept = async () => {
    if (!conceptInput.trim() || isExplaining) return;
    setIsExplaining(true);
    setConceptExplanation('');
    try {
      const res = await api.post('/ai/explain-concept', { documentId: id, concept: conceptInput });
      setConceptExplanation(res.data.data.explanation);
    } catch (err) {
      console.error('Failed to explain concept', err);
      setConceptExplanation('Sorry, I failed to generate an explanation for this concept. Please check that it is mentioned in the document and try again.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setIsGeneratingFlashcards(true);
    try {
      await api.post('/ai/generate-flashcards', { documentId: id, count: 10 });
      navigate(`/documents/${id}/flashcards`);
    } catch (err) {
      console.error('Failed to generate flashcards', err);
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const res = await api.post('/ai/generate-quiz', { documentId: id, numQuestions: 5, title: `${document.title} - Quiz` });
      const quizId = res.data.data._id;
      navigate(`/quizzes/${quizId}`);
    } catch (err) {
      console.error('Failed to generate quiz', err);
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateInfographic = async () => {
    setIsGeneratingInfographic(true);
    try {
      const res = await api.post('/infographics/generate', { documentId: id });
      navigate(`/infographics/${res.data.data._id}`);
    } catch (err) {
      console.error('Failed to generate infographic', err);
      setIsGeneratingInfographic(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10 mb-4" />
        <p className="text-zinc-400 font-semibold text-sm">Opening Study Materials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
        <Link to="/documents" className="flex items-center hover:text-[#ed7e99] transition-colors">
          <ArrowLeft size={14} className="mr-2" /> Back to Documents
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">{document.title}</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-[#f3eae0] pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-5 py-3.5 text-sm font-bold transition-all relative ${
              activeTab === tab.id 
                ? 'text-[#ed7e99]' 
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ed7e99]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="mt-6">
        {activeTab === 'content' && (
           <div className="card-standard min-h-[500px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#f3eae0] bg-[#fffdfb] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Document Viewer</span>
                <a 
                  href={document.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ed7e99] text-xs font-bold hover:underline underline-offset-4"
                >
                  Open Original File
                </a>
              </div>
               <div className="p-6 flex-grow overflow-y-auto bg-[#fffbf7]/30">
                 <div className="bg-white border border-[#f3eae0] text-zinc-800 p-8 rounded-xl shadow-sm min-h-[600px] max-w-4xl mx-auto font-sans leading-relaxed">
                   <h2 className="text-xl font-bold mb-6 pb-2 border-b border-[#f3eae0] text-zinc-800">{document.title}</h2>
                   <p className="whitespace-pre-wrap text-sm text-zinc-700">{document.extractedText || "No text could be extracted from this document."}</p>
                 </div>
               </div>
            </div>
        )}


        {activeTab === 'chat' && (
          <div className="card-standard h-[600px] flex flex-col p-0 overflow-hidden">
             <div className="flex-grow p-6 overflow-y-auto bg-[#fffbf7]/20 space-y-4">
               {chatMessages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-16 h-16 bg-[#ffeff2] rounded-2xl flex items-center justify-center text-[#ed7e99]">
                      <MessageSquare size={30} />
                   </div>
                   <h3 className="text-lg font-bold text-zinc-800">Chat with Document</h3>
                   <p className="text-zinc-400 text-sm max-w-sm mx-auto">Ask me questions about the contents, summarize specific parts, or explain equations and ideas directly!</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {chatMessages.map((msg, index) => (
                     <div 
                       key={index}
                       className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                     >
                       <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                         msg.role === 'user' 
                           ? 'bg-[#ed7e99] text-white rounded-br-none font-semibold' 
                           : 'bg-[#fffdfb] border border-[#f3eae0] text-zinc-800 rounded-bl-none leading-relaxed whitespace-pre-wrap'
                       }`}>
                         {msg.content}
                       </div>
                     </div>
                   ))}
                   {isSendingChat && (
                     <div className="flex justify-start">
                       <div className="bg-[#fffdfb] border border-[#f3eae0] text-zinc-400 rounded-2xl rounded-bl-none px-4 py-3 text-sm shadow-sm flex items-center space-x-2">
                         <Loader2 size={16} className="animate-spin text-[#ed7e99]" />
                         <span>Analyzing document...</span>
                       </div>
                     </div>
                   )}
                   <div ref={chatBottomRef} />
                 </div>
               )}
             </div>
             
             <form onSubmit={handleSendChatMessage} className="p-4 border-t border-[#f3eae0] bg-white">
                <div className="relative">
                   <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a follow-up question about this document..." 
                    className="w-full bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-3.5 pl-5 pr-14 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#ed7e99]/50 focus:ring-1 focus:ring-[#ed7e99]/20 transition-all"
                   />
                   <button 
                     type="submit"
                     disabled={!chatInput.trim() || isSendingChat}
                     className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-[#ed7e99] hover:bg-[#eb6d8a] disabled:bg-zinc-100 disabled:text-zinc-400 text-white p-2 rounded-lg transition-all flex items-center justify-center"
                   >
                      <Send size={16} />
                   </button>
                </div>
             </form>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="card-standard p-6 space-y-5">
               <div className="flex items-center space-x-3.5">
                 <div className="p-3 bg-[#ffeff2] rounded-xl text-[#ed7e99]">
                   <FileText size={22} />
                 </div>
                 <div>
                   <h3 className="text-base font-bold text-zinc-800">Generate Summary</h3>
                   <p className="text-[10px] font-bold text-[#ed7e99] uppercase tracking-widest mt-px">Study distilled</p>
                 </div>
               </div>
               
               <p className="text-sm text-zinc-400 leading-relaxed font-medium">Extract the structural essence, main insights, and key takeaways from the document in seconds.</p>

               {summary ? (
                 <div className="bg-[#fffdfb] p-5 rounded-xl border border-[#f3eae0] text-zinc-750 text-sm leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                   {summary}
                 </div>
               ) : (
                 <button 
                   onClick={handleGenerateSummary}
                   disabled={isGenerating}
                   className="w-full bg-[#fffdfb] hover:bg-zinc-50 border border-[#f3eae0] text-zinc-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                 >
                   {isGenerating ? <Loader2 size={16} className="animate-spin text-[#ed7e99]" /> : <Sparkles size={16} className="text-[#ed7e99]" />}
                   <span>{isGenerating ? 'Compiling notes...' : 'Summarize Document'}</span>
                 </button>
               )}
             </div>

             <div className="card-standard p-6 space-y-5">
               <div className="flex items-center space-x-3.5">
                 <div className="p-3 bg-[#ffeff2] rounded-xl text-[#ed7e99]">
                   <Sparkles size={22} />
                 </div>
                 <div>
                   <h3 className="text-base font-bold text-zinc-800">Explain a Concept</h3>
                   <p className="text-[10px] font-bold text-[#ed7e99] uppercase tracking-widest mt-px">Deep dive explanation</p>
                 </div>
               </div>
               
               <p className="text-sm text-zinc-400 leading-relaxed font-medium">Type any keyword or complex phrase from the text to get a simplified explanation with educational examples.</p>
               
               <div className="space-y-4">
                 <div className="flex space-x-2">
                   <input 
                     type="text" 
                     value={conceptInput}
                     onChange={(e) => setConceptInput(e.target.value)}
                     placeholder="e.g., 'React Hooks' or 'Photosynthesis'"
                     className="flex-grow bg-[#fffdfb] border border-[#f3eae0] rounded-xl py-2.5 px-4 text-sm text-zinc-800 focus:outline-none focus:border-[#ed7e99]/50 focus:ring-1 focus:ring-[#ed7e99]/20 transition-all placeholder:text-zinc-400"
                   />
                   <button
                     onClick={handleExplainConcept}
                     disabled={!conceptInput.trim() || isExplaining}
                     className="bg-[#ed7e99] hover:bg-[#eb6d8a] disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold px-4 rounded-xl text-sm transition-all flex items-center justify-center whitespace-nowrap active:scale-95"
                   >
                     {isExplaining ? <Loader2 size={16} className="animate-spin" /> : 'Explain'}
                   </button>
                 </div>

                 {conceptExplanation && (
                   <div className="bg-[#fffdfb] p-5 rounded-xl border border-[#f3eae0] text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                     {conceptExplanation}
                   </div>
                 )}
               </div>
              </div>
           </div>
        )}

        {activeTab === 'flashcards' && (
           <div className="card-standard p-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 bg-[#ffeff2] rounded-full flex items-center justify-center text-[#ed7e99]">
                <BrainCircuit size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-800">Learn with Flashcards</h2>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto">Build interactive, customized Q&A review decks extracted straight from this text to master your exam topics.</p>
              </div>

              {existingFlashcards && existingFlashcards.length > 0 && (
                <button 
                  onClick={() => navigate(`/documents/${id}/flashcards`)}
                  className="w-full max-w-xs bg-[#fffdfb] hover:bg-zinc-50 border border-[#f3eae0] text-zinc-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <BrainCircuit size={16} className="text-[#ed7e99]" />
                  <span>View Existing Decks ({existingFlashcards.length})</span>
                </button>
              )}

              <button 
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards}
                className="bg-[#ed7e99] hover:bg-[#eb6d8a] disabled:bg-[#f5b0c2] text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-[#ed7e99]/20 transition-all active:scale-95 text-sm flex items-center space-x-2"
              >
                {isGeneratingFlashcards ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Generating Flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate New Study Deck</span>
                  </>
                )}
              </button>
           </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="card-standard p-12 flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-16 h-16 bg-[#ffeff2] rounded-full flex items-center justify-center text-[#ed7e99]">
               <Trophy size={32} />
             </div>
             <div className="space-y-2">
               <h2 className="text-xl font-bold text-zinc-800">Test Your Knowledge</h2>
               <p className="text-zinc-400 text-sm max-w-sm mx-auto">Generate a custom multiple-choice quiz from this document to test your understanding of the material.</p>
             </div>

             {existingQuizzes && existingQuizzes.length > 0 && (
               <div className="w-full max-w-md space-y-2">
                 <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Previous Quizzes</p>
                 {existingQuizzes.map((quiz) => (
                   <button
                     key={quiz._id}
                     onClick={() => navigate(quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`)}
                     className="w-full bg-[#fffdfb] hover:bg-zinc-50 border border-[#f3eae0] text-zinc-700 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-between active:scale-[0.98]"
                   >
                     <div className="flex items-center space-x-2">
                       <Trophy size={14} className="text-[#ed7e99]" />
                       <span className="text-sm truncate">{quiz.title}</span>
                     </div>
                     {quiz.completedAt ? (
                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Score: {quiz.score}%</span>
                     ) : (
                       <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase">In Progress</span>
                     )}
                   </button>
                 ))}
               </div>
             )}

             <button 
               onClick={handleGenerateQuiz}
               disabled={isGeneratingQuiz}
               className="bg-[#ed7e99] hover:bg-[#eb6d8a] disabled:bg-[#f5b0c2] text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-[#ed7e99]/20 transition-all active:scale-95 text-sm flex items-center space-x-2"
             >
               {isGeneratingQuiz ? (
                 <>
                   <Loader2 size={16} className="animate-spin" />
                   <span>Generating Quiz...</span>
                 </>
               ) : (
                 <>
                   <Sparkles size={16} />
                   <span>Generate New Quiz</span>
                 </>
               )}
             </button>
          </div>
        )}

        {activeTab === 'infographics' && (
          <div className="card-standard p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center text-violet-500">
              <BarChart2 size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-800">Visual Infographic</h2>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                Transform this document into a stunning AI visual map with key metrics, concept cards, a step-by-step timeline, and high-impact takeaways.
              </p>
            </div>

            {existingInfographic && (
              <button
                onClick={() => navigate(`/infographics/${existingInfographic._id}`)}
                className="w-full max-w-xs bg-violet-50 hover:bg-violet-100 border border-violet-100 text-violet-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <BarChart2 size={16} />
                <span>View Generated Infographic</span>
              </button>
            )}

            <button
              onClick={handleGenerateInfographic}
              disabled={isGeneratingInfographic}
              className="bg-gradient-to-r from-violet-500 to-[#ed7e99] hover:opacity-90 disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-violet-200 transition-all active:scale-95 text-sm flex items-center space-x-2"
            >
              {isGeneratingInfographic ? (
                <><Loader2 size={16} className="animate-spin" /><span>Generating Infographic...</span></>
              ) : (
                <><Sparkles size={16} /><span>{existingInfographic ? 'Regenerate Infographic' : 'Generate Visual Infographic'}</span></>
              )}
            </button>

            <p className="text-[11px] text-zinc-300 font-medium">
              All infographics are saved to your{' '}
              <button onClick={() => navigate('/infographics')} className="text-violet-400 hover:underline font-bold">Infographics page</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetailPage;
