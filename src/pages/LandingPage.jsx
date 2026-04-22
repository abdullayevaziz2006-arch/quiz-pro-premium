import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Zap, LayoutGrid, Award, Github } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [testId, setTestId] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');

  const handleStartTest = (e) => {
    e.preventDefault();
    if (!name || !surname || !testId) return;
    sessionStorage.setItem('student_info', JSON.stringify({ name, surname }));
    navigate(`/quiz?testId=${testId}`);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div className="hero-mesh"></div>
      <div 
        className="hero-image-overlay" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')` }}
      ></div>

      <div className="container relative z-10">
        <div className="section-py grid grid-2 items-center gap-20">
          
          {/* Content Block */}
          <div className="anim-up space-y-10">
            <div className="space-y-4">
              <div className="badge-premium">
                <Star size={12} fill="currentColor" className="mr-2" />
                V2.0 PRO EDITION
              </div>
              <h1 className="text-h1">
                Kelajak <br />
                <span className="gradient-text">Imtihonlari</span>
              </h1>
              <p className="text-body max-w-lg">
                Ranch Quiz Pro — bu shunchaki platforma emas, bu bilimlarni baholashning eng mukammal ekotizimidir. 
                Sizning muvaffaqiyatingiz har bir detalimizda aks etgan.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black">2.4k+</span>
                <span className="text-xs text-muted uppercase font-bold tracking-widest">Aktiv foydalanuvchilar</span>
              </div>
              <div className="w-[1px] h-12 bg-border-light"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black">99.9%</span>
                <span className="text-xs text-muted uppercase font-bold tracking-widest">Aniqlik darajasi</span>
              </div>
            </div>

            <div className="grid grid-2 gap-4">
              {[
                { icon: Shield, title: 'Xavfsiz', desc: 'Ma\'lumotlar to\'liq himoyalangan' },
                { icon: Zap, title: 'Tezkor', desc: 'Natijalar bir lahzada' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-5 bg-white/[0.02] rounded-2xl border border-white/5">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-dim">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Block */}
          <div className="anim-up relative" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-10 bg-primary/20 blur-[120px] rounded-full opacity-30"></div>
            <div className="card-premium relative">
              <div className="space-y-2 mb-10">
                <h3 className="text-h2 text-center">Testga Kirish</h3>
                <p className="text-dim text-center text-sm">O'zingizni sinab ko'rishga tayyormisiz?</p>
              </div>

              <form onSubmit={handleStartTest} className="space-y-6">
                <div className="grid grid-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase ml-2">Ism</label>
                    <input 
                      className="input-premium" 
                      placeholder="Masalan: Azizbek" 
                      required 
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase ml-2">Familiya</label>
                    <input 
                      className="input-premium" 
                      placeholder="Masalan: Abdullayev" 
                      required 
                      value={surname}
                      onChange={e => setSurname(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase ml-2">Test Kodi</label>
                  <input 
                    className="input-premium" 
                    placeholder="TeacherId_SessionId" 
                    required 
                    value={testId}
                    onChange={e => setTestId(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full py-5 text-lg group">
                  Hozir Boshlash <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                <button onClick={() => navigate('/admin')} className="text-dim hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <LayoutGrid size={16} /> Ustozlar boshqaruv paneli
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer Minimal */}
      <footer className="container py-10 border-t border-white/5 flex justify-between items-center opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-sm font-medium">© 2026 Ranch Pro System. All rights reserved.</p>
        <div className="flex gap-6">
          <Award size={20} />
          <Github size={20} />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
