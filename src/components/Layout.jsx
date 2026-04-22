import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass flex items-center justify-between px-8 py-5 mx-4 mt-4 rounded-[32px] sticky top-4 z-[100] shadow-xl max-w-7xl md:mx-auto w-[calc(100%-32px)] border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="text-accent">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 35L40 30V70L25 65V35Z" fill="currentColor" />
              <path d="M45 25L65 20V80L45 75V25Z" fill="currentColor" />
              <path d="M70 15L95 10V90L70 85V15Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-accent tracking-tighter uppercase">
            Ranch Quiz
          </h1>
        </div>

        <button 
          onClick={toggleTheme}
          className="p-3 rounded-[18px] bg-black/10 hover:bg-accent/20 hover:text-accent transition-all border border-white/10 shadow-sm"
          title={isDarkMode ? 'Kun rejimi' : 'Tun rejimi'}
        >
          {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-indigo-600" />}
        </button>
      </header>
      <main className="container flex-1 animate-fade">
        {children}
      </main>
    </div>
  );
};

export default Layout;
