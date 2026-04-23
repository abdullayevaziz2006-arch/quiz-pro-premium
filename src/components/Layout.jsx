import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  
  // Header va Footer'ni yashirish kerak bo'lgan sahifalar
  const hideHeader = path.includes('/admin') || path.includes('/quiz') || path.includes('/results') || path.includes('/start-quiz');

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 selection:text-orange-500">
      {!hideHeader && (
        <header className="fixed top-0 z-[100] w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
          <nav className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-xl">R</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-tight leading-none uppercase">Ranch <span className="text-orange-500">Pro</span></h1>
                <p className="text-[10px] text-white/30 font-bold tracking-widest uppercase">Quiz Systems</p>
              </div>
            </Link>

            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Platforma</Link>
              </div>
              <Link 
                to="/admin" 
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 transition-all active:scale-95"
              >
                Admin Panel
              </Link>
            </div>
          </nav>
        </header>
      )}

      <main className="flex-1 w-full min-h-screen">
        <div className={hideHeader ? "w-full min-h-screen" : "max-w-7xl mx-auto px-6 py-12 pt-36"}>
          {children}
        </div>
      </main>

      {!hideHeader && (
        <footer className="py-20 border-t border-white/5 bg-black/40">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Ranch Quiz Pro. All rights reserved.
              </p>
              <p className="text-white/20 text-[9px] uppercase tracking-widest font-black">PREMIUM EDITION</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
