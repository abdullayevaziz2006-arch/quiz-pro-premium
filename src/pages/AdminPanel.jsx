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
  Filter, Trash, Zap, Bug, RefreshCw, LayoutDashboard, Sparkles, UserPlus, Library, ArrowLeft
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
  const [settings, setSettings] = useState({ questionsPerTest: 20, timePerQuestion: 120 });
  const [sessionName, setSessionName] = useState('');
  const [sessionQCount, setSessionQCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUid, setAdminUid] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

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
      const cleanedQs = rawQs.map(q => {
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

      setQuestions(cleanedQs);
      setCriteria(Array.isArray(cr) ? cr : []);
      setResults(Array.isArray(rs) ? rs : []);
      setSessions(Array.isArray(ss) ? ss : []);
      
      // Sozlamalar va Fanlarni bitta obyektdan ajratib olamiz
      if (st) {
        setSettings(st);
        setSubjects(Array.isArray(st.subjects) ? st.subjects : []);
      }
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
        <div className="space-y-1">
          <h2 className="text-2xl font-black">{isRegisterMode ? "Ro'yxatdan o'tish" : "Xush Kelibsiz"}</h2>
          <p className="text-white/40 text-xs font-medium tracking-wide">{isRegisterMode ? "Yangi admin hisobini yarating" : "Boshqaruv paneliga kiring"}</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <div className="space-y-3">
            <input className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-orange-500 transition-all text-sm" type="email" name="email" placeholder="Email" required />
            <input className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-orange-500 transition-all text-sm" type="password" name="password" placeholder="Parol" required />
          </div>
          <button type="submit" className="w-full bg-orange-500 py-4 rounded-xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/10">
            {isRegisterMode ? "RO'YXATDAN O'TISH" : "KIRISH"}
          </button>
        </form>
        <button onClick={() => setIsRegisterMode(!isRegisterMode)} className="text-white/20 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
          {isRegisterMode ? "Akkauntingiz bormi? Kirish" : "Akkauntingiz yo'qmi? Ro'yxatdan o'tish"}
        </button>
      </div>
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
            <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] mt-1">Platinum v4.3</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedSubject(null); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 relative group ${activeTab === item.id ? 'bg-white/[0.03] text-orange-500' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.01]'}`}
            >
              {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-500 rounded-r-full"></div>}
              <item.icon size={20} className={activeTab === item.id ? 'text-orange-500' : 'text-white/10 group-hover:text-white/30'} />
              <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button onClick={() => auth.signOut()} className="w-full flex items-center justify-between px-6 py-4 bg-white/[0.02] rounded-2xl hover:bg-red-500/10 transition-all group">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-red-500">Chiqish</span>
            <LogOut size={16} className="text-white/10 group-hover:text-red-500" />
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
                <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Saqlandi"))} className="w-full bg-blue-600 py-6 rounded-2xl font-black text-xl shadow-lg shadow-blue-900/10">SAQLASH</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
