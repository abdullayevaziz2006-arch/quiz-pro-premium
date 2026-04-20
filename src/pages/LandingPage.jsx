import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] gap-16 py-10 px-4 overflow-hidden animate-fade">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob z-[0]"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 z-[0]"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 z-[0]"></div>

      <div className="text-center z-[100] relative space-y-6">
        <div className="inline-flex py-1 px-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold tracking-widest uppercase mb-4 shadow-sm backdrop-blur-md">
          QuizPro Premium 2024
        </div>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">
          Kelajak Test Tizimi
        </h2>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed">
          O'quv markazlari va ta'lim muassasalari uchun mo'ljallangan <b>sun'iy intellektdan</b> ham aqlli reyting va tahlil platformasi.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 justify-center z-[100] w-full max-w-4xl mx-auto items-stretch">
        <Link to="/admin" className="flex-1 card glass p-10 hover:border-accent group flex flex-col items-center gap-6 text-center hover:-translate-y-4 transition-all duration-500 relative overflow-hidden backdrop-blur-2xl bg-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
          <div className="p-6 rounded-[28px] bg-accent/10 group-hover:bg-accent group-hover:text-white group-hover:shadow-lg transition-all duration-500 text-accent ring-1 ring-accent/20">
            <ShieldCheck size={56} />
          </div>
          <div>
            <h3 className="text-3xl font-black mb-3 text-text-primary group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-purple-500 transition-all">Admin Panel</h3>
            <p className="text-text-secondary font-medium px-4">Testlarni yarating, tahlil qiling va markazni to'liq boshqaring.</p>
          </div>
          <div className="mt-auto pt-6 flex items-center justify-center gap-2 text-accent font-bold group-hover:translate-x-2 transition-transform">
            Kirish <ArrowRight size={20} />
          </div>
        </Link>

        <Link to="/quiz" className="flex-1 card glass p-10 hover:border-indigo-400 group flex flex-col items-center gap-6 text-center hover:-translate-y-4 transition-all duration-500 relative overflow-hidden backdrop-blur-2xl bg-white/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
          <div className="p-6 rounded-[28px] bg-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg transition-all duration-500 text-indigo-500 ring-1 ring-indigo-500/20">
            <GraduationCap size={56} />
          </div>
          <div>
            <h3 className="text-3xl font-black mb-3 text-text-primary group-hover:text-indigo-500 transition-all">Talaba Portali</h3>
            <p className="text-text-secondary font-medium px-4">Test kodini kiriting, o'z bilimingizni namoyon eting.</p>
          </div>
          <div className="mt-auto pt-6 flex items-center justify-center gap-2 text-indigo-500 font-bold group-hover:translate-x-2 transition-transform">
            Boshlash <ArrowRight size={20} />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
