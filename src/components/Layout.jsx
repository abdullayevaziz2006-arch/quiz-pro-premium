import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isQuiz = location.pathname.startsWith('/quiz');

  return (
    <div className="app-layout">
      {/* Background stays at the bottom and doesn't intercept clicks */}
      <div className="hero-bg"></div>
      
      {!isQuiz && (
        <header className="site-header">
          <div className="container flex justify-between items-center w-full">
            <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none', color: 'white' }}>
              <div className="w-10 h-10 bg-[#FF3B00] rounded-xl flex items-center justify-center font-black text-xl">R</div>
              <div className="flex flex-col">
                <span className="text-lg font-black leading-none">Ranch <span className="text-[#FF3B00]">Pro</span></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-dim">Quiz Systems</span>
              </div>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-dim hover:text-white transition-colors" style={{ textDecoration: 'none' }}>Platforma</Link>
              <Link to="/admin" className="btn btn-primary px-6 py-2 text-[10px] uppercase tracking-widest">Admin Panel</Link>
            </nav>
          </div>
        </header>
      )}

      <main className="site-main">
        <div className="container">
          {children}
        </div>
      </main>

      {!isQuiz && (
        <footer className="site-footer">
          <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-dim text-[10px] font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} Ranch Quiz Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-dim">
              <span className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#FF3B00]">Privacy</span>
              <span className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#FF3B00]">Terms</span>
              <span className="text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#FF3B00]">Support</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
