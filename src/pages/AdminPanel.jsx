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
  User, Settings2, Hash
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questions, setQuestions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [results, setResults] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  const [settings, setSettings] = useState({ questionsPerTest: 20, timePerQuestion: 120, teacherName: '', groups: [] });
  const [sessionName, setSessionName] = useState('');
  const [sessionQCount, setSessionQCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUid, setAdminUid] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showHemisModal, setShowHemisModal] = useState(false);
  const [hemisForm, setHemisForm] = useState({ domain: '', login: '', password: '' });

  const universities = [
    { name: "TATU (Toshkent)", domain: "hemis.tuit.uz" },
    { name: "Milliy Universitet (O'zMU)", domain: "hemis.nuu.uz" },
    { name: "SamDU (Samarqand)", domain: "hemis.samdu.uz" },
    { name: "TDPU (Nizomiy)", domain: "hemis.tspu.uz" },
    { name: "TTA (Akademiya)", domain: "hemis.tma.uz" },
    { name: "UrDU (Urganch)", domain: "hemis.urdu.uz" },
    { name: "FarDU (Farg'ona)", domain: "hemis.fardu.uz" },
    { name: "ADU (Andijon)", domain: "hemis.adu.uz" }
  ];

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
      return questions.filter(q => q.subjectId === selectedSubject.id);
    }
    return questions.filter(q => 
      (q.text || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, selectedSubject, activeTab, searchQuery]);

  if (!isAuthenticated && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-white font-sans selection:bg-orange-500/30">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/5 p-10 rounded-[32px] shadow-2xl space-y-8 text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-orange-900/20">
          {isRegisterMode ? <UserPlus size={36} /> : <Lock size={36} />}
        </div>
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">RANCH <span className="text-orange-500">PRO</span></h2>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Platinum v5.2</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <input name="email" type="email" placeholder="Email manzil" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 transition-all font-bold" required />
            <input name="password" type="password" placeholder="Parol" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-orange-500 transition-all font-bold" required />
          </div>
          <button type="submit" className="w-full bg-orange-500 py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-900/20 hover:bg-orange-600 transition-all">
            {isRegisterMode ? "RO'YXATDAN O'TISH" : "KIRISH"}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px]"><span className="bg-[#0a0a0a] px-4 text-white/20 font-black uppercase tracking-widest">Yoki</span></div>
        </div>

        {/* HEMIS LOGIN TUGMASI */}
        <button 
          onClick={() => setShowHemisModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCw size={20} className="animate-spin-slow" />
          HEMIS ORQALI KIRISH
        </button>

        <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-[10px] font-black text-white/20 hover:text-orange-500 transition-colors uppercase tracking-widest">
          {isRegisterMode ? "LOGIN ORQALI KIRISH" : "YANGI PROFIL YARATISH"}
        </button>
      </div>

      {/* HEMIS SMART LOGIN MODAL */}
      {showHemisModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowHemisModal(false)}></div>
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[48px] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/20">
                <RefreshCw size={32} className="text-blue-500 animate-spin-slow" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">HEMIS Smart Login</h3>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">Oliy ta'lim tizimi integratsiyasi</p>
            </div>

            <div className="space-y-6">
              {/* UNIVERSITET TANLASH */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Universitetni tanlang</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  value={hemisForm.domain}
                  onChange={(e) => setHemisForm({ ...hemisForm, domain: e.target.value })}
                >
                  <option value="" className="bg-[#0a0a0a]">-- Tanlang --</option>
                  {universities.map(u => (
                    <option key={u.domain} value={u.domain} className="bg-[#0a0a0a]">{u.name}</option>
                  ))}
                  <option value="other" className="bg-[#0a0a0a]">Boshqa (Manzilni yozish)</option>
                </select>
              </div>

              {hemisForm.domain === 'other' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">HEMIS Manzili</label>
                  <input 
                    type="text" 
                    placeholder="masalan: hemis.university.uz"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                    onChange={(e) => setHemisForm({ ...hemisForm, domain: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Login</label>
                <input 
                  type="text" 
                  placeholder="HEMIS Login"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  value={hemisForm.login}
                  onChange={(e) => setHemisForm({ ...hemisForm, login: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Parol</label>
                <input 
                  type="password" 
                  placeholder="HEMIS Parol"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  value={hemisForm.password}
                  onChange={(e) => setHemisForm({ ...hemisForm, password: e.target.value })}
                />
              </div>

              <button 
                onClick={() => {
                  if (!hemisForm.domain || !hemisForm.login || !hemisForm.password) return alert("Barcha maydonlarni to'ldiring!");
                  showToast("HEMIS orqali kirilmoqda...");
                  setTimeout(() => {
                    setIsAuthenticated(true);
                    setShowHemisModal(false);
                    // Ma'lumotlarni yuklash (Simulyatsiya)
                    const mockGroups = [{ id: 1, name: '911-Guruh' }, { id: 2, name: '912-Guruh' }];
                    setSettings(prev => ({ ...prev, teacherName: hemisForm.login.toUpperCase(), groups: mockGroups, hemisDomain: hemisForm.domain }));
                    setSubjects([{ id: 'h1', name: 'Mutaxassislik fani' }]);
                    showToast("Muvaffaqiyatli bog'landi!");
                  }, 2000);
                }}
                className="w-full bg-blue-600 py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle size={24} /> TIZIMGA ULASH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-bold text-xl animate-pulse">Yuklanmoqda...</div>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Fanlar', icon: Library },
    { id: 'questions', label: 'Barcha Savollar', icon: BookOpen },
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
    <div className="flex min-h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-orange-500/20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-3 rounded-full bg-white text-black shadow-2xl animate-in slide-in-from-top-4 duration-500 font-bold text-sm flex items-center gap-3">
          <Sparkles className="text-orange-500" size={18} /> {toast}
        </div>
      )}

      {/* Sidebar Menu */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-8 sticky top-0 h-screen shrink-0 relative z-50">
        <div className="mb-12 flex items-center gap-3 px-1">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20"><Zap size={20} className="fill-white" /></div>
          <div>
            <h1 className="text-xl font-black tracking-tighter leading-none">RANCH <span className="text-orange-500">PRO</span></h1>
            <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Platinum v5.0</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedSubject(null);
                setShowSessionModal(false);
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
          {/* PROFIL TUGMASI (PASTGA QAYTARILDI VA BOSILADIGAN BO'LDI) */}
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
              <p className={`text-[10px] font-black truncate uppercase tracking-widest mb-0.5 ${activeTab === 'profile' ? 'text-white' : 'text-white'}`}>
                {settings.teacherName || 'Ustoz'}
              </p>
              <p className={`text-[9px] truncate font-bold uppercase tracking-tighter ${activeTab === 'profile' ? 'text-white/60' : 'text-white/20'}`}>
                {auth.currentUser?.email || 'admin@ranch.pro'}
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold tracking-tight uppercase">Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/[0.02] via-transparent to-transparent">
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
          
          <header className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/50">Tizim holati: Online</p>
              <h2 className="text-4xl font-black tracking-tight capitalize">
                {selectedSubject ? (
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedSubject(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"><ArrowLeft size={20} /></button>
                    <span>{selectedSubject.name} <span className="text-white/20 text-xl font-medium ml-2">/ Savollar</span></span>
                  </div>
                ) : activeTab}
              </h2>
            </div>
            <div className="flex gap-3">
              <button onClick={loadData} className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center hover:bg-white/[0.08] transition-all text-white/30 hover:text-white"><RefreshCw size={20} /></button>
              {(activeTab === 'questions' || selectedSubject) && (
                <button onClick={() => handleAddQuestion(selectedSubject?.id)} className="px-8 py-4 bg-orange-500 rounded-xl font-black text-xs shadow-lg shadow-orange-900/10 hover:scale-105 active:scale-95 transition-all text-white">+ QO'SHISH</button>
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
                <div key={i} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl space-y-6 hover:border-white/10 transition-all relative overflow-hidden group shadow-xl">
                  <div className={`w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform duration-500`}><s.icon size={24} /></div>
                  <div className="space-y-1"><p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{s.label}</p><h3 className="text-3xl font-black">{s.val}</h3></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'subjects' && !selectedSubject && (
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[40px] space-y-8 shadow-2xl sticky top-10">
                  <h3 className="text-2xl font-black">Yangi Fan</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Fan nomi</label>
                      <input className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white text-xl font-black outline-none focus:border-orange-500 transition-all" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Masalan: Matematika" />
                    </div>
                    <button onClick={async () => {
                      if (!newSubject.trim()) return;
                      const sub = { id: Date.now().toString(), name: newSubject.trim() };
                      const updated = [sub, ...subjects];
                      await storage.saveSubjects(adminUid, updated);
                      setSubjects(updated);
                      setNewSubject('');
                      showToast("Fan qo'shildi!");
                    }} className="w-full bg-orange-500 py-5 rounded-2xl font-black text-xl shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all">FANNI QO'SHISH</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black px-4 flex items-center gap-4">Barcha Fanlar <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-white/40">{subjects.length} ta</span></h3>
                <div className="grid gap-4">
                  {subjects.map(s => {
                    const qCount = questions.filter(q => q.subjectId === s.id).length;
                    return (
                      <div key={s.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl flex justify-between items-center hover:border-orange-500/30 transition-all group shadow-xl cursor-pointer" onClick={() => setSelectedSubject(s)}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange-500"><Library size={20} /></div>
                          <div>
                            <h4 className="font-black text-lg group-hover:text-orange-500 transition-colors">{s.name}</h4>
                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{qCount} ta savol</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <ChevronRight className="text-white/10 group-hover:text-orange-500 transition-all" size={24} />
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm("Fanni o'chirmoqchimisiz?")) {
                              const updated = subjects.filter(it => it.id !== s.id);
                              await storage.saveSubjects(adminUid, updated);
                              setSubjects(updated);
                              showToast("Fan o'chirildi");
                            }
                          }} className="w-10 h-10 bg-white/[0.03] rounded-xl hover:bg-red-500 hover:text-white transition-all text-white/20 flex items-center justify-center"><Trash2 size={18} /></button>
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
              <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-wrap justify-between items-center gap-6 shadow-xl">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-16 py-4 text-white text-lg font-bold outline-none focus:border-orange-500/50 transition-all" placeholder="Savollarni qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button onClick={async () => {
                    if (window.confirm("Ushbu bo'limdagi barcha savollar o'chirilsinmi?")) {
                      const updated = questions.filter(q => selectedSubject ? q.subjectId !== selectedSubject.id : false);
                      setQuestions(updated); await storage.saveQuestions(adminUid, updated); showToast("Tozalandi");
                    }
                  }} className="px-6 py-4 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-[10px] transition-all flex items-center gap-2 border border-red-500/10 uppercase">Bo'limni Tozalash</button>
                  <label className="px-6 py-4 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl cursor-pointer font-black text-[10px] flex items-center gap-2 transition-all border border-white/5 uppercase">
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

              <div className="grid gap-6 pb-40">
                {currentQuestions.map((q, qIdx) => (
                  <div key={q.uid} className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[40px] space-y-8 hover:border-white/10 transition-all group shadow-xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-white/5 text-white/30 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5">SAVOL #{currentQuestions.length - qIdx}</span>
                        {!selectedSubject && q.subjectId && (
                          <span className="px-4 py-1.5 bg-orange-500/10 text-orange-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-500/10">
                            {subjects.find(s => s.id === q.subjectId)?.name || "Noma'lum Fan"}
                          </span>
                        )}
                      </div>
                      <button onClick={() => setQuestions(questions.filter(it => it.uid !== q.uid))} className="w-10 h-10 rounded-xl flex items-center justify-center text-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                    </div>
                    <textarea
                      value={q.text}
                      onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].text = e.target.value; setQuestions(u); }}
                      className="w-full bg-transparent border-none text-2xl font-black focus:outline-none text-white resize-none"
                      rows={2}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = String(q.correctAnswer) === String(oIdx);
                        return (
                          <div key={oIdx} className={`p-6 rounded-3xl border-2 transition-all flex items-start gap-5 ${isCorrect ? 'border-green-500 bg-green-500/[0.02]' : 'border-white/5 bg-white/[0.01]'}`}>
                            <button onClick={() => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].correctAnswer = String(oIdx); setQuestions(u); }} className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-lg transition-all ${isCorrect ? 'bg-green-500 text-white' : 'bg-white/5 text-white/20'}`}>{isCorrect ? <Check size={24} strokeWidth={4} /> : String.fromCharCode(65 + oIdx)}</button>
                            <textarea value={opt} onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].options[oIdx] = e.target.value; setQuestions(u); }} className="flex-1 bg-transparent border-none font-bold text-base focus:outline-none resize-none text-white pt-2" rows={2} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {currentQuestions.length === 0 && (
                  <div className="py-40 text-center space-y-6">
                    <div className="w-24 h-24 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto text-white/10"><BookOpen size={48} /></div>
                    <p className="text-white/20 font-bold">Hozircha savollar yo'q. Yangi savol qo'shing yoki Word fayl yuklang.</p>
                  </div>
                )}
              </div>

              <div className="fixed bottom-10 right-10 z-[100]">
                <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Barcha o'zgarishlar saqlandi!"))} className="flex items-center gap-4 px-10 py-5 bg-orange-500 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-white">
                  <Save size={24} /> SAQLASH
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="grid lg:grid-cols-12 gap-10 pb-20">
              <div className="lg:col-span-5">
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[40px] space-y-8 shadow-2xl sticky top-10">
                  <h3 className="text-2xl font-black">Yangi Havola</h3>
                  <div className="space-y-6">
                    <div className="space-y-2"><label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Guruh nomi</label><input className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white text-xl font-black outline-none focus:border-orange-500 transition-all" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Masalan: 401-Guruh" /></div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Fanni tanlang</label>
                      <select 
                        className="w-full bg-[#111] border border-white/10 rounded-2xl px-6 py-4 text-white text-lg font-black outline-none focus:border-orange-500 transition-all"
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
                    <div className="space-y-2"><label className="text-[9px] font-black uppercase text-white/20 ml-4 tracking-widest">Savollar soni</label><input type="number" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white text-xl font-black outline-none focus:border-orange-500 transition-all" value={sessionQCount} onChange={e => setSessionQCount(e.target.value)} /></div>
                    <button onClick={async () => {
                      const subId = document.getElementById('session-subject-select').value;
                      const pool = subId ? questions.filter(q => q.subjectId === subId) : questions;
                      const requestedCount = parseInt(sessionQCount);
                      const finalCount = (isNaN(requestedCount) || requestedCount <= 0) ? 20 : requestedCount;
                      const qIds = [...pool].sort(() => 0.5 - Math.random()).slice(0, Math.min(finalCount, pool.length)).map(q => q.uid);
                      if (qIds.length === 0) return alert("Savollar mavjud emas!");
                      await storage.saveQuestions(adminUid, questions);
                      storage.saveSession(adminUid, { name: sessionName || 'Yangi Test', questionIds: qIds }).then(s => { if (s) { setSessions([s, ...sessions]); setSessionName(''); showToast("Yaratildi"); } });
                    }} className="w-full bg-orange-500 py-5 rounded-2xl font-black text-xl shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all">YARATISH</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black px-4">Havolalar</h3>
                <div className="grid gap-4">
                  {sessions.map(s => {
                    const qCount = (() => { try { const ids = typeof s.questionIds === 'string' ? JSON.parse(s.questionIds) : s.questionIds; return Array.isArray(ids) ? ids.length : 0; } catch (e) { return 0; } })();
                    return (
                      <div key={s.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex justify-between items-center hover:border-orange-500/30 transition-all group shadow-xl">
                        <div><h4 className="font-black text-xl">{s.name}</h4><p className="text-orange-500 text-[10px] font-black mt-1 uppercase tracking-widest">{qCount} SAVOL</p></div>
                        <div className="flex gap-3">
                          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quiz?testId=${adminUid}_${s.id}`); showToast("Nusxalandi"); }} className="w-12 h-12 bg-white/[0.03] rounded-xl hover:bg-orange-500 hover:text-white transition-all text-white/20 flex items-center justify-center"><Copy size={20} /></button>
                          <button onClick={() => { if (window.confirm("O'chirilsinmi?")) { storage.deleteSession(adminUid, s.id).then(() => setSessions(sessions.filter(it => it.id !== s.id))); } }} className="w-12 h-12 bg-white/[0.03] rounded-xl hover:bg-red-500 hover:text-white transition-all text-white/20 flex items-center justify-center"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl pb-20">
              <div className="p-10 flex justify-between items-center border-b border-white/5">
                <h3 className="text-2xl font-black">Natijalar</h3>
                <button onClick={() => window.print()} className="px-8 py-4 bg-green-600 rounded-xl font-black text-xs text-white transition-all shadow-lg shadow-green-900/10">PRINT (PDF)</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.01] text-white/20 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                    <tr><th className="p-10">Talaba</th><th className="p-10 text-center">Ball</th><th className="p-10 text-center">Baho</th><th className="p-10 text-right">Sana</th></tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group text-sm">
                        <td className="p-10 font-bold">
                          {r.student?.name} {r.student?.surname}
                          <div className="text-[10px] text-white/20 font-medium mt-1">{r.student?.group} • {r.student?.faculty}</div>
                        </td>
                        <td className="p-10 text-center"><span className="font-black text-xl text-orange-500">{r.score}/{r.total}</span></td>
                        <td className="p-10 text-center font-black text-4xl text-orange-500">{r.grade}</td>
                        <td className="p-10 text-right text-white/10 text-xs">{new Date(r.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-10 pb-32">
              <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[40px] space-y-10 shadow-2xl">
                <div className="space-y-1"><h3 className="text-2xl font-black">Baholash</h3><p className="text-white/30 text-sm">Minimal ballar</p></div>
                <div className="space-y-4">
                  {criteria.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-orange-500/20 transition-all">
                      <div className="flex items-center gap-6"><span className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center text-2xl font-black text-white">{c.grade}</span><span className="font-black text-white/20 uppercase text-[10px]">Min. Ball</span></div>
                      <input type="number" className="bg-black border border-white/10 rounded-xl px-6 py-3 w-32 text-center text-white text-2xl font-black focus:border-orange-500 outline-none transition-all" value={c.min} onChange={e => { const u = [...criteria]; u[i].min = parseInt(e.target.value); setCriteria(u); }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Saqlandi"))} className="w-full bg-orange-500 py-6 rounded-2xl font-black text-xl shadow-lg shadow-orange-900/10">SAQLASH</button>
              </div>
              <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[40px] space-y-10 shadow-2xl">
                <div className="space-y-1"><h3 className="text-2xl font-black">Umumiy</h3><p className="text-white/30 text-sm">Vaqt va hajm</p></div>
                <div className="space-y-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-6">Savollar Soni</label><input type="number" className="w-full bg-white/[0.02] border border-white/10 rounded-[32px] px-8 py-6 text-4xl font-black text-white focus:border-orange-500 outline-none" value={settings.questionsPerTest} onChange={e => setSettings({ ...settings, questionsPerTest: parseInt(e.target.value) })} /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-6">Vaqt (Sekund / Savol)</label><input type="number" className="w-full bg-white/[0.02] border border-white/10 rounded-[32px] px-8 py-6 text-4xl font-black text-white focus:border-orange-500 outline-none" value={settings.timePerQuestion} onChange={e => setSettings({ ...settings, timePerQuestion: parseInt(e.target.value) })} /></div>
                </div>
                <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Saqlandi"))} className="w-full bg-orange-500 py-6 rounded-2xl font-black text-xl shadow-lg shadow-orange-900/10">SAQLASH</button>
              </div>
            </div>
          )}

          {/* PROFIL BO'LIMI */}
          {activeTab === 'profile' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* USTOZ KARTASI */}
                <div className="lg:col-span-1">
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-[48px] p-10 text-center space-y-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="w-32 h-32 bg-orange-500/10 rounded-[40px] flex items-center justify-center border-2 border-orange-500/20 mx-auto relative z-10 group-hover:scale-105 transition-transform duration-500 shadow-xl shadow-orange-900/20">
                      <User size={64} className="text-orange-500" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{settings.teacherName || 'Ustoz'}</h3>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-4">{auth.currentUser?.email}</p>
                    </div>
                    <div className="pt-8 grid grid-cols-2 gap-4 relative z-10">
                      <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Savollar</p>
                        <p className="text-3xl font-black text-orange-500">{questions.length}</p>
                      </div>
                      <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Natijalar</p>
                        <p className="text-3xl font-black text-orange-500">{results.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GURUHLAR VA STATISTIKA */}
                <div className="lg:col-span-2 space-y-10">
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-[48px] p-10 space-y-8 shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-900/20">
                          <Users className="text-orange-500" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">Guruhlar Ro'yhati</h3>
                          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Sinf va guruhlarni boshqarish</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                          onClick={() => {
                            const name = prompt("Guruh nomini kiriting:");
                            if (name) {
                              const newGroups = [...(settings.groups || []), { id: Date.now(), name }];
                              const updated = { ...settings, groups: newGroups };
                              setSettings(updated);
                              storage.saveSettings(adminUid, updated);
                              storage.saveSubjects(adminUid, subjects);
                            }
                          }}
                          className="flex-1 sm:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                          <Plus size={16} /> Qo'shish
                        </button>
                        
                        {/* HEMIS INTEGRATSIYASI TUGMASI */}
                        <button 
                          onClick={() => {
                            const domain = prompt("Universitet HEMIS manzilini kiriting (masalan: hemis.tuit.uz):", settings.hemisDomain || '');
                            const token = prompt("API Tokenni kiriting:", settings.hemisToken || '');
                            if (domain && token) {
                              const updated = { ...settings, hemisDomain: domain, hemisToken: token };
                              setSettings(updated);
                              storage.saveSettings(adminUid, updated);
                              showToast("HEMIS ma'lumotlari saqlandi!");
                            }
                          }}
                          className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={16} /> HEMIS Ulash
                        </button>
                      </div>
                    </div>

                    {/* HEMIS HOLATI */}
                    {settings.hemisDomain && (
                      <div className="flex items-center gap-3 px-6 py-4 bg-blue-500/5 border border-blue-500/20 rounded-[24px]">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                          HEMIS Bog'langan: <span className="text-white ml-2">{settings.hemisDomain}</span>
                        </p>
                        <button 
                          onClick={() => {
                            showToast("Guruhlar yuklanmoqda...");
                            // Kelgusida API chaqiruvi shu yerda bo'ladi
                            setTimeout(() => alert("HEMIS API orqali guruhlarni yuklash uchun ruxsat kerak."), 1000);
                          }}
                          className="ml-auto text-[9px] font-black text-blue-400 hover:text-white uppercase tracking-tighter"
                        >
                          Guruhlarni Sinxronlash
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(!settings.groups || settings.groups.length === 0) ? (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                          <Sparkles className="mx-auto text-white/5 mb-4" size={48} />
                          <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Hali guruhlar qo'shilmagan</p>
                        </div>
                      ) : (
                        settings.groups.map(group => (
                          <div key={group.id} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-[32px] border border-white/5 group hover:border-orange-500/30 transition-all duration-500">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-xs border border-orange-500/10 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                {group.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-lg font-black text-white uppercase tracking-tight">{group.name}</span>
                            </div>
                            <button 
                              onClick={() => {
                                if (confirm("Guruhni o'chirmoqchimisiz?")) {
                                  const newGroups = settings.groups.filter(g => g.id !== group.id);
                                  const updated = { ...settings, groups: newGroups };
                                  setSettings(updated);
                                  storage.saveSettings(adminUid, updated);
                                  storage.saveSubjects(adminUid, subjects);
                                }
                              }}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-white/5 rounded-[48px] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-lg shadow-orange-900/20">
                        <BarChart3 className="text-orange-500" size={24} />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Umumiy Ko'rsatkichlar</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                      {[
                        { label: "O'rtacha Ball", value: `${stats.avgScore}%`, color: "text-white" },
                        { label: "O'rtacha Baho", value: stats.avgGrade, color: "text-orange-500" },
                        { label: "Top Natija", value: `${results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0}%`, color: "text-green-500" }
                      ].map((item, i) => (
                        <div key={i} className="p-8 bg-white/[0.02] rounded-[40px] border border-white/5 space-y-2 hover:bg-white/[0.04] transition-all duration-500">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{item.label}</p>
                          <p className={`text-3xl font-black ${item.color} tracking-tighter`}>{item.value}</p>
                        </div>
                      ))}
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
