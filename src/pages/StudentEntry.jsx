import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, School, ArrowRight, GraduationCap } from 'lucide-react';

const StudentEntry = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    group: '',
    faculty: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem('student_info', JSON.stringify(formData));
    navigate('/start-quiz');
  };

  return (
    <div className="flex-1 flex justify-center items-center py-12 px-4 relative overflow-hidden">
      {/* Background Animated Blobs for Login */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob z-[0]"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 z-[0]"></div>

      <div className="card w-full max-w-xl animate-fade glass p-10 md:p-14 relative z-10 bg-white/5 backdrop-blur-3xl border-white/10 shadow-2xl">
        <div className="text-center mb-12 relative">
          <div className="inline-flex p-6 rounded-[32px] bg-accent/10 text-accent mb-6 ring-1 ring-accent/20 shadow-inner">
            <GraduationCap size={48} className="animate-pulse" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">Talaba Portali</h2>
          <p className="text-text-secondary font-medium">
            Testni boshlash uchun shaxsiy ma'lumotlaringizni kiriting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-accent ml-2"><User size={14} /> Ism</label>
              <input 
                required
                placeholder="Ismingiz"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 rounded-[20px] border-2 border-white/5 bg-white/5 focus:border-accent outline-none transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-accent ml-2"><User size={14} /> Familiya</label>
              <input 
                required
                placeholder="Familiyangiz"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                className="w-full p-4 rounded-[20px] border-2 border-white/5 bg-white/5 focus:border-accent outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-accent ml-2"><Users size={14} /> Guruh</label>
            <input 
              required
              placeholder="Guruhingiz (masalan: 211-TI)"
              value={formData.group}
              onChange={(e) => setFormData({...formData, group: e.target.value})}
              className="w-full p-4 rounded-[20px] border-2 border-white/5 bg-white/5 focus:border-accent outline-none transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-accent ml-2"><School size={14} /> Fakultet</label>
            <input 
              required
              placeholder="Fakultetingiz nomi"
              value={formData.faculty}
              onChange={(e) => setFormData({...formData, faculty: e.target.value})}
              className="w-full p-4 rounded-[20px] border-2 border-white/5 bg-white/5 focus:border-accent outline-none transition-all font-bold"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-6 mt-6 justify-center text-xl shadow-2xl shadow-accent/40 hover:shadow-accent/50 group transition-all rounded-[24px]">
            Testni boshlash <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentEntry;
