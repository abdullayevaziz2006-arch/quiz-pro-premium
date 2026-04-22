import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isQuiz = location.pathname.startsWith('/quiz');

  return (
    <div className="min-h-screen flex flex-col font-outfit">
      {/* Background Mesh Overlay */}
      <div className="mesh-bg"></div>

      {/* Modern Floating Header (Only for Landing/Admin) */}
      {!isQuiz && (
        <header className="sticky top-0 z-[1000] px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center glass p-3 px-8 rounded-[30px] border-white/5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_5px_15px_rgba(255,59,0,0.4)] group-hover:scale-110 transition-transform">
                <span className="text-white font-black text-xl">R</span>
              </div>
              <span className="text-xl font-black tracking-tighter">Ranch <span className="text-primary">Quiz</span></span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-bold text-text-dim hover:text-white transition-colors">Bosh sahifa</Link>
              <Link to="/admin" className="btn btn-primary px-6 py-2.5 text-sm">Admin</Link>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      {/* Simple Footer */}
      {!isQuiz && (
        <footer className="py-10 text-center relative z-10">
          <p className="text-text-dim text-sm font-medium opacity-50">
            © {new Date().getFullYear()} Ranch Quiz Pro. Barcha huquqlar himoyalangan.
          </p>
        </footer>
      )}
    </div>
  );
};

export default Layout;
