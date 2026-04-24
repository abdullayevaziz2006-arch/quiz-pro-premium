import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Users, School, ArrowRight, GraduationCap, ChevronLeft } from 'lucide-react';

const StudentEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('ranch_theme') === 'dark' || !localStorage.getItem('ranch_theme'));

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    group: '',
    faculty: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.surname) return;
    
    // Ma'lumotlarni saqlash va testni boshlash
    sessionStorage.setItem('student_info', JSON.stringify(formData));
    navigate(`/start-quiz?testId=${testId}`);
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center py-12 px-6 transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Decorative Blur */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-500/5'} rounded-full blur-[120px] -z-10`}></div>

      <div className={`w-full max-w-2xl ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50'} border p-10 md:p-16 rounded-[40px] relative overflow-hidden`}>
        {/* Header Icon */}
        <div className="text-center space-y-6 mb-12">
          <div className={`w-20 h-20 ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-100'} rounded-3xl flex items-center justify-center mx-auto text-orange-500 border shadow-xl shadow-orange-900/10`}>
            <GraduationCap size={40} />
          </div>
          <div className="space-y-2">
            <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Talaba Portali</h2>
            <p className={`${isDarkMode ? 'text-white/40' : 'text-slate-500'} text-sm font-medium`}>Testni boshlash uchun ma'lumotlaringizni to'ldiring</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 ml-4`}>
                <User size={14} /> Ismingiz
              </label>
              <input 
                required
                placeholder="Masalan: Azizbek"
                className={`w-full ${isDarkMode ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 transition-all font-black text-lg placeholder:text-slate-200/5`}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 ml-4`}>
                <User size={14} /> Familiyangiz
              </label>
              <input 
                required
                placeholder="Masalan: Abdullayev"
                className={`w-full ${isDarkMode ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 transition-all font-black text-lg placeholder:text-slate-200/5`}
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 ml-4`}>
              <Users size={14} /> Guruhingiz
            </label>
            <input 
              required
              placeholder="Masalan: 211-TI"
              className={`w-full ${isDarkMode ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 transition-all font-black text-lg placeholder:text-slate-200/5`}
              value={formData.group}
              onChange={(e) => setFormData({...formData, group: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 ml-4`}>
              <School size={14} /> Fakultet
            </label>
            <input 
              required
              placeholder="Masalan: TATU, AKT"
              className={`w-full ${isDarkMode ? 'bg-white/[0.03] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 transition-all font-black text-lg placeholder:text-slate-200/5`}
              value={formData.faculty}
              onChange={(e) => setFormData({...formData, faculty: e.target.value})}
            />
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-5 ${isDarkMode ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'} border rounded-2xl text-xs font-black uppercase tracking-widest transition-all`}
            >
              <ChevronLeft size={20} /> Orqaga
            </button>
            <button 
              type="submit" 
              className="flex-[2] flex items-center justify-center gap-3 px-8 py-5 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black text-xl text-white shadow-2xl shadow-orange-900/40 transition-all group active:scale-[0.98]"
            >
              Testni Boshlash <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </form>

        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-30"></div>
      </div>
    </div>
  );
};

export default StudentEntry;
