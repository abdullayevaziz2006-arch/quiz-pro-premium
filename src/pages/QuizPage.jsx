import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storage } from '../utils/storage';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Timer, User } from 'lucide-react';

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
  const isSubmittingData = useRef(false);

  useEffect(() => {
    const info = sessionStorage.getItem('student_info');
    if (!info) {
      navigate('/');
      return;
    }
    setStudent(JSON.parse(info));
    
    const loadQuizData = async () => {
      let teacherId = null;
      let sessionId = null;
      
      if (testId && testId.includes('_')) {
        const parts = testId.split('_');
        teacherId = parts[0]?.trim();
        sessionId = parts[1]?.trim();
      }

      if (!teacherId) {
        alert("Xatolik! Havola noto'g'ri.");
        navigate('/');
        return;
      }

      const allQuestions = await storage.getQuestions(teacherId);
      const settings = await storage.getSettings(teacherId);
      const sessions = await storage.getSessions(teacherId);
      let selected = [];

      if (sessionId && sessionId !== 'random') {
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
          selected = allQuestions.filter(q => session.questionIds && session.questionIds.includes(q.uid));
        } else {
          alert("Test topilmadi!");
          navigate('/');
          return;
        }
      } else {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        selected = shuffled.slice(0, settings.questionsPerTest || 20);
      }

      if (selected.length === 0) {
        alert('Savollar topilmadi!');
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
      if (timerRef.current) clearInterval(timerRef.current);
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

  const processResult = async () => {
    if (isSubmittingData.current) return;
    isSubmittingData.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    
    let teacherId = testId?.split('_')[0];
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

    const criteria = await storage.getCriteria(teacherId);
    let grade = 2;
    const sortedCriteria = [...criteria].sort((a, b) => b.min - a.min);
    for (const c of sortedCriteria) {
      if (score >= c.min) {
        grade = c.grade;
        break;
      }
    }

    const resultData = { student, score, total: questions.length, grade, analysis, date: new Date().toISOString() };
    if (teacherId) {
      await storage.saveResult(teacherId, resultData);
    }
    sessionStorage.setItem('last_result', JSON.stringify(resultData));
    navigate('/results');
  };

  if (!questions.length) return (
    <div className="min-h-screen flex items-center justify-center mesh-bg">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-bold animate-pulse">Test yuklanmoqda...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isTimeCritical = timeLeft < 20;

  return (
    <div className="min-h-screen mesh-bg py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
        
        {/* Header / Info */}
        <div className="premium-card glass flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm text-text-dim">Talaba</p>
              <h3 className="text-lg font-bold">{student?.name} {student?.surname}</h3>
            </div>
          </div>

          <div className="flex flex-1 md:mx-10 w-full md:w-auto">
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-black text-primary uppercase tracking-widest">
                <span>Progress</span>
                <span>{currentIdx + 1} / {questions.length}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500 shadow-[0_0_15px_rgba(255,59,0,0.4)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 border ${
            isTimeCritical ? 'bg-danger/20 text-danger border-danger/30 animate-pulse' : 'bg-black/20 text-primary border-primary/10'
          }`}>
            <Timer size={24} />
            <span className="text-2xl font-black font-mono">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="premium-card glass min-h-[500px] flex flex-col p-10 md:p-16 relative overflow-hidden">
          <div className="space-y-12 flex-1">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">{currentQuestion.text}</h2>
            
            <div className="grid gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentIdx]: idx })}
                    className={`group flex items-center gap-6 p-6 md:p-8 rounded-[28px] border-2 transition-all text-left relative overflow-hidden ${
                      isSelected 
                      ? 'border-primary bg-primary/10 shadow-[0_15px_30px_-10px_rgba(255,59,0,0.3)] scale-[1.02]' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${
                      isSelected ? 'bg-primary text-white' : 'bg-black/20 text-text-dim group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-xl md:text-2xl font-bold ${isSelected ? 'text-white' : 'text-text-dim group-hover:text-white'}`}>
                      {opt}
                    </span>
                    {isSelected && (
                      <div className="absolute right-8 animate-fade">
                        <CheckCircle2 size={32} className="text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
            <button 
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="btn btn-secondary px-8 py-5 disabled:opacity-0"
            >
              <ChevronLeft size={20} /> Oldingi
            </button>

            <button 
              onClick={handleNext}
              className="btn btn-primary px-12 py-5 text-xl"
            >
              {currentIdx === questions.length - 1 ? 'Yakunlash' : 'Keyingisi'} <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-primary/5 rounded-2xl text-primary font-bold border border-primary/10 backdrop-blur-md">
            <AlertCircle size={20} /> Shoshilmang, har bir savol uchun vaqt yetarli!
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
