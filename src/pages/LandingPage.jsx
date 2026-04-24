import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Star, 
  LayoutGrid, 
  Award, 
  Sun, 
  Moon 
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [testId, setTestId] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('ranch_theme') === 'dark' || !localStorage.getItem('ranch_theme'));

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('ranch_theme', nextMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!testId) return;
    navigate(`/quiz?testId=${testId}`);
  };

  return (
    <div className={`min-h-screen overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Theme Toggle */}
      <div className="absolute top-10 right-10 z-[100]">
        <button 
          onClick={toggleTheme}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'bg-white/5 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-white text-orange-500 shadow-xl shadow-orange-900/10 hover:bg-orange-500 hover:text-white'}`}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[70vh]">
          
          {/* Left: Content */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-100'} border`}>
                <Star size={12} className="text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">v6.0 Platinum Edition</span>
              </div>
              <h1 className="text-5xl lg:text-8xl font-black leading-[1.0] tracking-tighter uppercase">
                Bilimlar <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? 'from-white to-white/40' : 'from-slate-900 to-slate-500'}`}>Evolyutsiyasi</span>
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-white/50' : 'text-slate-500'} max-w-lg leading-relaxed font-medium`}>
                Quiz Pro bilan imtihonlarni yangi darajaga olib chiqing. O'ta aniqlik, 
                tezkorlik va xavfsizlik — hammasi bitta platformada.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Shield, title: 'Himoyalangan', desc: 'Natijalar faqat siz uchun' },
                { icon: Zap, title: 'Tezkor', desc: 'Real vaqtda tahlillar' }
              ].map((item, i) => (
                <div key={i} className={`p-8 rounded-3xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/30'} border space-y-4 hover:scale-105 transition-all duration-500`}>
                  <div className={`w-12 h-12 rounded-2xl ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50'} flex items-center justify-center text-orange-500 border border-orange-500/10`}>
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                    <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Join Form */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/50 to-blue-500/50 rounded-[40px] blur-2xl opacity-10 transition duration-1000"></div>
            <div className={`relative ${isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]'} border rounded-[48px] p-10 md:p-16`}>
              
              <div className="flex flex-col items-center mb-12 text-center group">
                <div className="relative mb-8">
                  <div className="absolute -inset-6 bg-orange-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transform group-hover:scale-110 transition-transform duration-700">
                    <path d="M30 35L45 25V75L30 65V35Z" fill="#F97316" fillOpacity="0.4" />
                    <path d="M45 25L65 15V85L45 75V25Z" fill="#F97316" fillOpacity="0.7" />
                    <path d="M65 15L85 5V95L65 85V15Z" fill="#F97316" />
                  </svg>
                </div>
                <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase mb-2`}>
                  RANCH <span className="text-orange-500">PRO</span>
                </h2>
                <p className={`${isDarkMode ? 'text-white/20' : 'text-slate-400'} text-[10px] font-black uppercase tracking-[0.4em]`}>
                  Testga Kirish
                </p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-8">
                <div className="space-y-3">
                  <label className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-slate-400'} ml-4`}>Test Kodi (ID)</label>
                  <input 
                    className={`w-full ${isDarkMode ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl px-8 py-6 text-2xl font-black focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-200/5`} 
                    placeholder="ID kiriting..." 
                    required 
                    autoFocus
                    value={testId}
                    onChange={e => setTestId(e.target.value)}
                  />
                </div>

                <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 rounded-2xl font-black text-xl shadow-2xl shadow-orange-900/40 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]">
                  DAVOM ETISH <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </form>

              <div className={`mt-16 pt-10 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'} text-center`}>
                <button onClick={() => navigate('/admin')} className={`${isDarkMode ? 'text-white/20 hover:text-white' : 'text-slate-400 hover:text-slate-900'} transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto`}>
                  <LayoutGrid size={18} /> ADMIN PANEL
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LandingPage;
