import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Star, LayoutGrid, Award } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [testId, setTestId] = useState('');

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!testId) return;
    // Logika: Faqat testId bilan keyingi bosqichga o'tamiz
    navigate(`/quiz?testId=${testId}`);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10"></div>

      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[70vh]">
        
        {/* Left: Content */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Star size={12} className="text-primary fill-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">v4.0 Final Edition</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-heading font-black leading-[1.1] tracking-tight">
              Bilimlar <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Evolyutsiyasi</span>
            </h1>
            <p className="text-lg text-white/50 max-w-lg leading-relaxed">
              Ranch Pro bilan imtihonlarni yangi darajaga olib chiqing. O'ta aniqlik, 
              tezkorlik va xavfsizlik — hammasi bitta platformada.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: 'Himoyalangan', desc: 'Natijalar faqat siz uchun' },
              { icon: Zap, title: 'Tezkor', desc: 'Real vaqtda tahlillar' }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <item.icon size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">{item.title}</h4>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Join Form */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-[32px] blur opacity-20 transition duration-1000"></div>
          <div className="relative bg-card border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl">
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-3xl font-heading font-black">Testga Kirish</h2>
              <p className="text-white/40 text-sm">Davom etish uchun test kodini kiriting</p>
            </div>

            <form onSubmit={handleNextStep} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Test Kodi (ID)</label>
                <input 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white text-xl font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/5" 
                  placeholder="Masalan: Uid_SessionId" 
                  required 
                  autoFocus
                  value={testId}
                  onChange={e => setTestId(e.target.value)}
                />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 group">
                Davom Etish <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <button onClick={() => navigate('/admin')} className="text-white/30 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
                <LayoutGrid size={16} /> Admin Boshqaruv Paneli
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
