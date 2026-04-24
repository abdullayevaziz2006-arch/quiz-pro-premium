import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storage } from '../utils/storage';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Timer, GraduationCap, X, BookOpen } from 'lucide-react';

const QuizPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);
  const [settings, setSettings] = useState({ timePerQuestion: 120 });
  const [student, setStudent] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const isSubmittingData = useRef(false);

  useEffect(() => {
    const info = sessionStorage.getItem('student_info');
    if (!info) { navigate('/'); return; }
    setStudent(JSON.parse(info));
    
    const loadQuizData = async () => {
      let teacherId = testId?.split('_')[0];
      let sessionId = testId?.split('_')[1];
      if (!teacherId) return navigate('/');

      try {
        setLoading(true);
        const [allQuestions, st, sessions] = await Promise.all([
          storage.getQuestions(teacherId),
          storage.getSettings(teacherId),
          storage.getSessions(teacherId)
        ]);
        
        const currentSettings = st || { questionsPerTest: 20, timePerQuestion: 120 };
        setSettings(currentSettings);
        setTimeLeft(currentSettings.timePerQuestion || 120);

        let selected = [];
        if (sessionId && sessionId !== 'random') {
          const session = sessions.find(s => s.id === sessionId);
          if (session) {
            const qIds = typeof session.questionIds === 'string' ? JSON.parse(session.questionIds) : session.questionIds;
            selected = allQuestions.filter(q => qIds?.includes(q.uid));
          }
        } else {
          selected = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, currentSettings.questionsPerTest || 20);
        }

        setQuestions(selected);
      } catch (err) {
        console.error("Quiz load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, [navigate, testId]);

  useEffect(() => {
    if (questions.length > 0 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextAuto();
            return settings.timePerQuestion || 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [questions.length, currentIdx, settings.timePerQuestion]);

  const handleNextAuto = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(settings.timePerQuestion || 120);
    } else {
      processResult();
    }
  };

  const processResult = async () => {
    if (isSubmittingData.current) return;
    isSubmittingData.current = true;
    clearInterval(timerRef.current);
    
    let teacherId = testId?.split('_')[0];
    let score = 0;
    const analysis = questions.map((q, idx) => {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      const selectedIdx = answers[idx];
      
      const isCorrect = String(selectedIdx) === String(q.correctAnswer);

      if (isCorrect) score++;
      return { 
        question: q.text, 
        isCorrect, 
        options: opts, 
        correct: q.correctAnswer, 
        selected: selectedIdx 
      };
    });

    const criteria = await storage.getCriteria(teacherId);
    let grade = 2;
    [...criteria].sort((a, b) => b.min - a.min).forEach(c => {
      if (score >= c.min && grade === 2) grade = c.grade;
    });

    const resultData = { 
      student: student, 
      score, 
      total: questions.length, 
      grade, 
      analysis, 
      date: new Date().toISOString() 
    };
    
    try {
      await storage.saveResult(teacherId, resultData);
    } catch (err) {
      console.error("Error saving result:", err);
    }
    
    sessionStorage.setItem('last_result', JSON.stringify(resultData));
    navigate('/results');
  };

  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('ranch_theme') === 'dark' || !localStorage.getItem('ranch_theme'));

  useEffect(() => {
    const handleStorage = () => setIsDarkMode(localStorage.getItem('ranch_theme') === 'dark');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#050505] text-white/40' : 'bg-slate-50 text-slate-400'} font-black text-2xl animate-pulse`}>Yuklanmoqda...</div>;
  
  if (questions.length === 0) return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'} p-12 text-center space-y-8`}>
      <div className={`w-24 h-24 ${isDarkMode ? 'bg-red-500/10' : 'bg-red-50'} rounded-full flex items-center justify-center text-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]`}>
        <AlertCircle size={56} />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black">Savollar Topilmadi!</h2>
        <p className={`${isDarkMode ? 'text-white/40' : 'text-slate-500'} max-w-md text-lg leading-relaxed`}>
          Ushbu testda hech qanday savol mavjud emas yoki ular hali admin tomonidan saqlanmagan.
        </p>
      </div>
      <button onClick={() => navigate('/')} className="px-12 py-5 bg-orange-500 rounded-2xl font-black text-xl shadow-xl shadow-orange-900/20 hover:scale-105 transition-all text-white">
        BOSH SAHIFAGA QAYTISH
      </button>
    </div>
  );

  const currentQuestion = questions[currentIdx];
  const options = typeof currentQuestion.options === 'string' ? JSON.parse(currentQuestion.options) : currentQuestion.options;
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#050505]' : 'bg-slate-50'} py-12 px-6 transition-colors duration-700`}>
      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'} border p-8 rounded-[40px] flex justify-between items-center gap-10`}>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-orange-50 border-orange-100'} rounded-3xl flex items-center justify-center text-orange-500 border`}>
              <GraduationCap size={32} />
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-white/40' : 'text-slate-400'} mb-1`}>Talaba</p>
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{student?.name} {student?.surname}</h3>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className={`flex justify-between text-[11px] font-bold ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
               <span>SAVOL {currentIdx + 1} / {questions.length}</span>
               <span>{Math.round(progress)}%</span>
            </div>
            <div className={`h-1.5 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'} rounded-full overflow-hidden`}>
              <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className={`px-8 py-5 rounded-3xl border-2 flex items-center gap-4 transition-all ${timeLeft < 20 ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : (isDarkMode ? 'border-white/5 bg-white/5 text-white' : 'border-slate-100 bg-slate-50 text-slate-700')}`}>
            <Timer size={24} />
            <span className="text-3xl font-black font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50'} border p-12 md:p-20 rounded-[48px] space-y-16 relative overflow-hidden`}>
          <div className="space-y-8 relative z-10 text-center">
             <h2 className={`text-4xl md:text-5xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{String(currentQuestion.text)}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 relative z-10">
            {options?.map((opt, idx) => (
              <button key={idx} onClick={() => setAnswers({ ...answers, [currentIdx]: idx })} className={`flex items-center gap-6 p-8 rounded-[32px] border-2 transition-all text-left ${answers[currentIdx] === idx ? 'border-orange-500 bg-orange-500/5 scale-[1.02]' : (isDarkMode ? 'border-white/5 bg-black/20 hover:border-white/10' : 'border-slate-100 bg-slate-50 hover:border-orange-500/20')}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${answers[currentIdx] === idx ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : (isDarkMode ? 'bg-white/5 text-white/40' : 'bg-white text-slate-300')}`}>{String.fromCharCode(65 + idx)}</div>
                <span className={`text-2xl font-bold ${answers[currentIdx] === idx ? (isDarkMode ? 'text-white' : 'text-orange-500') : (isDarkMode ? 'text-white/40' : 'text-slate-500')}`}>
                  {String(opt)}
                </span>
              </button>
            ))}
          </div>

          <div className={`pt-12 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'} flex justify-between items-center relative z-10`}>
            <button disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)} className={`px-10 py-5 ${isDarkMode ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'} rounded-2xl text-sm font-bold uppercase tracking-widest disabled:opacity-0 transition-all`}>Oldingi</button>
            <button onClick={() => currentIdx === questions.length - 1 ? setShowConfirm(true) : (setCurrentIdx(currentIdx + 1), setTimeLeft(settings.timePerQuestion || 120))} className="px-16 py-5 bg-orange-500 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-900/20 transition-all hover:bg-orange-600 text-white flex items-center gap-3">
              {currentIdx === questions.length - 1 ? 'YAKUNLASH' : 'KEYINGI'} <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
          <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'} border p-12 rounded-[48px] max-w-md w-full text-center space-y-8 relative z-10 shadow-2xl`}>
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500"><AlertCircle size={48} /></div>
            <div className="space-y-2"><h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Yakunlash?</h3><p className={isDarkMode ? 'text-white/40' : 'text-slate-500'}>Haqiqatan ham testni yakunlamoqchimisiz?</p></div>
            <div className="flex flex-col gap-3">
              <button onClick={processResult} className="w-full bg-orange-500 py-5 rounded-2xl font-black text-lg text-white shadow-xl shadow-orange-900/20">HA, YAKUNLAYMAN</button>
              <button onClick={() => setShowConfirm(false)} className={`w-full ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-50 text-slate-400'} py-5 rounded-2xl font-bold`}>BEKOR QILISH</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
