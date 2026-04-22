import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isQuiz = location.pathname.startsWith('/quiz');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-[#0A0A0B] -z-10"></div>
      
      {!isQuiz && (
        <header className="sticky top-0 z-[1000]">
          <div className="container flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF3B00] rounded-xl flex items-center justify-center font-black text-xl">R</div>
              <span className="text-xl font-black">Ranch <span className="text-[#FF3B00]">Quiz</span></span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-sm font-bold text-dim hover:text-white transition-colors">Bosh sahifa</Link>
              <Link to="/admin" className="btn btn-primary px-6 py-2 text-sm">Admin</Link>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 container py-10">
        {children}
      </main>

      {!isQuiz && (
        <footer>
          <div className="container text-center">
            <p className="text-dim text-sm font-medium">
              © {new Date().getFullYear()} Ranch Quiz Pro. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
