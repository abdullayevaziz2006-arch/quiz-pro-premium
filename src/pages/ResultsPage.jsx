import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Home, Award, Trophy, ChevronDown, ChevronUp, Printer, Share2 } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const { student = {}, score = 0, total = 0, grade = 2, analysis = [] } = result;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="relative min-h-screen pb-20 font-sans print:bg-white print:text-black">
      {/* Decorative Blur - Hidden on print */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 print:hidden"></div>
      
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Result Card */}
        <div className="bg-card border border-white/5 p-12 md:p-20 rounded-[48px] text-center shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white">
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] rotate-12 print:hidden">
            <Trophy size={300} />
          </div>

          <div className="space-y-10 relative z-10">
            <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto text-primary border border-primary/20 print:border-black print:text-black">
              <Award size={50} />
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight print:text-black print:text-4xl">Imtihon Natijasi</h1>
              <div className="space-y-2">
                <p className="text-white/40 text-lg print:text-black print:text-base">Talaba ma'lumotlari:</p>
                <h3 className="text-3xl font-bold print:text-black">{student.name} {student.surname}</h3>
                <p className="text-primary font-black uppercase tracking-widest text-sm print:text-black">{student.group} • {student.faculty}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-10">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] space-y-2 print:border-black">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 print:text-black">To'g'ri javoblar</p>
                <div className="text-5xl font-black font-heading text-green-500 print:text-black">
                  {score} <span className="text-xl text-white/20 font-normal print:text-black">/ {total}</span>
                </div>
              </div>

              <div className="bg-primary/10 border-4 border-primary p-8 rounded-[32px] space-y-2 transform -translate-y-4 shadow-2xl shadow-primary/20 print:border-black print:translate-y-0 print:shadow-none">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary print:text-black">Yakuniy Baho</p>
                <div className="text-8xl font-black font-heading text-primary leading-none print:text-black print:text-6xl">{grade}</div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] space-y-2 print:border-black">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 print:text-black">Umumiy foiz</p>
                <div className="text-5xl font-black font-heading text-blue-500 print:text-black">{percentage}%</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-10 print:hidden">
              <button onClick={() => navigate('/')} className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3">
                <Home size={18} /> Asosiy Sahifa
              </button>
              <button onClick={handlePrint} className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3 text-primary">
                <Printer size={18} /> Chop etish (PDF)
              </button>
              <button 
                onClick={() => setShowAnalysis(!showAnalysis)}
                className={`px-10 py-5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${
                  showAnalysis ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 border border-white/5 text-white'
                }`}
              >
                {showAnalysis ? <ChevronUp size={18} /> : <ChevronDown size={18} />} Tahlil
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        {showAnalysis && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 print:hidden">
            <h3 className="text-3xl font-heading font-black px-4 flex items-center gap-4">
              <div className="w-2 h-10 bg-primary rounded-full"></div>
              Batafsil Tahlil
            </h3>
            <div className="grid gap-6">
              {analysis.map((item, idx) => (
                <div key={idx} className={`bg-card border-l-[12px] p-8 md:p-10 rounded-[32px] shadow-lg flex flex-col md:flex-row justify-between gap-10 transition-all hover:scale-[1.01] ${
                  item.isCorrect ? 'border-green-500 bg-green-500/[0.02]' : 'border-red-500 bg-red-500/[0.02]'
                }`}>
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                        item.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {item.isCorrect ? 'To\'g\'ri' : 'Xato'}
                      </span>
                      <span className="text-[11px] font-bold text-white/20 uppercase tracking-widest">Savol #{idx + 1}</span>
                    </div>
                    <h4 className="text-2xl md:text-3xl font-bold leading-tight">{item.question}</h4>
                    
                    <div className="grid sm:grid-cols-2 gap-3 pt-4">
                      {item.options?.map((opt, oIdx) => {
                        let statusStyle = "bg-white/[0.02] border-white/5 text-white/40";
                        if (oIdx === item.correct) statusStyle = "bg-green-500/20 border-green-500/50 text-green-500 font-bold shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                        if (oIdx === item.selected && !item.isCorrect) statusStyle = "bg-red-500/20 border-red-500/50 text-red-500 font-bold";
                        
                        return (
                          <div key={oIdx} className={`px-6 py-4 rounded-2xl border-2 flex items-center gap-4 ${statusStyle}`}>
                            <span className="text-xs font-black">{String.fromCharCode(65+oIdx)}</span>
                            <span className="text-sm">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    {item.isCorrect ? (
                      <CheckCircle2 size={60} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    ) : (
                      <AlertCircle size={60} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-10">
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white/40 transition-all">
                Yuqoriga qaytish
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 p-10 border-t border-gray-200 text-center text-xs text-gray-500">
        Ranch Quiz Pro tizimi orqali yaratilgan rasmiy natija. Sana: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default ResultsPage;
