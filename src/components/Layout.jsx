import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass flex items-center justify-between px-8 py-5 mx-4 mt-4 rounded-[32px] sticky top-4 z-[100] shadow-xl max-w-7xl md:mx-auto w-[calc(100%-32px)] border-white/5 bg-white/5">
        <h1 className="text-2xl font-black text-accent tracking-tighter">
          QuizPro Premium
        </h1>
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
