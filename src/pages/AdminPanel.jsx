import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '../utils/storage';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { parseWordQuiz } from '../utils/wordParser';
import mammoth from 'mammoth';
import { 
  Plus, Trash2, Check, Copy, Share2, LogOut, 
  BookOpen, AlertCircle, CheckCircle, Link2,
  BarChart3, Award, FileUp, Save, Lock,
  Search, Download, Users, Settings, ChevronRight,
  Filter, Trash, Zap, Bug, RefreshCw, LayoutDashboard, Sparkles
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questions, setQuestions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [results, setResults] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState({ questionsPerTest: 20, timePerQuestion: 120 });
  const [sessionName, setSessionName] = useState('');
  const [sessionQCount, setSessionQCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUid, setAdminUid] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setAdminUid(user.uid);
      } else {
        setIsAuthenticated(false);
        setAdminUid(null);
        setLoading(false);
      }
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
          correctAnswer: String(c !== undefined ? c : '0')
        };
      });

      setQuestions(cleanedQs);
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

  const stats = useMemo(() => ({
    totalStudents: results?.length || 0,
    totalQuestions: questions?.length || 0,
    avgScore: results?.length > 0 ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length).toFixed(1) : 0,
    avgGrade: results?.length > 0 ? (results.reduce((acc, curr) => acc + parseInt(curr.grade || 0), 0) / results.length).toFixed(1) : 0
  }), [results, questions]);

  const filteredQuestions = (questions || []).filter(q => 
    (q.text || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/5 p-12 rounded-[48px] shadow-[0_0_80px_rgba(255,87,34,0.1)] space-y-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-3xl flex items-center justify-center mx-auto text-white shadow-2xl shadow-orange-900/40 rotate-3">
          <Lock size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight">Xush Kelibsiz</h2>
          <p className="text-white/40 text-sm font-medium">Boshqaruv paneliga kiring</p>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
          } catch (err) {
            alert("Login yoki parol xato");
          }
        }} className="space-y-5">
          <div className="space-y-4">
            <input className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-orange-500 focus:bg-white/[0.05] transition-all" type="email" name="email" placeholder="Email manzilingiz" required />
            <input className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white outline-none focus:border-orange-500 focus:bg-white/[0.05] transition-all" type="password" name="password" placeholder="Maxfiy parol" required />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-orange-500 py-5 rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-orange-900/30">TIZIMGA KIRISH</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white font-black text-4xl animate-pulse">Yuklanmoqda...</div>;

  const menuItems = [
    { id: 'dashboard', label: 'Bosh Sahifa', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'questions', label: 'Testlar Bazasi', icon: BookOpen, color: 'text-purple-500' },
    { id: 'sessions', label: 'Havolalar', icon: Link2, color: 'text-orange-500' },
    { id: 'results', label: 'Statistika', icon: Award, color: 'text-green-500' },
    { id: 'settings', label: 'Tizim Sozlamalari', icon: Settings, color: 'text-slate-400' }
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-orange-500/30">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] px-10 py-5 rounded-full bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.2)] animate-in slide-in-from-top-10 duration-500 font-black text-lg flex items-center gap-4">
          <Sparkles className="text-orange-500" size={24} /> {toast}
        </div>
      )}

      {/* Sidebar Menu */}
      <aside className="w-85 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-10 sticky top-0 h-screen shrink-0 relative z-50">
        <div className="mb-16 flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/40"><Zap size={24} className="fill-white" /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none">RANCH <span className="text-orange-500">PRO</span></h1>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mt-1">Management System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 px-7 py-5 rounded-3xl font-black transition-all duration-500 relative group ${
                activeTab === item.id 
                ? 'bg-gradient-to-r from-orange-600/10 to-transparent text-white' 
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-orange-500 rounded-r-full shadow-[4px_0_15px_rgba(255,87,34,0.5)]"></div>}
              <item.icon size={26} className={activeTab === item.id ? 'text-orange-500 scale-110 transition-transform' : 'text-white/10 group-hover:text-white/30'} />
              <span className="text-xs uppercase tracking-[0.15em]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-10 border-t border-white/5">
          <button onClick={() => auth.signOut()} className="w-full flex items-center justify-between px-8 py-5 bg-white/[0.03] rounded-3xl hover:bg-red-500 transition-all group overflow-hidden relative">
            <div className="flex items-center gap-4 z-10">
              <LogOut size={20} className="text-white/20 group-hover:text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Chiqish</span>
            </div>
            <ChevronRight size={16} className="text-white/10 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-16 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/[0.03] via-transparent to-transparent">
        <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Top Bar Context */}
          <header className="flex justify-between items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Tizim holati: Online</p>
              </div>
              <h2 className="text-6xl font-black tracking-tighter capitalize">{activeTab}</h2>
            </div>
            <div className="flex gap-4">
               <button onClick={loadData} className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/[0.08] transition-all text-white/30 hover:text-white hover:rotate-180 duration-500"><RefreshCw size={24} /></button>
               {activeTab === 'questions' && (
                 <button onClick={() => setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correctAnswer: '0' }, ...questions])} className="px-12 py-5 bg-orange-500 rounded-2xl font-black text-base shadow-[0_15px_40px_rgba(255,87,34,0.3)] hover:scale-105 active:scale-95 transition-all">+ YANGI QO'SHISH</button>
               )}
            </div>
          </header>

          {/* Tab Contents */}
          {activeTab === 'dashboard' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'TALABALAR', val: stats.totalStudents, icon: Users, grad: 'from-blue-600 to-blue-400', shadow: 'shadow-blue-900/20' },
                { label: 'SAVOLLAR', val: stats.totalQuestions, icon: BookOpen, grad: 'from-purple-600 to-purple-400', shadow: 'shadow-purple-900/20' },
                { label: 'O\'RTACHA BALL', val: stats.avgScore, icon: BarChart3, grad: 'from-orange-600 to-orange-400', shadow: 'shadow-orange-900/20' },
                { label: 'O\'RTACHA BAHO', val: stats.avgGrade, icon: Award, grad: 'from-green-600 to-green-400', shadow: 'shadow-green-900/20' },
              ].map((s, i) => (
                <div key={i} className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-br ${s.grad} rounded-[48px] opacity-0 group-hover:opacity-10 transition-opacity blur-xl`}></div>
                  <div className="relative bg-[#0a0a0a] border border-white/5 p-12 rounded-[48px] space-y-8 hover:border-white/10 transition-all overflow-hidden shadow-2xl">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-2xl ${s.shadow} group-hover:scale-110 transition-transform duration-500`}><s.icon size={36} /></div>
                    <div className="space-y-1"><p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{s.label}</p><h3 className="text-6xl font-black tracking-tighter">{s.val}</h3></div>
                    {/* Subtle BG Icon */}
                    <s.icon className="absolute -bottom-10 -right-10 text-white/[0.02] w-40 h-40 group-hover:scale-125 transition-transform duration-1000" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-12">
              <div className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[56px] flex flex-wrap justify-between items-center gap-10 shadow-2xl">
                <div className="flex-1 min-w-[300px] relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-transparent rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
                  <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-white/20" size={28} />
                  <input className="relative w-full bg-white/[0.03] border border-white/10 rounded-[32px] px-24 py-7 text-white text-2xl font-bold outline-none focus:border-orange-500/50 transition-all" placeholder="Savollarni qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-5">
                  <button onClick={async () => { if(window.confirm("Barcha savollar o'chirilsinmi?")) { await storage.saveQuestions(adminUid, []); setQuestions([]); showToast("Baza tozalandi!"); } }} className="px-10 py-7 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-3xl font-black text-sm transition-all flex items-center gap-3 border border-red-500/10"><Trash size={24} /> TOZALASH</button>
                  <label className="px-12 py-7 bg-white/[0.03] hover:bg-white/[0.08] rounded-3xl cursor-pointer font-black text-sm flex items-center gap-3 transition-all border border-white/5 shadow-xl">
                    <FileUp size={24} className="text-orange-500" /> Word Yuklash
                    <input type="file" className="hidden" accept=".docx" onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      try {
                        showToast("Fayl tahlil qilinmoqda...");
                        const arrayBuffer = await file.arrayBuffer();
                        const res = await mammoth.convertToHtml({ arrayBuffer });
                        const parsed = parseWordQuiz(res.value);
                        const imported = parsed.map(q => ({
                          uid: Math.random().toString(36).substr(2, 9),
                          text: cleanText(q.text),
                          options: (q.options || []).map(o => cleanText(o)),
                          correctAnswer: String(q.correct)
                        }));
                        setQuestions([...questions, ...imported]);
                        showToast(`${imported.length} ta yangi savol!`);
                      } catch (err) { alert("Xatolik!"); }
                    }} />
                  </label>
                </div>
              </div>

              <div className="grid gap-10 pb-40">
                {filteredQuestions.map((q, qIdx) => (
                  <div key={q.uid} className="bg-[#0a0a0a] border border-white/5 p-16 rounded-[64px] space-y-12 hover:border-white/10 transition-all relative overflow-hidden group shadow-2xl">
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-4">
                         <span className="px-7 py-3 bg-white/5 text-white/40 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/5">SAVOL #{questions.length - qIdx}</span>
                         {q.correctAnswer === '-1' && <span className="text-red-500 text-[10px] font-black animate-pulse">! JAVOB TANLANMAGAN</span>}
                      </div>
                      <button onClick={() => setQuestions(questions.filter(it => it.uid !== q.uid))} className="w-16 h-16 rounded-2xl flex items-center justify-center text-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all border border-white/5 hover:border-red-500/20"><Trash2 size={28} /></button>
                    </div>
                    <textarea 
                      value={q.text} 
                      onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].text = e.target.value; setQuestions(u); }} 
                      className="relative z-10 w-full bg-transparent border-none text-4xl font-black focus:outline-none text-white resize-none leading-tight" 
                      rows={2} 
                      placeholder="Savol matnini kiriting..."
                    />
                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = String(q.correctAnswer) === String(oIdx);
                        return (
                          <div key={oIdx} className={`p-10 rounded-[48px] border-4 transition-all flex items-start gap-10 ${isCorrect ? 'border-green-500 bg-green-500/[0.03]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                            <button onClick={() => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].correctAnswer = String(oIdx); setQuestions(u); }} className={`w-20 h-20 shrink-0 rounded-3xl flex items-center justify-center font-black text-3xl transition-all shadow-2xl ${isCorrect ? 'bg-green-500 text-white shadow-green-900/40' : 'bg-white/5 text-white/20 hover:text-white/40'}`}>{isCorrect ? <Check size={40} strokeWidth={4} /> : String.fromCharCode(65 + oIdx)}</button>
                            <textarea value={opt} onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].options[oIdx] = e.target.value; setQuestions(u); }} className="flex-1 bg-transparent border-none font-bold text-2xl focus:outline-none resize-none text-white pt-4" rows={2} placeholder="Variant matni..." />
                          </div>
                        );
                      })}
                    </div>
                    {/* Subtle Ornament */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -z-0"></div>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-12 right-12 z-[100]">
                 <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Baza muvaffaqiyatli saqlandi!"))} className="group flex items-center gap-6 px-16 py-8 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full font-black text-3xl shadow-[0_25px_80px_rgba(255,87,34,0.4)] hover:scale-105 active:scale-95 transition-all text-white relative overflow-hidden">
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                   <Save size={40} className="relative z-10" /> <span className="relative z-10">SAQLASH</span>
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="grid lg:grid-cols-12 gap-16 pb-20">
              <div className="lg:col-span-5 space-y-10">
                <div className="bg-[#0a0a0a] border border-white/5 p-16 rounded-[64px] space-y-12 shadow-2xl sticky top-16">
                  <div className="space-y-3"><h3 className="text-4xl font-black tracking-tight">Yangi Havola</h3><p className="text-white/30 text-lg">Talabalar uchun test yaratish</p></div>
                  <div className="space-y-10">
                    <div className="space-y-4"><label className="text-[11px] font-black uppercase text-white/30 ml-6 tracking-[0.3em]">Guruh / Fan Nomi</label><input className="w-full bg-white/[0.03] border border-white/10 rounded-[40px] px-10 py-8 text-white text-3xl font-black outline-none focus:border-orange-500/50 transition-all placeholder:text-white/5" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Masalan: 401-Guruh" /></div>
                    <div className="space-y-4"><label className="text-[11px] font-black uppercase text-white/30 ml-6 tracking-[0.3em]">Savollar Soni</label><input type="number" className="w-full bg-white/[0.03] border border-white/10 rounded-[40px] px-10 py-8 text-white text-4xl font-black outline-none focus:border-orange-500/50 transition-all" value={sessionQCount} onChange={e => setSessionQCount(e.target.value)} /></div>
                    <button onClick={async () => {
                      const totalQs = questions.length;
                      const requestedCount = parseInt(sessionQCount);
                      const finalCount = (isNaN(requestedCount) || requestedCount <= 0) ? 20 : requestedCount;
                      const qIds = [...questions].sort(() => 0.5 - Math.random()).slice(0, Math.min(finalCount, totalQs)).map(q => q.uid);
                      if(qIds.length === 0) return alert("Savollar mavjud emas!");
                      showToast("Havola yaratilmoqda...");
                      await storage.saveQuestions(adminUid, questions);
                      storage.saveSession(adminUid, { name: sessionName || 'Yangi Test', questionIds: qIds }).then(s => { if(s) { setSessions([s, ...sessions]); setSessionName(''); showToast("Muvaffaqiyatli yaratildi!"); } });
                    }} className="w-full bg-gradient-to-tr from-orange-600 to-orange-400 py-8 rounded-[40px] font-black text-3xl shadow-2xl shadow-orange-900/30 hover:scale-[1.02] transition-all">HAVOLA YARATISH</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-10">
                <h3 className="text-3xl font-black px-6 flex items-center gap-5">Aktiv Havolalar <div className="px-6 py-2 bg-green-500 text-black rounded-full text-xs font-black shadow-lg shadow-green-900/20">{sessions.length} ta</div></h3>
                <div className="grid gap-8">
                  {sessions.map(s => {
                    const qCount = (() => { try { const ids = typeof s.questionIds === 'string' ? JSON.parse(s.questionIds) : s.questionIds; return Array.isArray(ids) ? ids.length : 0; } catch (e) { return 0; } })();
                    return (
                      <div key={s.id} className="bg-[#0a0a0a] border border-white/5 p-12 rounded-[56px] flex justify-between items-center hover:border-orange-500/30 transition-all group shadow-2xl relative overflow-hidden">
                        <div className="space-y-3 relative z-10">
                          <h4 className="font-black text-4xl tracking-tight">{s.name}</h4>
                          <div className="flex items-center gap-3"><span className="px-5 py-2 bg-white/5 rounded-2xl text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border border-orange-500/10">{qCount} SAVOL</span><span className="text-[10px] font-black text-white/20">ID: {s.id.slice(0, 8)}...</span></div>
                        </div>
                        <div className="flex gap-5 relative z-10">
                          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quiz?testId=${adminUid}_${s.id}`); showToast("Havola nusxalandi!"); }} className="w-20 h-20 bg-white/[0.03] rounded-[32px] hover:bg-orange-500 hover:text-white transition-all text-white/20 flex items-center justify-center hover:scale-110 shadow-xl border border-white/5"><Copy size={32} /></button>
                          <button onClick={() => { if(window.confirm("O'chirilsinmi?")) { storage.deleteSession(adminUid, s.id).then(() => setSessions(sessions.filter(it => it.id !== s.id))); } }} className="w-20 h-20 bg-white/[0.03] rounded-[32px] hover:bg-red-500 hover:text-white transition-all text-white/20 flex items-center justify-center hover:scale-110 shadow-xl border border-white/5"><Trash2 size={32} /></button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/[0.01] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
             <div className="bg-[#0a0a0a] border border-white/5 rounded-[64px] overflow-hidden shadow-2xl">
               <div className="p-16 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
                  <div className="space-y-2"><h3 className="text-5xl font-black tracking-tight">Talabalar Natijalari</h3><p className="text-white/20 text-lg font-medium">Barcha imtihon natijalari jadvali</p></div>
                  <button onClick={() => window.print()} className="px-14 py-7 bg-green-600 hover:bg-green-500 rounded-[32px] font-black text-lg text-white shadow-2xl shadow-green-900/30 transition-all flex items-center gap-4"><Download size={24} /> HISOBOT (PDF)</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-white/[0.01] text-white/20 text-[12px] uppercase font-black tracking-[0.3em] border-b border-white/5">
                      <tr><th className="p-14">TALABA MA'LUMOTLARI</th><th className="p-14 text-center">NATIJA</th><th className="p-14 text-center">BAHO</th><th className="p-14 text-right">SANA</th></tr>
                    </thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.015] transition-all group">
                            <td className="p-14 font-black text-3xl tracking-tight">
                              {r.student?.name} {r.student?.surname}
                              <div className="text-sm text-white/20 font-black mt-2 flex items-center gap-3"><span className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">{r.student?.group}</span> <span>{r.student?.faculty}</span></div>
                            </td>
                            <td className="p-14 text-center"><span className="px-10 py-5 bg-black rounded-3xl font-black text-5xl text-orange-500 border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">{r.score}/{r.total}</span></td>
                            <td className="p-14 text-center"><span className="font-black text-8xl text-transparent bg-clip-text bg-gradient-to-tr from-orange-600 to-orange-400 group-hover:scale-125 transition-transform duration-500 inline-block">{r.grade}</span></td>
                            <td className="p-14 text-right text-white/10 text-base font-black font-mono">{new Date(r.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-16 pb-32">
              <div className="bg-[#0a0a0a] border border-white/5 p-20 rounded-[72px] space-y-16 shadow-2xl relative overflow-hidden">
                <div className="space-y-4 relative z-10"><h3 className="text-5xl font-black tracking-tight">Baholash</h3><p className="text-white/30 text-xl font-medium">Minimal o'tish ballari</p></div>
                <div className="space-y-8 relative z-10">
                  {criteria.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-12 bg-white/[0.02] border border-white/5 rounded-[48px] hover:border-orange-500/30 transition-all group">
                      <div className="flex items-center gap-8"><span className="w-24 h-24 bg-gradient-to-br from-orange-600 to-orange-400 rounded-3xl flex items-center justify-center text-5xl font-black text-white shadow-2xl group-hover:rotate-12 transition-transform">{c.grade}</span><span className="font-black text-white/20 uppercase tracking-[0.2em] text-xs">Min. Ball</span></div>
                      <input type="number" className="bg-black border border-white/10 rounded-3xl px-10 py-6 w-44 text-center text-white text-5xl font-black focus:border-orange-500 outline-none transition-all" value={c.min} onChange={e => { const u = [...criteria]; u[i].min = parseInt(e.target.value); setCriteria(u); }} />
                    </div>
                  ))}
                </div>
                <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Barcha mezonlar yangilandi!"))} className="w-full bg-gradient-to-r from-orange-600 to-orange-500 py-10 rounded-[48px] font-black text-3xl shadow-2xl shadow-orange-900/40 relative z-10 hover:scale-[1.02] active:scale-95 transition-all">MEZONLARNI SAQLASH</button>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-500/[0.02] rounded-full blur-[100px]"></div>
              </div>
              
              <div className="bg-[#0a0a0a] border border-white/5 p-20 rounded-[72px] space-y-16 shadow-2xl relative overflow-hidden">
                <div className="space-y-4 relative z-10"><h3 className="text-5xl font-black tracking-tight">Umumiy</h3><p className="text-white/30 text-xl font-medium">Test vaqti va hajmi</p></div>
                <div className="space-y-12 relative z-10">
                  <div className="space-y-6"><label className="text-[12px] font-black text-white/20 uppercase tracking-[0.4em] ml-10">Standart Savollar Soni</label><input type="number" className="w-full bg-white/[0.03] border border-white/10 rounded-[48px] px-12 py-10 text-6xl font-black text-white focus:border-orange-500 transition-all outline-none" value={settings.questionsPerTest} onChange={e => setSettings({...settings, questionsPerTest: parseInt(e.target.value)})} /></div>
                  <div className="space-y-6"><label className="text-[12px] font-black text-white/20 uppercase tracking-[0.4em] ml-10">Vaqt (Sekund / Savol)</label><input type="number" className="w-full bg-white/[0.03] border border-white/10 rounded-[48px] px-12 py-10 text-6xl font-black text-white focus:border-orange-500 transition-all outline-none" value={settings.timePerQuestion} onChange={e => setSettings({...settings, timePerQuestion: parseInt(e.target.value)})} /></div>
                </div>
                <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Sozlamalar yangilandi!"))} className="w-full bg-gradient-to-r from-blue-700 to-blue-500 py-10 rounded-[48px] font-black text-3xl shadow-2xl shadow-blue-900/40 relative z-10 hover:scale-[1.02] transition-all">SOZLAMALARNI SAQLASH</button>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/[0.02] rounded-full blur-[100px]"></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
