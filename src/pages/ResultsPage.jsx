import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Home, Award, Trophy, ChevronDown, ChevronUp, Printer, Share2 } from 'lucide-react';

const ResultsPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('ranch_theme') === 'dark' || !localStorage.getItem('ranch_theme'));

  useEffect(() => {
    const data = sessionStorage.getItem('last_result');
    if (!data) {
      navigate('/');
      return;
    }
    setResult(JSON.parse(data));

    const handleStorage = () => setIsDarkMode(localStorage.getItem('ranch_theme') === 'dark');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!result) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#050505]' : 'bg-slate-50'}`}>
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const { student = {}, score = 0, total = 0, grade = 2, analysis = [] } = result;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className={`relative min-h-screen pb-20 font-sans print:bg-white print:text-black ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-700`}>
      {/* Decorative Blur - Hidden on print */}
      <div className={`absolute top-0 right-0 w-96 h-96 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-500/5'} rounded-full blur-[120px] -z-10 print:hidden`}></div>
      
      <div className="max-w-5xl mx-auto space-y-12 px-6 pt-12">
        
        {/* Result Card */}
        <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/40'} border p-12 md:p-20 rounded-[48px] text-center relative overflow-hidden print:border-none print:shadow-none print:bg-white`}>
          <div className={`absolute top-0 right-0 p-10 ${isDarkMode ? 'opacity-[0.02]' : 'opacity-[0.05]'} rotate-12 print:hidden`}>
            <Trophy size={300} />
          </div>

          <div className="space-y-10 relative z-10">
            <div className={`w-24 h-24 ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-orange-50 border-orange-100 text-orange-600'} rounded-[32px] flex items-center justify-center mx-auto border print:border-black print:text-black`}>
              <Award size={50} />
            </div>
            
            <div className="space-y-6">
              <h1 className={`text-5xl md:text-7xl font-black tracking-tight print:text-black print:text-4xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Imtihon Natijasi</h1>
              <div className="space-y-2">
                <p className={`${isDarkMode ? 'text-white/40' : 'text-slate-400'} text-lg print:text-black print:text-base`}>Talaba ma'lumotlari:</p>
                <h3 className={`text-3xl font-bold print:text-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{student.name} {student.surname}</h3>
                <p className="text-orange-500 font-black uppercase tracking-widest text-sm print:text-black">{student.group} • {student.faculty}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 pt-10">
              <div className={`${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} border p-8 rounded-[32px] space-y-2 print:border-black`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-slate-400'} print:text-black`}>To'g'ri javoblar</p>
                <div className="text-5xl font-black text-green-500 print:text-black">
                  {score} <span className={`text-xl ${isDarkMode ? 'text-white/20' : 'text-slate-300'} font-normal print:text-black`}>/ {total}</span>
                </div>
              </div>

              <div className="bg-orange-500/10 border-4 border-orange-500 p-8 rounded-[32px] space-y-2 transform md:-translate-y-4 shadow-2xl shadow-orange-900/20 print:border-black print:translate-y-0 print:shadow-none">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 print:text-black">Yakuniy Baho</p>
                <div className="text-8xl font-black text-orange-500 leading-none print:text-black print:text-6xl">{grade}</div>
              </div>

              <div className={`${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} border p-8 rounded-[32px] space-y-2 print:border-black`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/30' : 'text-slate-400'} print:text-black`}>Umumiy foiz</p>
                <div className="text-5xl font-black text-blue-500 print:text-black">{percentage}%</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-10 print:hidden">
              <button onClick={() => navigate('/')} className={`px-10 py-5 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5 text-white' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'} border rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3`}>
                <Home size={18} /> Asosiy Sahifa
              </button>
              <button onClick={handlePrint} className={`px-10 py-5 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'} border rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3 text-orange-500`}>
                <Printer size={18} /> Chop etish (PDF)
              </button>
              <button 
                onClick={() => setShowAnalysis(!showAnalysis)}
                className={`px-10 py-5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${
                  showAnalysis ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' : (isDarkMode ? 'bg-white/5 hover:bg-white/10 border border-white/5 text-white' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600')
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
            <h3 className={`text-3xl font-black px-4 flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <div className="w-2 h-10 bg-orange-500 rounded-full"></div>
              Batafsil Tahlil
            </h3>
            <div className="grid gap-6">
              {analysis.map((item, idx) => (
                <div key={idx} className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'} border-l-[12px] p-8 md:p-10 rounded-[32px] flex flex-col md:flex-row justify-between gap-10 transition-all hover:scale-[1.01] ${
                  item.isCorrect ? 'border-green-500 bg-green-500/[0.02]' : 'border-red-500 bg-red-500/[0.02]'
                }`}>
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                        item.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {item.isCorrect ? 'To\'g\'ri' : 'Xato'}
                      </span>
                      <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white/20' : 'text-slate-300'} uppercase tracking-widest`}>Savol #{idx + 1}</span>
                    </div>
                    <h4 className={`text-2xl md:text-3xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.question}</h4>
                    
                    <div className="grid sm:grid-cols-2 gap-3 pt-4">
                      {item.options?.map((opt, oIdx) => {
                        let statusStyle = isDarkMode ? "bg-white/[0.02] border-white/5 text-white/40" : "bg-slate-50 border-slate-100 text-slate-400";
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
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`px-8 py-4 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/40' : 'bg-slate-100 hover:bg-slate-200 text-slate-400'} rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all`}>
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

      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-0 left-0 right-0 p-10 border-t border-gray-200 text-center text-xs text-gray-500">
        Ranch Quiz Pro tizimi orqali yaratilgan rasmiy natija. Sana: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default ResultsPage;
