import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isQuiz = location.pathname.startsWith('/quiz');

  return (
    <div className="flex flex-col min-h-screen selection:bg-primary selection:text-white">
      {/* Background System */}
      <div className="hero-mesh"></div>
      
      {!isQuiz && (
        <header className="sticky top-0 z-[1000] border-b border-white/5 bg-bg-deep/80 backdrop-blur-xl">
          <div className="container flex justify-between items-center py-5">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">R</div>
              <div className="flex flex-col">
                <span className="text-xl font-black leading-none">Ranch <span className="text-primary">Pro</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Quiz Systems</span>
              </div>
            </Link>
            
            <nav className="flex items-center gap-10">
              <Link to="/" className="text-xs font-black uppercase tracking-widest text-muted hover:text-white transition-colors">Platforma</Link>
              <Link to="/admin" className="btn btn-primary px-8 py-3 text-xs tracking-widest uppercase">Admin Panel</Link>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 relative z-10">
        {children}
      </main>

      {!isQuiz && (
        <footer className="py-12 border-t border-white/5 bg-bg-surface/50">
          <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-dim text-xs font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} Ranch Quiz Pro. Developed with precision.
            </p>
            <div className="flex gap-8 text-muted">
              <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Privacy</span>
              <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Terms</span>
              <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">Support</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
