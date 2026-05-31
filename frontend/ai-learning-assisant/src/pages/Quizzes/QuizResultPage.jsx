import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/apiService';
import { Trophy, Calendar, Check, X, Loader2 } from 'lucide-react';

const QuizResultPage = () => {
  const { quizid } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/quiz/${quizid}`);
        setQuiz(res.data.data);
      } catch (err) {
        console.error('Failed to fetch quiz results', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizid, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10 mb-4" />
        <p className="text-zinc-400 font-semibold text-sm">Grading exam papers...</p>
      </div>
    );
  }

  const scorePercentage = quiz.score;
  
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-800 tracking-tight">Quiz Completed!</h1>
        <p className="text-zinc-450 text-sm font-semibold">Great job finishing the quiz for <span className="text-[#ed7e99]">{quiz.title}</span></p>
      </div>

      <div className="card-standard p-8 shadow-md relative overflow-hidden">
        {/* Decorative background score */}
        <div className="absolute top-[-10%] right-[-10%] text-[160px] font-black text-[#ed7e99]/[0.04] leading-none select-none">
          {Math.round(scorePercentage)}%
        </div>

        <div className="relative z-10 flex flex-col items-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center border-8 border-zinc-100 bg-[#fffdfb] mb-5 ${scorePercentage >= 70 ? 'text-emerald-500' : 'text-rose-450'}`}>
               <span className="text-3xl font-extrabold">{Math.round(scorePercentage)}%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-6 w-full max-w-sm mb-8">
              <div className="text-center">
                 <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Score</p>
                 <p className="text-xl font-bold text-zinc-800">
                    {Math.round((quiz.score / 100) * quiz.totalQuestions)} / {quiz.totalQuestions} ({quiz.score}%)
                 </p>
              </div>
              <div className="text-center">
                 <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mb-0.5">Completed On</p>
                 <p className="text-xl font-bold text-zinc-800">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link 
                to={`/documents/${quiz.documentId}`} 
                className="flex-grow bg-[#ed7e99] hover:bg-[#eb6d8a] text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-md shadow-[#ed7e99]/20 transition-all text-sm active:scale-95"
              >
                Back to Document
              </Link>
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex-grow bg-[#fffdfb] hover:bg-zinc-50 text-zinc-700 font-bold py-3.5 px-6 rounded-xl text-center border border-[#f3eae0] transition-all text-sm active:scale-95"
              >
                Dashboard Home
              </button>
            </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-800 ml-1">Question Review</h2>
        <div className="space-y-4">
          {quiz.questions.map((question, idx) => {
            const userAns = quiz.userAnswers?.find(ua => ua.questionIndex === idx);
            const isCorrect = userAns?.isCorrect || false;
            
            return (
              <div key={idx} className={`bg-white border rounded-xl p-5 shadow-sm ${isCorrect ? 'border-emerald-100' : 'border-rose-100'}`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-zinc-800 pr-4 text-sm sm:text-base">{idx + 1}. {question.question}</h3>
                  {isCorrect ? (
                    <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full flex items-center justify-center"><Check size={16} /></span>
                  ) : (
                    <span className="bg-rose-50 text-rose-500 p-1.5 rounded-full flex items-center justify-center"><X size={16} /></span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-[#fffdfb] border border-[#f3eae0]">
                    <p className="text-[9px] uppercase font-bold text-zinc-400 mb-0.5">Your Answer</p>
                    <p className={`text-sm font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>{userAns?.selectedAnswer || 'No answer'}</p>
                  </div>
                  {!isCorrect && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-[9px] uppercase font-bold text-emerald-600 mb-0.5">Correct Answer</p>
                      <p className="text-sm font-bold text-emerald-700">{question.correctAnswer}</p>
                    </div>
                  )}
                </div>
                
                {question.explanation && (
                  <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <p className="text-xs text-zinc-500 leading-relaxed"><span className="font-bold text-[#ed7e99] mr-1">Explanation:</span>{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
