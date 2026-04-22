import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, ShieldCheck, ArrowRight, Star, Users, Zap } from 'lucide-react';

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
    <div className="min-h-screen mesh-bg">
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Side: Content */}
          <div className="space-y-10 animate-slide-up">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20 text-primary font-bold text-sm">
              <Star size={16} fill="currentColor" />
              <span>Premium Quiz Platformasi</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
                Ranch <br />
                <span className="heading-primary">Quiz Pro</span>
              </h1>
              <p className="text-xl text-text-dim max-w-lg leading-relaxed font-medium">
                Bilimlarni tekshirishning eng oson va zamonaviy usuli. 
                Ustozlar uchun mukammal boshqaruv, talabalar uchun qulay portal.
              </p>
            </div>

            <div className="flex flex-wrap gap-10">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black">100k+</span>
                <span className="text-sm text-text-dim uppercase font-bold tracking-widest">Savollar</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black">50k+</span>
                <span className="text-sm text-text-dim uppercase font-bold tracking-widest">Talabalar</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black">99.9%</span>
                <span className="text-sm text-text-dim uppercase font-bold tracking-widest">Ishonchlilik</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: ShieldCheck, text: 'Xavfsiz Bazalar' },
                { icon: Zap, text: 'Tezkor Natijalar' },
                { icon: Users, text: 'Multi-Tenancy' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <item.icon className="text-primary" size={20} />
                  <span className="text-sm font-bold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Join Form */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full animate-pulse-subtle"></div>
            <div className="premium-card glass relative space-y-8 p-10 md:p-14 border-white/10">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black">Testga Kirish</h2>
                <p className="text-text-dim">Ma'lumotlaringizni kiriting va boshlang</p>
              </div>

              <form onSubmit={handleStartTest} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="input-field" 
                    placeholder="Ism" 
                    required 
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                  <input 
                    className="input-field" 
                    placeholder="Familiya" 
                    required 
                    value={surname}
                    onChange={e => setSurname(e.target.value)}
                  />
                </div>
                <input 
                  className="input-field" 
                  placeholder="Test Kodi (TeacherId_SessionId)" 
                  required 
                  value={testId}
                  onChange={e => setTestId(e.target.value)}
                />
                <button type="submit" className="btn btn-primary w-full py-6 text-xl group">
                  Boshlash <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </form>

              <div className="pt-8 border-t border-white/5 text-center">
                <button onClick={() => navigate('/admin')} className="text-text-dim hover:text-primary transition-colors font-bold flex items-center justify-center gap-2 mx-auto">
                  <Award size={20} /> Ustozlar paneli
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
