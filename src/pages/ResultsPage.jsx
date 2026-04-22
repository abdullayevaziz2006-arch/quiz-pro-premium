import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Home, Award, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const { student = {}, score = 0, total = 0, grade = 2, analysis = [] } = result;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
      
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Result Card */}
        <div className="bg-card border border-white/5 p-12 md:p-20 rounded-[48px] text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] rotate-12">
            <Trophy size={300} />
          </div>

          <div className="space-y-8 relative z-10">
            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto text-primary border border-primary/20">
              <Award size={50} />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight">Sizning Natijangiz</h1>
              <p className="text-white/40 text-lg max-w-2xl mx-auto">
                Tabriklaymiz, <span className="text-white font-bold">{student.name} {student.surname}</span>! 
                Test muvaffaqiyatli topshirildi.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-10">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">To'g'ri javoblar</p>
                <div className="text-5xl font-black font-heading text-green-500">
                  {score} <span className="text-xl text-white/20 font-normal">/ {total}</span>
                </div>
              </div>

              <div className="bg-primary/10 border-4 border-primary p-8 rounded-[32px] space-y-2 transform -translate-y-4 shadow-2xl shadow-primary/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Imtihon Bahosi</p>
                <div className="text-8xl font-black font-heading text-primary leading-none">{grade}</div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Umumiy foiz</p>
                <div className="text-5xl font-black font-heading text-blue-500">{percentage}%</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-10">
              <button onClick={() => navigate('/')} className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3">
                <Home size={18} /> Asosiy Sahifa
              </button>
              <button 
                onClick={() => setShowAnalysis(!showAnalysis)}
                className={`px-10 py-5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${
                  showAnalysis ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 hover:bg-white/10 border border-white/5 text-white'
                }`}
              >
                {showAnalysis ? <ChevronUp size={18} /> : <ChevronDown size={18} />} Tahlilni ko'rish
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        {showAnalysis && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-3xl font-heading font-black px-4">Batafsil Tahlil</h3>
            <div className="grid gap-6">
              {analysis.map((item, idx) => (
                <div key={idx} className={`bg-card border-l-8 p-8 rounded-[32px] shadow-lg flex flex-col md:flex-row justify-between gap-8 ${
                  item.isCorrect ? 'border-green-500' : 'border-red-500'
                }`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                        item.isCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {item.isCorrect ? 'To\'g\'ri' : 'Xato'}
                      </span>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Savol #{idx + 1}</span>
                    </div>
                    <h4 className="text-2xl font-bold leading-tight">{item.question}</h4>
                  </div>
                  <div className="flex items-center">
                    {item.isCorrect ? (
                      <CheckCircle2 size={40} className="text-green-500" />
                    ) : (
                      <AlertCircle size={40} className="text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResultsPage;
