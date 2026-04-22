import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isQuiz = location.pathname.startsWith('/quiz');

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary selection:text-white">
      {!isQuiz && (
        <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-4 no-underline group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">R</div>
              <div className="flex flex-col">
                <span className="text-xl font-heading font-black text-white leading-none">Ranch <span className="text-primary">Pro</span></span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Quiz Systems</span>
              </div>
            </Link>
            
            <nav className="flex items-center gap-8">
              <Link to="/" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors no-underline">Platforma</Link>
              <Link to="/admin" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 no-underline">Admin Panel</Link>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {children}
        </div>
      </main>

      {!isQuiz && (
        <footer className="py-12 border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Ranch Quiz Pro. All rights reserved.
              </p>
              <p className="text-white/20 text-[9px] uppercase tracking-widest">Precision and Innovation</p>
            </div>
            <div className="flex items-center gap-10">
              {['Privacy', 'Terms', 'Support'].map(item => (
                <span key={item} className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-primary cursor-pointer transition-colors">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
