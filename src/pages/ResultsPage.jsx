import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, Home, FileText, ChevronDown, ChevronUp, Award, Trophy } from 'lucide-react';

const ResultsPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('last_result');
    if (!data) {
      navigate('/');
      return;
    }
    setResult(JSON.parse(data));
  }, [navigate]);

  if (!result) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  const { student = {}, score = 0, total = 0, grade = 2, analysis = [] } = result || {};
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getGradeColor = (g) => {
    const val = parseInt(g);
    if (val >= 5) return 'text-success border-success bg-success/5';
    if (val >= 4) return 'text-indigo-500 border-indigo-500 bg-indigo-500/5';
    if (val >= 3) return 'text-warning border-warning bg-warning/5';
    return 'text-danger border-danger bg-danger/5';
  };

  return (
    <div className="flex flex-col gap-12 py-12 px-4 animate-fade max-w-5xl mx-auto w-full relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob z-[0]"></div>
      
      {/* Natija Kartasi */}
      <div className="card glass p-10 md:p-16 text-center relative overflow-hidden bg-white/5 border-white/10 rounded-[40px] z-10 shadow-2xl backdrop-blur-3xl">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
          <Trophy size={250} />
        </div>
        
        <div className="inline-flex p-6 rounded-[32px] bg-accent/10 border border-accent/20 text-accent mb-8 shadow-inner">
          {grade >= 4 ? <Award size={64} className="animate-bounce" /> : <FileText size={64} />}
        </div>
        
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">Sizning Natijangiz</h2>
        <p className="text-text-secondary text-xl mb-14 font-medium">Tabriklaymiz, <b className="text-accent">{student.name} {student.surname}</b>! Test muvaffaqiyatli topshirildi.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center gap-3 p-8 glass rounded-[32px] border-white/5 bg-white/5 shadow-lg">
            <span className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] text-center">To'g'ri javoblar</span>
            <span className="text-6xl font-black text-success flex items-baseline gap-2">
              {score} 
              <span className="text-2xl text-text-secondary font-normal">/ {total}</span>
            </span>
          </div>
          
          <div className={`flex flex-col items-center gap-3 p-8 rounded-[32px] border-4 ${getGradeColor(grade)} shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden transform -translate-y-4`}>
             <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-0"></div>
             <span className="text-xs font-black uppercase tracking-[0.2em] relative z-10">Yo'nalish Bahosi</span>
             <span className="text-[8rem] leading-none font-black relative z-10">{grade}</span>
          </div>
          
          <div className="flex flex-col items-center gap-3 p-8 glass rounded-[32px] border-white/5 bg-white/5 shadow-lg">
            <span className="text-xs font-black text-text-secondary uppercase tracking-[0.2em] text-center">Umumiy foiz</span>
            <span className="text-6xl font-black text-indigo-500">{percentage}%</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 relative z-10">
          <button onClick={() => navigate('/')} className="btn py-5 px-10 rounded-[24px] bg-black/20 hover:bg-black/30 border border-white/5 font-bold">
             Asosiy Sahifa
          </button>
          <button 
            onClick={() => setShowAnalysis(!showAnalysis)} 
            className={`btn py-5 px-10 rounded-[24px] font-bold shadow-xl transition-all ${showAnalysis ? 'bg-accent text-white shadow-accent/40' : 'bg-white/10 hover:bg-white/20 border border-white/10 text-text-primary'}`}
          >
            Javoblarni tahlil qilish {showAnalysis ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />} 
          </button>
        </div>
      </div>

      {/* Tahlil Bo'limi */}
      {showAnalysis && (
        <div className="flex flex-col gap-10 animate-fade relative z-10">
          <h3 className="text-4xl font-black px-4 flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
            <div className="w-3 h-12 bg-gradient-to-b from-accent to-purple-500 rounded-full"></div>
            Batafsil Tahlil
          </h3>
          <div className="flex flex-col gap-8">
            {analysis.map((item, idx) => (
              <div key={idx} className={`card glass p-8 md:p-10 rounded-[32px] border-l-[12px] bg-white/5 backdrop-blur-xl transition-all shadow-lg ${item.isCorrect ? 'border-l-success' : 'border-l-danger'}`}>
                <div className="flex justify-between items-start gap-4 mb-8">
                  <div className="flex-1">
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-[16px] mb-4 inline-block ${item.isCorrect ? 'bg-success/20 text-success ring-1 ring-success/30' : 'bg-danger/20 text-danger ring-1 ring-danger/30'}`}>
                      {item.isCorrect ? 'To\'g\'ri javob' : 'Xato javob'}
                    </span>
                    <h4 className="text-2xl md:text-3xl font-bold leading-tight text-text-primary">{idx + 1}. {item.question}</h4>
                  </div>
                  {item.isCorrect ? (
                    <CheckCircle2 size={40} className="text-success shrink-0" />
                  ) : (
                    <AlertCircle size={40} className="text-danger shrink-0" />
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.options.map((opt, oIdx) => {
                    let statusClass = 'border-white/5 bg-black/20 opacity-60';
                    let icon = null;
                    
                    if (oIdx === item.correct) {
                      statusClass = 'border-success bg-success/10 text-success opacity-100 ring-4 ring-success/20 font-bold';
                      icon = <CheckCircle2 size={24} />;
                    } else if (oIdx === item.selected && !item.isCorrect) {
                      statusClass = 'border-danger bg-danger/10 text-danger opacity-100 font-bold';
                      icon = <AlertCircle size={24} />;
                    }
                    
                    return (
                      <div key={oIdx} className={`p-6 rounded-[24px] border-2 flex items-center justify-between transition-all ${statusClass}`}>
                        <div className="flex items-center gap-4">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                            oIdx === item.correct ? 'bg-success text-white shadow-lg' : 
                            (oIdx === item.selected ? 'bg-danger text-white shadow-lg' : 'bg-white/5 text-text-secondary')
                          }`}>
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="text-lg leading-snug">{opt}</span>
                        </div>
                        {icon && <div className="shrink-0">{icon}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="btn py-5 px-12 rounded-[24px] bg-white/10 hover:bg-white/20 border border-white/10 font-bold self-center shadow-lg hover:translate-y-[-2px] transition-all">
             Yuqoriga qaytish
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
