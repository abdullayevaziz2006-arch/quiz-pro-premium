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

      const [allQuestions, st, sessions] = await Promise.all([
        storage.getQuestions(teacherId),
        storage.getSettings(teacherId),
        storage.getSessions(teacherId)
      ]);
      
      setSettings(st);
      setTimeLeft(st.timePerQuestion || 120);

      let selected = [];
      if (sessionId && sessionId !== 'random') {
        const session = sessions.find(s => s.id === sessionId);
        if (session) selected = allQuestions.filter(q => session.questionIds?.includes(q.uid));
      } else {
        selected = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, st.questionsPerTest || 20);
      }

      if (selected.length === 0) return navigate('/');
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
      const isCorrect = answers[idx] === q.correct;
      if (isCorrect) score++;
      return { question: q.text, isCorrect, options: q.options, correct: q.correct, selected: answers[idx] };
    });

    const criteria = await storage.getCriteria(teacherId);
    let grade = 2;
    [...criteria].sort((a, b) => b.min - a.min).forEach(c => {
      if (score >= c.min && grade === 2) grade = c.grade;
    });

    const resultData = { 
      student: {
        name: student.name,
        surname: student.surname,
        group: student.group || 'Noma\'lum',
        faculty: student.faculty || 'Noma\'lum'
      }, 
      score, total: questions.length, grade, analysis, date: new Date().toISOString() 
    };
    await storage.saveResult(teacherId, resultData);
    sessionStorage.setItem('last_result', JSON.stringify(resultData));
    navigate('/results');
  };

  if (!questions.length) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Siz uchun test yuklanmoqda...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-surface py-12 px-6 font-sans relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,59,0,0.03),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Pro Header */}
        <div className="bg-card border border-white/5 p-8 rounded-[40px] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center text-primary border border-white/5 shadow-inner">
              <GraduationCap size={32} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/40 mb-1">Aktiv Talaba</p>
              <h3 className="text-2xl font-black">{student?.name} {student?.surname}</h3>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Progress: {currentIdx + 1} / {questions.length}</span>
              <span className="text-primary font-black text-sm">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(255,59,0,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className={`px-8 py-5 rounded-[24px] border-2 flex items-center gap-4 transition-all duration-500 shadow-xl ${
            timeLeft < 20 ? 'border-primary bg-primary/10 text-primary animate-pulse' : 'border-white/5 bg-white/5 text-white'
          }`}>
            <Timer size={24} />
            <span className="text-3xl font-black font-mono leading-none">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200" key={currentIdx}>
          <div className="bg-card border border-white/5 p-12 md:p-20 rounded-[48px] space-y-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-primary">
              <BookOpen size={200} />
            </div>

            <div className="space-y-8 relative z-10">
              <div className="inline-flex px-4 py-2 bg-primary/10 text-primary rounded-xl text-[11px] font-bold uppercase tracking-widest border border-primary/20">
                Savol #{currentIdx + 1}
              </div>
              <h2 className="text-4xl md:text-6xl font-heading font-black leading-tight tracking-tight text-white drop-shadow-sm">
                {currentQuestion.text}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5 relative z-10">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentIdx]: idx })}
                    className={`flex items-center gap-6 p-8 rounded-[32px] border-2 transition-all text-left group relative overflow-hidden ${
                      isSelected 
                      ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]' 
                      : 'border-white/5 bg-black/20 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl transition-all ${
                      isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-white/40 group-hover:bg-white/10'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                      {opt}
                    </span>
                    {isSelected && (
                      <div className="ml-auto w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="text-white" size={20} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-12 border-t border-white/5 flex justify-between items-center relative z-10">
              <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-[24px] text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-0"
              >
                Oldingi
              </button>

              <button 
                onClick={() => currentIdx === questions.length - 1 ? setShowConfirm(true) : (setCurrentIdx(currentIdx + 1), setTimeLeft(settings.timePerQuestion || 120))}
                className="px-16 py-5 bg-primary hover:bg-primary/90 rounded-[24px] text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center gap-3 group"
              >
                {currentIdx === questions.length - 1 ? 'Testni Yakunlash' : 'Keyingi Savol'} 
                <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 text-white/20 text-[11px] font-bold uppercase tracking-widest">
          <AlertCircle size={16} /> Savol uchun vaqt: {settings.timePerQuestion || 120} sekund
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)}></div>
          <div className="bg-card border border-white/10 p-12 rounded-[48px] max-w-md w-full text-center space-y-8 relative z-10 shadow-2xl">
            <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto text-orange-500">
              <AlertCircle size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-heading font-black">Yakunlash?</h3>
              <p className="text-white/40 leading-relaxed">Haqiqatan ham testni yakunlamoqchimisiz? Barcha javoblaringiz saqlanadi.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={processResult} className="w-full bg-primary hover:bg-primary/90 py-5 rounded-[24px] font-black text-lg transition-all shadow-xl shadow-primary/20">
                Ha, Yakunlayman
              </button>
              <button onClick={() => setShowConfirm(false)} className="w-full bg-white/5 hover:bg-white/10 py-5 rounded-[24px] font-bold text-white/40 transition-all">
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
