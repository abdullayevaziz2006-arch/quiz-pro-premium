import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { storage } from '../utils/storage';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Timer, User, GraduationCap } from 'lucide-react';

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
      let teacherId = testId?.split('_')[0];
      let sessionId = testId?.split('_')[1];

      if (!teacherId) return navigate('/');

      const allQuestions = await storage.getQuestions(teacherId);
      const settings = await storage.getSettings(teacherId);
      const sessions = await storage.getSessions(teacherId);
      let selected = [];

      if (sessionId && sessionId !== 'random') {
        const session = sessions.find(s => s.id === sessionId);
        if (session) selected = allQuestions.filter(q => session.questionIds?.includes(q.uid));
      } else {
        selected = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, settings.questionsPerTest || 20);
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
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [questions.length, currentIdx]);

  const handleNextAuto = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(120);
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
      return { question: q.text, isCorrect };
    });

    const criteria = await storage.getCriteria(teacherId);
    let grade = 2;
    [...criteria].sort((a, b) => b.min - a.min).forEach(c => {
      if (score >= c.min && grade === 2) grade = c.grade;
    });

    const resultData = { student, score, total: questions.length, grade, analysis, date: new Date().toISOString() };
    await storage.saveResult(teacherId, resultData);
    sessionStorage.setItem('last_result', JSON.stringify(resultData));
    navigate('/results');
  };

  if (!questions.length) return (
    <div className="min-h-screen flex items-center justify-center hero-mesh">
      <div className="flex flex-col items-center gap-6 anim-up">
        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-bold tracking-widest uppercase opacity-50">Siz uchun test tayyorlanmoqda...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const isCritical = timeLeft < 20;

  return (
    <div className="min-h-screen hero-mesh py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Modern Status Header */}
        <div className="card-premium !p-8 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/5">
              <GraduationCap size={32} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted">Aktiv Talaba</p>
              <h3 className="text-xl font-black">{student?.name} {student?.surname}</h3>
            </div>
          </div>

          <div className="flex-1 w-full space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs font-black text-muted uppercase tracking-widest">Progress: {currentIdx + 1} / {questions.length}</span>
              <span className="text-primary font-black">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/5">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_20px_rgba(255,59,0,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className={`px-8 py-5 rounded-2xl border-2 flex items-center gap-4 transition-all duration-500 ${
            isCritical ? 'border-primary bg-primary/10 animate-pulse text-primary' : 'border-white/5 bg-white/5 text-dim'
          }`}>
            <Timer size={24} />
            <span className="text-3xl font-black font-mono">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Question Area */}
        <div className="grid grid-cols-1 gap-10 anim-up" key={currentIdx}>
          <div className="card-premium !p-16 md:!p-24 space-y-16">
            <div className="space-y-6">
              <span className="badge-premium">Savol #{currentIdx + 1}</span>
              <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">{currentQuestion.text}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [currentIdx]: idx })}
                    className={`flex items-center gap-6 p-8 rounded-[32px] border-2 transition-all text-left group ${
                      isSelected 
                      ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]' 
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${
                      isSelected ? 'bg-primary text-white' : 'bg-white/5 text-muted group-hover:bg-white/10'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-dim group-hover:text-white'}`}>
                      {opt}
                    </span>
                    {isSelected && <CheckCircle2 className="ml-auto text-primary" size={28} />}
                  </button>
                );
              })}
            </div>

            <div className="pt-12 border-t border-white/5 flex justify-between items-center">
              <button 
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="btn btn-secondary px-10 py-5 disabled:opacity-0"
              >
                <ChevronLeft size={20} /> Oldingi
              </button>

              <button 
                onClick={() => currentIdx === questions.length - 1 ? processResult() : (setCurrentIdx(currentIdx + 1), setTimeLeft(120))}
                className="btn btn-primary px-16 py-5 text-xl rounded-[24px]"
              >
                {currentIdx === questions.length - 1 ? 'Yakunlash' : 'Keyingi Savol'} <ChevronRight size={24} className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 text-muted text-sm font-bold opacity-50">
          <AlertCircle size={16} /> Har bir savol uchun 2 daqiqa vaqt beriladi
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
