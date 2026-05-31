import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/apiService';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';

const QuizTakePage = () => {
  const { quizid } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/quiz/${quizid}`);
        setQuiz(res.data.data);
        setUserAnswers(new Array(res.data.data.questions.length).fill(null));
      } catch (err) {
        console.error('Failed to fetch quiz', err);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizid, navigate]);

  const handleAnswerSelect = (option) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (userAnswers.includes(null)) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = userAnswers.map((answer, idx) => ({
        questionIndex: idx,
        selectedAnswer: answer || ''
      }));

      await api.post(`/quizzes/${quizid}/submit`, { answers: formattedAnswers });
      navigate(`/quizzes/${quizid}/results`);
    } catch (err) {
      console.error('Failed to submit quiz', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-[#ed7e99] w-10 h-10 mb-4" />
        <p className="text-zinc-400 font-semibold text-sm">Formulating quiz questionnaire...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/documents/${quiz.documentId}`} className="p-2 hover:bg-[#ffeff2] rounded-full transition-colors text-zinc-400 hover:text-[#ed7e99]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-800 truncate max-w-[200px] sm:max-w-md">{quiz.title}</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-[9px] font-bold text-[#ed7e99] bg-[#ffeff2] px-2 py-0.5 rounded-lg uppercase tracking-wider">
                {currentQuestion.difficulty || 'Medium'}
              </span>
              <span className="text-xs text-zinc-400 font-semibold">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#ed7e99] hover:bg-[#eb6d8a] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#ed7e99]/20 flex items-center space-x-1.5 active:scale-95"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          <span>{isSubmitting ? 'Submitting...' : 'Finish Quiz'}</span>
        </button>
      </div>

      {/* Progress Circles */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {quiz.questions.map((_, idx) => (
          <div 
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentQuestionIndex ? 'bg-[#ed7e99] ring-4 ring-[#ed7e99]/20' : 
              userAnswers[idx] !== null ? 'bg-[#ffd6e7]' : 'bg-zinc-200'
            }`}
          ></div>
        ))}
      </div>

      {/* Question Card */}
      <div className="card-standard p-6">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-800 mb-6 leading-snug">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3.5">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full flex items-center p-3.5 rounded-xl border-2 transition-all duration-200 group ${
                userAnswers[currentQuestionIndex] === option 
                ? 'border-[#ed7e99] bg-[#ffeff2]' 
                : 'border-[#f3eae0] bg-[#fffdfb] hover:border-[#ed7e99]/30 hover:bg-[#fffcf9]'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-3.5 font-bold text-xs transition-colors ${
                userAnswers[currentQuestionIndex] === option 
                ? 'bg-[#ed7e99] text-white' 
                : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700'
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={`text-left text-sm font-semibold ${userAnswers[currentQuestionIndex] === option ? 'text-zinc-800' : 'text-zinc-650'}`}>
                {option}
              </span>
              {userAnswers[currentQuestionIndex] === option && (
                <CheckCircle2 size={16} className="ml-auto text-[#ed7e99]" fill="currentColor" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center bg-white border border-[#f3eae0] rounded-xl p-3.5 shadow-sm">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-[#ed7e99] disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          <ChevronLeft size={16} className="mr-1" />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
          className="flex items-center px-5 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
        >
          Next
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default QuizTakePage;
