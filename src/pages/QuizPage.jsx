import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storage } from '../utils/storage';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Timer } from 'lucide-react';

const QuizPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);
  const [student, setStudent] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const info = sessionStorage.getItem('student_info');
    if (!info) {
      navigate('/');
      return;
    }
    setStudent(JSON.parse(info));
    
    const loadQuizData = async () => {
      const allQuestions = await storage.getQuestions();
      const settings = await storage.getSettings();
      const sessions = await storage.getSessions();
      let selected = [];

      if (testId) {
        const session = sessions.find(s => s.id === testId);
        if (session) {
          selected = allQuestions.filter(q => session.questionIds.includes(q.uid));
          selected = [...selected].sort(() => 0.5 - Math.random());
        } else {
          alert('Kechirasiz, ushbu test topilmadi yoki o\'chirilgan.');
          navigate('/');
          return;
        }
      } else {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        selected = shuffled.slice(0, settings.questionsPerTest || allQuestions.length);
      }

      if (selected.length === 0) {
        alert('Test savollari topilmadi. Admin bilan bog\'laning (Savollar bazasi bo\'sh bo\'lishi mumkin).');
        navigate('/');
        return;
      }
      setQuestions(selected);
    };

    loadQuizData();
  }, [navigate, testId]);

  useEffect(() => {
    if (questions.length > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextAuto();
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [questions.length]);

  const handleNextAuto = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(120);
    } else {
      processResult();
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setTimeLeft(120);
    } else {
      processResult();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setTimeLeft(120);
    }
  };

  const selectOption = (optIdx) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const processResult = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let score = 0;
    const analysis = questions.map((q, idx) => {
      const isCorrect = answers[idx] === q.correct;
      if (isCorrect) score++;
      return {
        question: q.text,
        options: q.options,
        correct: q.correct,
        selected: answers[idx],
        isCorrect
      };
    });

    const criteria = await storage.getCriteria();
    let grade = 2;
    const sortedCriteria = [...criteria].sort((a, b) => b.min - a.min);
    for (const c of sortedCriteria) {
      if (score >= c.min) {
        grade = c.grade;
        break;
      }
    }

    const resultData = { student, score, total: questions.length, grade, analysis, id: Date.now() };
    await storage.saveResult(resultData);
    sessionStorage.setItem('last_result', JSON.stringify(resultData));
    
    setTimeout(() => { navigate('/results'); }, 100);
  };

  if (!questions.length) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-accent animate-pulse"></div>
    </div>
  );

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isTimeCritical = timeLeft < 20;

  return (
    <div className="flex flex-col gap-8 py-10 px-4 max-w-4xl mx-auto w-full animate-fade relative">
      <div className="absolute top-20 right-0 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob z-[0]"></div>

      {/* Modern Quiz Header */}
      <div className="glass p-6 md:p-8 rounded-[32px] sticky top-6 z-50 flex flex-col gap-6 shadow-2xl backdrop-blur-3xl bg-white/5 border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-accent uppercase tracking-[0.2em]">Savol {currentIdx + 1} / {questions.length}</span>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5 mt-2 min-w-[150px]">
              <div 
                className="bg-gradient-to-r from-accent to-purple-500 h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 px-6 py-4 rounded-[24px] transition-all duration-500 border border-white/10 shadow-lg ${
            isTimeCritical ? 'bg-danger/20 text-danger border-danger/30 scale-105 animate-pulse' : 'bg-black/20 text-accent/90'
          }`}>
            <Timer size={24} className={isTimeCritical ? 'animate-bounce' : ''} />
            <span className="font-mono font-black text-3xl tracking-tighter">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Premium Question Card */}
      <div className="card glass p-8 md:p-14 min-h-[450px] flex flex-col relative overflow-hidden bg-white/5 border-white/10 rounded-[40px] z-10 shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 leading-tight text-text-primary">{currentQuestion.text}</h2>
        
        <div className="flex flex-col gap-4 flex-1">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = answers[currentIdx] === idx;
            return (
              <button
                key={idx}
                onClick={() => selectOption(idx)}
                className={`p-6 md:p-8 rounded-[28px] border-2 transition-all duration-300 flex items-center gap-6 group relative overflow-hidden text-left ${
                  isSelected 
                  ? 'border-accent bg-accent/10 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] scale-[1.02]' 
                  : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all shrink-0 ${
                  isSelected ? 'bg-accent text-white shadow-lg' : 'bg-black/20 text-text-secondary group-hover:text-accent group-hover:bg-accent/10'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                
                <span className={`text-xl font-bold leading-relaxed flex-1 ${isSelected ? 'text-accent' : 'text-text-primary'}`}>
                  {opt}
                </span>

                <div className={`absolute right-6 transition-all duration-500 origin-center ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                  <CheckCircle2 size={36} className="text-accent" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
          <button 
            disabled={currentIdx === 0}
            onClick={handlePrev}
            className="flex items-center gap-3 px-8 py-5 rounded-[24px] font-bold transition-all disabled:opacity-0 hover:bg-white/10"
          >
            <ChevronLeft size={20} /> Oldingi
          </button>

          <button 
            onClick={handleNext}
            className="btn btn-primary px-12 py-5 text-xl rounded-[24px] shadow-2xl shadow-accent/40"
          >
            {currentIdx === questions.length - 1 ? 'Yakunlash' : 'Keyingisi'} <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex justify-center z-10">
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-[24px] text-sm font-bold text-yellow-600 dark:text-yellow-400 backdrop-blur-md">
          <AlertCircle size={20} /> Har bir savol uchun vaqt ajratilgan. Shoshilmang!
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
