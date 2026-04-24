import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { parseWordQuiz } from '../utils/wordParser';
import mammoth from 'mammoth';
import { 
  Plus, Trash2, Check, Copy, Share2, LogOut, 
  BookOpen, AlertCircle, CheckCircle, Link2,
  BarChart3, Award, FileUp, Save, Lock,
  Search, Download, Users, Settings, ChevronRight,
  Filter, Trash, Zap, Bug, RefreshCw, LayoutDashboard, Sparkles, UserPlus, Library, ArrowLeft,
  User, Settings2, Hash, Sun, Moon
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questions, setQuestions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [results, setResults] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [settings, setSettings] = useState({ questionsPerTest: 20, timePerQuestion: 120, teacherName: '', groups: [] });
  const [sessionName, setSessionName] = useState('');
  const [sessionQCount, setSessionQCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUid, setAdminUid] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ranch_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('ranch_theme', isDarkMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('storage'));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);



  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setAdminUid(user.uid);
      } else {
        setIsAuthenticated(false);
        setAdminUid(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (adminUid) loadData();
  }, [adminUid]);

  const cleanText = (t) => t ? String(t).replace(/^[\?\+\=\s]+/, '').trim() : '';

  const loadData = async () => {
    setLoading(true);
    try {
      // Birlashtirilgan yuklash: settings va subjects bitta endpointdan keladi
      const [qs, cr, rs, ss, st] = await Promise.all([
        storage.getQuestions(adminUid),
        storage.getCriteria(adminUid),
        storage.getResults(adminUid),
        storage.getSessions(adminUid),
        storage.getSettings(adminUid)
      ]);
      
      const rawQs = Array.isArray(qs) ? qs : [];
      
      // Fanlar ma'lumotini savollar ichidan ajratib olamiz
      const systemData = rawQs.find(q => q.uid === 'subjects_storage_data');
      if (systemData && systemData.options && systemData.options[0]) {
        try {
          const parsedSubs = JSON.parse(systemData.options[0]);
          setSubjects(Array.isArray(parsedSubs) ? parsedSubs : []);
        } catch (e) { setSubjects([]); }
      } else {
        setSubjects([]);
      }

      // Haqiqiy savollarni (fanlar ma'lumotisiz) tozalaymiz
      const actualQs = rawQs.filter(q => q.uid !== 'subjects_storage_data').map(q => {
        let c = q.correctAnswer;
        const cleanOptions = (q.options || []).map((opt, idx) => {
          if (String(opt).startsWith('+')) c = String(idx);
          return cleanText(opt);
        });
        return { 
          ...q, 
          text: cleanText(q.text),
          options: cleanOptions,
          correctAnswer: String(c !== undefined ? c : '0'),
          subjectId: q.subjectId || null
        };
      });

      setQuestions(actualQs);
      setCriteria(Array.isArray(cr) ? cr : []);
      setResults(Array.isArray(rs) ? rs : []);
      setSessions(Array.isArray(ss) ? ss : []);
      if (st) setSettings(st);

    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast("Ro'yxatdan o'tdingiz!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const stats = useMemo(() => ({
    totalStudents: results?.length || 0,
    totalQuestions: questions?.length || 0,
    avgScore: results?.length > 0 ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length).toFixed(1) : 0,
    avgGrade: results?.length > 0 ? (results.reduce((acc, curr) => acc + parseInt(curr.grade || 0), 0) / results.length).toFixed(1) : 0
  }), [results, questions]);

  const currentQuestions = useMemo(() => {
    if (activeTab === 'subjects' && selectedSubject) {
      return questions.filter(q => String(q.subjectId) === String(selectedSubject.id));
    }
    return questions.filter(q => 
      (q.text || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, selectedSubject, activeTab, searchQuery]);

  if (!isAuthenticated && !loading) return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#050505]' : 'bg-[#f0f2f5]'} flex items-center justify-center p-6 font-['Outfit'] transition-colors duration-700`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-black/5 shadow-2xl shadow-slate-200'} border p-12 rounded-[48px] space-y-10 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
        <div className="w-20 h-20 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-orange-900/20">
          {isRegisterMode ? <UserPlus size={36} /> : <Lock size={36} />}
        </div>
        <div className="text-center">
          <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tight`}>RANCH <span className="text-orange-500">PRO</span></h2>
          <p className={`${isDarkMode ? 'text-white/20' : 'text-slate-400'} text-[10px] font-black uppercase tracking-[0.3em] mt-2`}>Platinum v6.0</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <input name="email" type="email" placeholder="Email manzil" className={`w-full ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-2xl px-6 py-4 outline-none focus:border-orange-500 transition-all font-bold`} required />
            <input name="password" type="password" placeholder="Parol" className={`w-full ${isDarkMode ? 'bg-white/5 text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-2xl px-6 py-4 outline-none focus:border-orange-500 transition-all font-bold`} required />
          </div>
          <button type="submit" className="w-full bg-orange-500 py-5 rounded-2xl font-black text-lg text-white shadow-xl shadow-orange-900/20 hover:bg-orange-600 transition-all">
            {isRegisterMode ? "RO'YXATDAN O'TISH" : "KIRISH"}
          </button>
        </form>

        <div className="relative py-4">
          <div className={`absolute inset-0 flex items-center`}><div className={`w-full border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}></div></div>
          <div className="relative flex justify-center text-[10px]"><span className={`${isDarkMode ? 'bg-[#0a0a0a] text-white/20' : 'bg-white text-slate-400'} px-4 font-black uppercase tracking-widest`}>Yoki</span></div>
        </div>

        <button onClick={() => setIsRegisterMode(!isRegisterMode)} className={`w-full text-[10px] font-black ${isDarkMode ? 'text-white/20 hover:text-orange-500' : 'text-slate-400 hover:text-orange-600'} transition-colors uppercase tracking-widest`}>
          {isRegisterMode ? "LOGIN ORQALI KIRISH" : "YANGI PROFIL YARATISH"}
        </button>
      </div>

    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-bold text-xl animate-pulse">Yuklanmoqda...</div>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Fanlar', icon: Library },
    { id: 'groups', label: 'Guruhlar', icon: Users },
    { id: 'sessions', label: 'Havolalar', icon: Link2 },
    { id: 'results', label: 'Natijalar', icon: Award },
    { id: 'settings', label: 'Sozlamalar', icon: Settings }
  ];

  const handleAddQuestion = (subjectId = null) => {
    const newQ = { 
      uid: Date.now().toString(), 
      text: 'Yangi savol', 
      options: ['A', 'B', 'C', 'D'], 
      correctAnswer: '0',
      subjectId: subjectId
    };
    setQuestions([newQ, ...questions]);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#f8f9fc] text-slate-900'} font-sans overflow-hidden transition-colors duration-700 selection:bg-orange-500/20`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-3 rounded-full bg-white text-black shadow-2xl animate-in slide-in-from-top-4 duration-500 font-bold text-sm flex items-center gap-3">
          <Sparkles className="text-orange-500" size={18} /> {toast}
        </div>
      )}

      {/* Sidebar Menu */}
      <aside className={`w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-8 sticky top-0 h-screen shrink-0 relative z-50 transition-all duration-700`}>
        <div className="mb-12 flex items-center gap-4 px-1 text-white">
          <div className="relative group">
            <div className="absolute -inset-3 bg-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
              {/* Bar 1 (Smallest) */}
              <path d="M15 42L32 32V68L15 58V42Z" fill="#F97316" fillOpacity="0.4" />
              {/* Bar 2 (Medium) */}
              <path d="M40 28L62 15V85L40 72V28Z" fill="#F97316" fillOpacity="0.7" />
              {/* Bar 3 (Largest) */}
              <path d="M70 12L95 0V100L70 88V12Z" fill="#F97316" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none uppercase">RANCH <span className="text-orange-500">PRO</span></h1>
            <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Platinum v6.0</p>
          </div>
        </div>

        <nav className="flex-1 px-2 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedSubject(null);
                setSelectedGroup(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-xs font-bold tracking-tight uppercase">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          {/* PROFIL TUGMASI */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all duration-500 group ${
              activeTab === 'profile' 
                ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-900/20' 
                : 'bg-white/[0.03] border-white/5 hover:border-orange-500/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
              activeTab === 'profile' 
                ? 'bg-white/20 border-white/30' 
                : 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500'
            }`}>
              <User size={20} className={activeTab === 'profile' ? 'text-white' : 'text-orange-500 group-hover:text-white transition-colors'} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className={`text-[10px] font-black truncate uppercase tracking-widest mb-0.5 text-white`}>
                {settings.teacherName || 'Ustoz'}
              </p>
              <p className={`text-[9px] truncate font-bold uppercase tracking-tighter text-white/40`}>
                {auth.currentUser?.email || 'admin@ranch.pro'}
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group`}
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold tracking-tight uppercase text-inherit">Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto px-6 md:px-12 pt-12 pb-0 custom-scrollbar ${isDarkMode ? 'bg-[#050505]' : 'bg-white'}`}>
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
          
          <header className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/50">Tizim holati: Online</p>
              <h2 className={`text-4xl font-black tracking-tight capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {selectedSubject ? (
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedSubject(null)} className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all`}><ArrowLeft size={20} /></button>
                    <span>{selectedSubject.name} <span className={`${isDarkMode ? 'text-white/20' : 'text-slate-300'} text-xl font-medium ml-2`}>/ Savollar</span></span>
                  </div>
                ) : activeTab}
              </h2>
            </div>
            <div className="flex gap-3">
              {/* THEME TOGGLE */}
              <button 
                onClick={toggleTheme}
                className={`w-12 h-12 ${isDarkMode ? 'bg-white/5 text-orange-500 border-white/10' : 'bg-slate-50 text-orange-600 border-slate-200'} border rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={loadData} className={`w-12 h-12 ${isDarkMode ? 'bg-white/[0.03] border-white/5 text-white/30 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-900'} border rounded-xl flex items-center justify-center transition-all`}><RefreshCw size={20} /></button>
              {(activeTab === 'questions' || selectedSubject) && (
                <button onClick={() => handleAddQuestion(selectedSubject?.id)} className="px-8 py-4 bg-orange-500 rounded-xl font-black text-xs shadow-lg shadow-orange-900/10 hover:scale-105 active:scale-95 transition-all text-white uppercase tracking-widest">+ QO'SHISH</button>
              )}
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'TALABALAR', val: stats.totalStudents, icon: Users, color: 'text-blue-500' },
                { label: 'SAVOLLAR', val: stats.totalQuestions, icon: BookOpen, color: 'text-purple-500' },
                { label: 'FANLAR', val: subjects.length, icon: Library, color: 'text-orange-500' },
                { label: 'NATIJALAR', val: results.length, icon: Award, color: 'text-green-500' },
              ].map((s, i) => (
                <div key={i} className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'} border p-8 rounded-3xl space-y-6 hover:border-orange-500/30 transition-all relative overflow-hidden group`}>
                  <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-white/[0.03]' : 'bg-slate-50'} flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-500`}><s.icon size={24} /></div>
                  <div className="space-y-1">
                    <p className={`text-[9px] font-black ${isDarkMode ? 'text-white/20' : 'text-slate-400'} uppercase tracking-widest`}>{s.label}</p>
                    <div className="flex items-center justify-between">
                      <h3 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.val}</h3>
                      {s.label === 'SAVOLLAR' && s.val > 0 && (
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm("DIQQAT! Barcha savollar o'chib ketadi. Rozimisiz?")) {
                              showToast("Tozalanmoqda...");
                              await storage.saveQuestions(adminUid, [], subjects);
                              setQuestions([]);
                              showToast("Barcha savollar o'chirildi!");
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'subjects' && !selectedSubject && (
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-10 rounded-[40px] space-y-8 sticky top-10`}>
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Yangi Fan</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase ${isDarkMode ? 'text-white/20' : 'text-slate-400'} ml-4 tracking-widest`}>Fan nomi</label>
                      <input className={`w-full ${isDarkMode ? 'bg-white/[0.03] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-orange-500 transition-all`} value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Masalan: Matematika" />
                    </div>
                    <button onClick={async () => {
                      if (!newSubject.trim()) return;
                      const sub = { id: Date.now().toString(), name: newSubject.trim() };
                      const updated = [sub, ...subjects];
                      await storage.saveSubjects(adminUid, updated);
                      setSubjects(updated);
                      setNewSubject('');
                      showToast("Fan qo'shildi!");
                    }} className="w-full bg-orange-500 py-5 rounded-2xl font-black text-xl text-white shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all">FANNI QO'SHISH</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className={`text-xl font-black px-4 flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Barcha Fanlar <span className={`px-3 py-1 ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'} rounded-lg text-[10px]`}>{subjects.length} ta</span></h3>
                <div className="grid gap-4">
                  {subjects.map(s => {
                    const qCount = questions.filter(q => String(q.subjectId) === String(s.id)).length;
                    return (
                      <div key={s.id} className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'} border p-6 rounded-3xl flex justify-between items-center hover:border-orange-500/30 transition-all group cursor-pointer`} onClick={() => setSelectedSubject(s)}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} rounded-xl flex items-center justify-center text-orange-500`}><Library size={20} /></div>
                          <div>
                            <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-orange-500 transition-colors`}>{s.name}</h4>
                            <p className={`text-[9px] font-bold ${isDarkMode ? 'text-white/20' : 'text-slate-400'} uppercase tracking-widest`}>{qCount} ta savol</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ChevronRight className={`${isDarkMode ? 'text-white/10' : 'text-slate-200'} group-hover:text-orange-500 transition-all`} size={24} />
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm("Fanni o'chirmoqchimisiz?")) {
                              const updated = subjects.filter(it => it.id !== s.id);
                              await storage.saveSubjects(adminUid, updated);
                              setSubjects(updated);
                              showToast("Fan o'chirildi");
                            }
                          }} className={`w-10 h-10 ${isDarkMode ? 'bg-white/[0.03] text-white/20' : 'bg-slate-50 text-slate-300'} rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center`}><Trash2 size={18} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'questions' || selectedSubject) && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-8 rounded-3xl flex flex-wrap justify-between items-center gap-6 shadow-xl`}>
                <div className="flex-1 min-w-[300px] relative">
                  <Search className={`absolute left-6 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-white/20' : 'text-slate-300'}`} size={20} />
                  <input className={`w-full ${isDarkMode ? 'bg-white/[0.03] text-white border-white/5' : 'bg-slate-50 text-slate-900 border-slate-100'} border rounded-2xl px-16 py-4 text-lg font-bold outline-none focus:border-orange-500/50 transition-all`} placeholder="Savollarni qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button onClick={async () => {
                    if (window.confirm("Ushbu bo'limdagi barcha savollar o'chirilsinmi?")) {
                      const updated = questions.filter(q => selectedSubject ? String(q.subjectId) !== String(selectedSubject.id) : false);
                      setQuestions(updated); await storage.saveQuestions(adminUid, updated, subjects); showToast("Tozalandi");
                    }
                  }} className={`px-6 py-4 ${isDarkMode ? 'bg-red-500/5 hover:bg-red-500 text-red-500' : 'bg-red-50 hover:bg-red-500 text-red-600'} hover:text-white rounded-2xl font-black text-[10px] transition-all flex items-center gap-2 border border-red-500/10 uppercase`}>Bo'limni Tozalash</button>
                  <label className={`px-6 py-4 ${isDarkMode ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08]' : 'bg-white border-slate-200 hover:bg-slate-50'} border rounded-2xl cursor-pointer font-black text-[10px] flex items-center gap-2 transition-all uppercase`}>
                    <FileUp size={18} className="text-orange-500" /> Word Yuklash
                    <input type="file" className="hidden" accept=".docx" onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      try {
                        showToast("Yuklanmoqda...");
                        const arrayBuffer = await file.arrayBuffer();
                        const res = await mammoth.convertToHtml({ arrayBuffer });
                        const parsed = parseWordQuiz(res.value);
                        const imported = parsed.map(q => ({
                          uid: Math.random().toString(36).substr(2, 9),
                          text: cleanText(q.text),
                          options: (q.options || []).map(o => cleanText(o)),
                          correctAnswer: String(q.correct),
                          subjectId: selectedSubject?.id || null
                        }));
                        setQuestions([...questions, ...imported]);
                        showToast(`${imported.length} ta savol!`);
                      } catch (err) { alert("Xatolik!"); }
                    }} />
                  </label>
                </div>
              </div>

              <div className="grid gap-6 pb-10">
                {currentQuestions.map((q, qIdx) => (
                  <div key={q.uid} className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-10 rounded-[40px] space-y-8 hover:border-orange-500/10 transition-all group shadow-xl`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 ${isDarkMode ? 'bg-white/5 text-white/30 border-white/5' : 'bg-slate-50 text-slate-400 border-slate-100'} border rounded-xl text-[9px] font-black uppercase tracking-widest`}>SAVOL #{currentQuestions.length - qIdx}</span>
                        {!selectedSubject && q.subjectId && (
                          <span className="px-4 py-1.5 bg-orange-500/10 text-orange-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-500/10">
                            {subjects.find(s => s.id === q.subjectId)?.name || "Noma'lum Fan"}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setQuestions(questions.filter(it => it.uid !== q.uid))} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'text-white/5' : 'text-slate-200'} hover:bg-red-500/10 hover:text-red-500 transition-all`}><Trash2 size={20} /></button>
                    </div>
                    <textarea
                      value={q.text}
                      onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].text = e.target.value; setQuestions(u); }}
                      className={`w-full bg-transparent border-none text-2xl font-black focus:outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'} resize-none`}
                      rows={2}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = String(q.correctAnswer) === String(oIdx);
                        return (
                          <div key={oIdx} className={`p-6 rounded-3xl border-2 transition-all flex items-start gap-5 ${isCorrect ? 'border-green-500 bg-green-500/[0.02]' : (isDarkMode ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50')}`}>
                            <button onClick={() => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].correctAnswer = String(oIdx); setQuestions(u); }} className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-lg transition-all ${isCorrect ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : (isDarkMode ? 'bg-white/5 text-white/20' : 'bg-white text-slate-300 shadow-sm')}`}>{isCorrect ? <Check size={24} strokeWidth={4} /> : String.fromCharCode(65 + oIdx)}</button>
                            <textarea value={opt} onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].options[oIdx] = e.target.value; setQuestions(u); }} className={`flex-1 bg-transparent border-none font-bold text-base focus:outline-none resize-none ${isDarkMode ? 'text-white' : 'text-slate-700'} pt-2`} rows={2} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {currentQuestions.length === 0 && (
                  <div className="py-40 text-center space-y-6">
                    <div className={`w-24 h-24 ${isDarkMode ? 'bg-white/[0.02] text-white/10' : 'bg-slate-50 text-slate-200'} rounded-full flex items-center justify-center mx-auto`}><BookOpen size={48} /></div>
                    <p className={`${isDarkMode ? 'text-white/20' : 'text-slate-400'} font-bold`}>Hozircha savollar yo'q. Yangi savol qo'shing yoki Word fayl yuklang.</p>
                  </div>
                )}
              </div>

              <div className="fixed bottom-10 right-10 z-[100]">
                <button onClick={() => storage.saveQuestions(adminUid, questions, subjects).then(() => showToast("Barcha o'zgarishlar saqlandi!"))} className="flex items-center gap-4 px-10 py-5 bg-orange-500 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-white">
                  <Save size={24} /> SAQLASH
                </button>
              </div>
            </div>
          )}

          {activeTab === 'groups' && !selectedGroup && (
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-10 rounded-[40px] space-y-8 sticky top-10`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/20"><UserPlus size={24} /></div>
                    <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Yangi Guruh</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase ${isDarkMode ? 'text-white/20' : 'text-slate-400'} ml-4 tracking-widest`}>Guruh nomi</label>
                      <input 
                        className={`w-full ${isDarkMode ? 'bg-white/[0.03] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-blue-500 transition-all`} 
                        value={newGroupName} 
                        onChange={e => setNewGroupName(e.target.value)} 
                        placeholder="Masalan: 941-21" 
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!newGroupName.trim()) return;
                        const group = { id: Date.now(), name: newGroupName.trim(), assignedSubjects: [] };
                        const updatedGroups = [...(settings.groups || []), group];
                        const updatedSettings = { ...settings, groups: updatedGroups };
                        await storage.saveSettings(adminUid, updatedSettings);
                        setSettings(updatedSettings);
                        setNewGroupName('');
                        showToast("Guruh qo'shildi!");
                      }} 
                      className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xl text-white shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all uppercase tracking-widest"
                    >
                      GURUHNI QO'SHISH
                    </button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h3 className={`text-xl font-black flex items-center gap-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Barcha Guruhlar <span className={`px-3 py-1 ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'} rounded-lg text-[10px]`}>{(settings.groups || []).length} ta</span></h3>
                </div>
                <div className="grid gap-6">
                  {(settings.groups || []).map(g => {
                    const groupResults = results.filter(r => r.student?.group === g.name);
                    const avgScore = groupResults.length > 0 ? Math.round(groupResults.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / groupResults.length) : 0;
                    
                    return (
                      <div key={g.id} className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-200/50'} border p-8 rounded-[32px] flex justify-between items-center transition-all group cursor-pointer`} onClick={() => setSelectedGroup(g)}>
                        <div className="flex items-center gap-6">
                          <div className={`w-16 h-16 ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'} rounded-[20px] flex items-center justify-center text-blue-500 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-blue-500/5`}>
                            {g.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className={`font-black text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-blue-500 transition-colors`}>{g.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <p className={`text-[10px] font-bold ${isDarkMode ? 'text-white/20' : 'text-slate-400'} uppercase tracking-widest`}>{(g.assignedSubjects || []).length} ta fan biriktirilgan</p>
                              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                              <p className={`text-[10px] font-black text-blue-500 uppercase tracking-widest`}>{avgScore}% o'zlashtirish</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right mr-4 hidden sm:block">
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${avgScore}%` }}></div>
                            </div>
                          </div>
                          <ChevronRight className={`${isDarkMode ? 'text-white/10' : 'text-slate-200'} group-hover:text-blue-500 transition-all`} size={24} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'groups' && selectedGroup && (() => {
            // Guruh nomi bilan mos keladigan sessionlarni topamiz
            const groupSessions = sessions.filter(s => 
              s.name.trim().toLowerCase() === selectedGroup.name.trim().toLowerCase()
            );
            const groupSessionIds = groupSessions.map(s => s.id);

            // O'sha sessionlardan kirgan talabalarning natijalarini olamiz
            const groupResults = results.filter(r => groupSessionIds.includes(r.sessionId));

            // Umumiy o'zlashtirish foizi
            const overallAvg = groupResults.length > 0 
              ? Math.round(groupResults.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / groupResults.length)
              : 0;

            return (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <button onClick={() => setSelectedGroup(null)} className={`w-14 h-14 rounded-2xl ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all shadow-lg active:scale-95`}><ArrowLeft size={24} /></button>
                    <div>
                      <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedGroup.name}</h2>
                      <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/20' : 'text-slate-400'} mt-1`}>Guruh tahlili va boshqarish</p>
                    </div>
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Guruhni o'chirmoqchimisiz?")) {
                        const updatedGroups = settings.groups.filter(it => it.id !== selectedGroup.id);
                        const updatedSettings = { ...settings, groups: updatedGroups };
                        await storage.saveSettings(adminUid, updatedSettings);
                        setSettings(updatedSettings);
                        setSelectedGroup(null);
                        showToast("Guruh o'chirildi");
                      }
                    }}
                    className="px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-xs transition-all uppercase tracking-widest flex items-center gap-2"
                  >
                    <Trash2 size={18} /> GURUHNI O'CHIRISH
                  </button>
                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                  {/* Fan Biriktirish */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-10 rounded-[40px] space-y-8`}>
                      <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-3`}>
                        <Library size={20} className="text-blue-500" /> Fan Biriktirish
                      </h3>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {subjects.map(sub => {
                          const isAssigned = (selectedGroup.assignedSubjects || []).includes(sub.id);
                          return (
                            <div key={sub.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${isAssigned ? 'border-blue-500/50 bg-blue-500/5' : (isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50')}`}>
                              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{sub.name}</span>
                              <button 
                                onClick={async () => {
                                  const currentAssigned = selectedGroup.assignedSubjects || [];
                                  const newAssigned = isAssigned 
                                    ? currentAssigned.filter(id => id !== sub.id) 
                                    : [...currentAssigned, sub.id];
                                  const updatedGroup = { ...selectedGroup, assignedSubjects: newAssigned };
                                  const updatedGroups = settings.groups.map(g => g.id === selectedGroup.id ? updatedGroup : g);
                                  const updatedSettings = { ...settings, groups: updatedGroups };
                                  await storage.saveSettings(adminUid, updatedSettings);
                                  setSettings(updatedSettings);
                                  setSelectedGroup(updatedGroup);
                                  showToast(isAssigned ? "Fan ajratildi" : "Fan biriktirildi");
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isAssigned ? 'bg-blue-500 text-white' : (isDarkMode ? 'bg-white/5 text-white/20' : 'bg-white text-slate-300 shadow-sm hover:text-blue-500')}`}
                              >
                                {isAssigned ? <Check size={20} /> : <Plus size={20} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bog'liq linklar */}
                      <div className="pt-4 border-t border-white/5">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>Bog'liq Havolalar</p>
                        {groupSessions.length > 0 ? groupSessions.map(gs => (
                          <div key={gs.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-2 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                            <Link2 size={14} className="text-blue-500" />
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>{gs.name}</span>
                            <span className={`text-[9px] ml-auto ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>{gs.questionIds?.length || 0} savol</span>
                          </div>
                        )) : (
                          <p className={`text-xs ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
                            "{selectedGroup.name}" nomli havola topilmadi
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Natijalar va Tahlil */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Umumiy statistika */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className={`${isDarkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'} border p-10 rounded-[40px] space-y-4`}>
                        <p className={`text-[10px] font-black ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} uppercase tracking-[0.4em]`}>Umumiy O'zlashtirish</p>
                        <h3 className={`text-6xl font-[1000] ${isDarkMode ? 'text-white' : 'text-blue-900'} tracking-tighter`}>{overallAvg}%</h3>
                      </div>
                      <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200'} border p-10 rounded-[40px] space-y-4`}>
                        <p className={`text-[10px] font-black ${isDarkMode ? 'text-white/20' : 'text-slate-400'} uppercase tracking-[0.4em]`}>Imtihonlar Soni</p>
                        <h3 className={`text-6xl font-[1000] ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tighter`}>{groupResults.length}</h3>
                      </div>
                    </div>

                    {/* Fanlar bo'yicha tahlil */}
                    <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200'} border rounded-[40px] overflow-hidden shadow-2xl`}>
                      <div className="p-8 border-b border-white/5">
                        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Fanlar Bo'yicha Tahlil</h3>
                      </div>
                      <div className="divide-y divide-white/5">
                        {(selectedGroup.assignedSubjects || []).map(subId => {
                          const sub = subjects.find(s => s.id === subId);
                          if (!sub) return null;
                          // O'sha fanga tegishli sessionlardagi natijalar
                          const subSessionIds = groupSessions
                            .filter(gs => (gs.questionIds || []).some(qId => {
                              const q = questions.find(qq => qq.uid === qId);
                              return q && String(q.subjectId) === String(subId);
                            }))
                            .map(gs => gs.id);
                          const subResults = groupResults.filter(r => subSessionIds.includes(r.sessionId));
                          // Agar bo'sh bo'lsa barcha guruh natijalarini ko'rsat
                          const displayResults = subResults.length > 0 ? subResults : groupResults;
                          const avg = displayResults.length > 0 
                            ? Math.round(displayResults.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / displayResults.length) 
                            : 0;
                          return (
                            <div key={subId} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                              <div className="space-y-1">
                                <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sub.name}</h4>
                                <p className={`text-[10px] font-bold ${isDarkMode ? 'text-white/20' : 'text-slate-400'} uppercase tracking-widest`}>{displayResults.length} ta natija</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-2xl font-black ${avg >= 70 ? 'text-green-500' : (avg >= 40 ? 'text-orange-500' : 'text-red-500')}`}>{avg}%</p>
                                <div className="w-32 h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
                                  <div className={`h-full ${avg >= 70 ? 'bg-green-500' : (avg >= 40 ? 'bg-orange-500' : 'bg-red-500')}`} style={{ width: `${avg}%` }}></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {(selectedGroup.assignedSubjects || []).length === 0 && (
                          <div className="p-16 text-center text-white/20 font-bold uppercase tracking-widest text-xs">Hali fanlar biriktirilmagan</div>
                        )}
                      </div>
                    </div>

                    {/* Talabalar ro'yxati */}
                    <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200'} border rounded-[40px] overflow-hidden shadow-2xl`}>
                      <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-3`}>
                          <Users size={20} className="text-blue-500" /> Talabalar Ro'yxati
                        </h3>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
                          {groupResults.length} ta
                        </span>
                      </div>
                      {groupResults.length === 0 ? (
                        <div className="p-16 text-center">
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
                            "{selectedGroup.name}" nomli havola orqali hali hech kim kirmagan
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                          {groupResults.map((r, idx) => {
                            const pct = Math.round((r.score / r.total) * 100);
                            return (
                              <div key={r.id || idx} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                      {r.student?.name} {r.student?.surname}
                                    </p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/20' : 'text-slate-400'}`}>
                                      {new Date(r.date).toLocaleDateString('uz-UZ')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xl font-black ${pct >= 70 ? 'text-green-500' : (pct >= 40 ? 'text-orange-500' : 'text-red-500')}`}>
                                    {r.score}/{r.total}
                                  </p>
                                  <p className={`text-[10px] font-bold ${pct >= 70 ? 'text-green-500' : (pct >= 40 ? 'text-orange-500' : 'text-red-500')}`}>
                                    {pct}%
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}


          {activeTab === 'sessions' && (
            <div className="grid lg:grid-cols-12 gap-10 pb-10">
              <div className="lg:col-span-5">
                <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-10 rounded-[40px] space-y-8 sticky top-10`}>
                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Yangi Havola</h3>
                  <div className="space-y-6">
                    <div className="space-y-2"><label className={`text-[9px] font-black uppercase ${isDarkMode ? 'text-white/20' : 'text-slate-400'} ml-4 tracking-widest`}>Guruh nomi</label><input className={`w-full ${isDarkMode ? 'bg-white/[0.03] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-orange-500 transition-all`} value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Masalan: 401-Guruh" /></div>
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase ${isDarkMode ? 'text-white/20' : 'text-slate-400'} ml-4 tracking-widest`}>Fanni tanlang</label>
                      <select 
                        className={`w-full ${isDarkMode ? 'bg-[#111] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-2xl px-6 py-4 text-lg font-black outline-none focus:border-orange-500 transition-all`}
                        onChange={(e) => {
                          const subId = e.target.value;
                          const subQs = subId ? questions.filter(q => q.subjectId === subId) : questions;
                          setSessionQCount(Math.min(20, subQs.length));
                        }}
                        id="session-subject-select"
                      >
                        <option value="">Barcha savollardan</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2"><label className={`text-[9px] font-black uppercase ${isDarkMode ? 'text-white/20' : 'text-slate-400'} ml-4 tracking-widest`}>Savollar soni</label><input type="number" className={`w-full ${isDarkMode ? 'bg-white/[0.03] text-white border-white/10' : 'bg-slate-50 text-slate-900 border-slate-200'} border rounded-2xl px-6 py-4 text-xl font-black outline-none focus:border-orange-500 transition-all`} value={sessionQCount} onChange={e => setSessionQCount(e.target.value)} /></div>
                    <button onClick={async () => {
                      const subId = document.getElementById('session-subject-select').value;
                      const pool = subId ? questions.filter(q => q.subjectId === subId) : questions;
                      const requestedCount = parseInt(sessionQCount);
                      const finalCount = (isNaN(requestedCount) || requestedCount <= 0) ? 20 : requestedCount;
                      const qIds = [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.min(finalCount, pool.length)).map(q => q.uid);
                      if (qIds.length === 0) return alert("Savollar mavjud emas!");
                      await storage.saveQuestions(adminUid, questions);
                      storage.saveSession(adminUid, { name: sessionName || 'Yangi Test', questionIds: qIds }).then(s => { if (s) { setSessions([s, ...sessions]); setSessionName(''); showToast("Yaratildi"); } });
                    }} className="w-full bg-orange-500 py-5 rounded-2xl font-black text-xl text-white shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all">YARATISH</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className={`text-xl font-black px-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Havolalar</h3>
                <div className="grid gap-4">
                  {sessions.map(s => {
                    const qCount = (() => { try { const ids = typeof s.questionIds === 'string' ? JSON.parse(s.questionIds) : s.questionIds; return Array.isArray(ids) ? ids.length : 0; } catch (e) { return 0; } })();
                    return (
                      <div key={s.id} className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50'} border p-8 rounded-3xl flex justify-between items-center hover:border-orange-500/30 transition-all group shadow-xl`}>
                        <div><h4 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{s.name}</h4><p className="text-orange-500 text-[10px] font-black mt-1 uppercase tracking-widest">{qCount} SAVOL</p></div>
                        <div className="flex gap-3">
                          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quiz?testId=${adminUid}_${s.id}`); showToast("Nusxalandi"); }} className={`w-12 h-12 ${isDarkMode ? 'bg-white/[0.03] text-white/20' : 'bg-slate-50 text-slate-300'} rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center`}><Copy size={20} /></button>
                          <button onClick={() => { if (window.confirm("O'chirilsinmi?")) { storage.deleteSession(adminUid, s.id).then(() => setSessions(sessions.filter(it => it.id !== s.id))); } }} className={`w-12 h-12 ${isDarkMode ? 'bg-white/[0.03] text-white/20' : 'bg-slate-50 text-slate-300'} rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center`}><Trash2 size={20} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/40'} border rounded-[40px] overflow-hidden pb-20`}>
              <div className={`p-10 flex justify-between items-center border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Natijalar</h3>
                <button onClick={() => window.print()} className="px-8 py-4 bg-green-600 rounded-xl font-black text-xs text-white transition-all shadow-lg shadow-green-900/10">PRINT (PDF)</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className={`${isDarkMode ? 'bg-white/[0.01] text-white/20 border-white/5' : 'bg-slate-50 text-slate-400 border-slate-100'} text-[10px] uppercase font-black tracking-widest border-b`}>
                    <tr><th className="p-10">Talaba</th><th className="p-10 text-center">Ball</th><th className="p-10 text-center">Baho</th><th className="p-10 text-right">Sana</th></tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id} className={`border-b ${isDarkMode ? 'border-white/5 hover:bg-white/[0.01]' : 'border-slate-50 hover:bg-slate-50/50'} transition-all group text-sm`}>
                        <td className="p-10 font-bold">
                          <p className={isDarkMode ? 'text-white' : 'text-slate-900'}>{r.student?.name} {r.student?.surname}</p>
                          <div className={`text-[10px] ${isDarkMode ? 'text-white/20' : 'text-slate-400'} font-medium mt-1`}>{r.student?.group} • {r.student?.faculty}</div>
                        </td>
                        <td className="p-10 text-center"><span className="font-black text-xl text-orange-500">{r.score}/{r.total}</span></td>
                        <td className="p-10 text-center font-black text-4xl text-orange-500">{r.grade}</td>
                        <td className={`p-10 text-right ${isDarkMode ? 'text-white/10' : 'text-slate-300'} text-xs`}>{new Date(r.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-10 pb-32">
              <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-12 rounded-[40px] space-y-10 shadow-2xl`}>
                <div className="space-y-1"><h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Baholash</h3><p className={`${isDarkMode ? 'text-white/30' : 'text-slate-400'} text-sm`}>Minimal ballar</p></div>
                <div className="space-y-4">
                  {criteria.map((c, i) => (
                    <div key={i} className={`flex justify-between items-center p-8 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} border rounded-3xl hover:border-orange-500/20 transition-all`}>
                      <div className="flex items-center gap-6"><span className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center text-2xl font-black text-white">{c.grade}</span><span className={`font-black ${isDarkMode ? 'text-white/20' : 'text-slate-300'} uppercase text-[10px]`}>Min. Ball</span></div>
                      <input type="number" className={`border ${isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} rounded-xl px-6 py-3 w-32 text-center text-2xl font-black focus:border-orange-500 outline-none transition-all`} value={c.min} onChange={e => { const u = [...criteria]; u[i].min = parseInt(e.target.value); setCriteria(u); }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Saqlandi"))} className="w-full bg-orange-500 py-6 rounded-2xl font-black text-xl text-white shadow-lg shadow-orange-900/10">SAQLASH</button>
              </div>
              <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border p-12 rounded-[40px] space-y-10 shadow-2xl`}>
                <div className="space-y-1"><h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Umumiy</h3><p className={`${isDarkMode ? 'text-white/30' : 'text-slate-400'} text-sm`}>Vaqt va hajm</p></div>
                <div className="space-y-8">
                  <div className="space-y-3"><label className={`text-[10px] font-black ${isDarkMode ? 'text-white/20' : 'text-slate-400'} uppercase tracking-widest ml-6`}>Savollar Soni</label><input type="number" className={`w-full ${isDarkMode ? 'bg-white/[0.02] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-[32px] px-8 py-6 text-4xl font-black focus:border-orange-500 outline-none`} value={settings.questionsPerTest} onChange={e => setSettings({ ...settings, questionsPerTest: parseInt(e.target.value) })} /></div>
                  <div className="space-y-3"><label className={`text-[10px] font-black ${isDarkMode ? 'text-white/20' : 'text-slate-400'} uppercase tracking-widest ml-6`}>Vaqt (Sekund / Savol)</label><input type="number" className={`w-full ${isDarkMode ? 'bg-white/[0.02] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-[32px] px-8 py-6 text-4xl font-black focus:border-orange-500 outline-none`} value={settings.timePerQuestion} onChange={e => setSettings({ ...settings, timePerQuestion: parseInt(e.target.value) })} /></div>
                </div>
                <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Saqlandi"))} className="w-full bg-orange-500 py-6 rounded-2xl font-black text-xl text-white shadow-lg shadow-orange-900/10">SAQLASH</button>
              </div>
            </div>
          )}

          {/* PROFIL BO'LIMI */}
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
              <div className="max-w-2xl mx-auto">
                {/* USTOZ KARTASI */}
                <div className={`${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'} border rounded-[48px] p-12 text-center space-y-8 relative overflow-hidden group shadow-2xl`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="w-40 h-40 bg-orange-500/10 rounded-[48px] flex items-center justify-center border-2 border-orange-500/20 mx-auto relative z-10 group-hover:scale-105 transition-transform duration-500 shadow-2xl shadow-orange-900/20">
                    <User size={80} className="text-orange-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div>
                      <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-tighter leading-none`}>{settings.teacherName || 'Ustoz'}</h3>
                      <p className={`text-[12px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'} font-black uppercase tracking-[0.4em] mt-4`}>{auth.currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="pt-10 grid grid-cols-2 gap-6 relative z-10">
                    <div className={`p-8 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} border rounded-[40px]`}>
                      <p className={`text-[12px] font-black ${isDarkMode ? 'text-white/20' : 'text-slate-300'} uppercase tracking-widest mb-2`}>Savollar</p>
                      <p className="text-5xl font-black text-orange-500">{questions.length}</p>
                    </div>
                    <div className={`p-8 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'} border rounded-[40px]`}>
                      <p className={`text-[12px] font-black ${isDarkMode ? 'text-white/20' : 'text-slate-300'} uppercase tracking-widest mb-2`}>Natijalar</p>
                      <p className="text-5xl font-black text-orange-500">{results.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
