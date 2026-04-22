import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Users, School, ArrowRight, GraduationCap, ChevronLeft } from 'lucide-react';

const StudentEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');

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
    <div className="relative min-h-[80vh] flex items-center justify-center py-12 px-6">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-2xl bg-card border border-white/5 p-10 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden">
        {/* Header Icon */}
        <div className="text-center space-y-6 mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary border border-primary/20">
            <GraduationCap size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-heading font-black tracking-tight">Talaba Portali</h2>
            <p className="text-white/40 text-sm">Testni boshlash uchun ma'lumotlaringizni to'ldiring</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary ml-2">
                <User size={14} /> Ismingiz
              </label>
              <input 
                required
                placeholder="Masalan: Azizbek"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary ml-2">
                <User size={14} /> Familiyangiz
              </label>
              <input 
                required
                placeholder="Masalan: Abdullayev"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary ml-2">
              <Users size={14} /> Guruhingiz
            </label>
            <input 
              required
              placeholder="Masalan: 211-TI"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
              value={formData.group}
              onChange={(e) => setFormData({...formData, group: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary ml-2">
              <School size={14} /> Fakultet
            </label>
            <input 
              required
              placeholder="Masalan: TATU, AKT"
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-medium"
              value={formData.faculty}
              onChange={(e) => setFormData({...formData, faculty: e.target.value})}
            />
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all"
            >
              <ChevronLeft size={20} /> Orqaga
            </button>
            <button 
              type="submit" 
              className="flex-[2] flex items-center justify-center gap-3 px-8 py-5 bg-primary hover:bg-primary/90 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all group"
            >
              Testni Boshlash <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30"></div>
      </div>
    </div>
  );
};

export default StudentEntry;
