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
  Filter, Trash, Zap, Bug, RefreshCw, LayoutDashboard
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#141414] border border-white/5 p-12 rounded-[40px] shadow-2xl space-y-8 text-center">
        <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto text-orange-500">
          <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black">Admin Panel</h2>
          <p className="text-white/40 text-sm">Tizimga kiring</p>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
          } catch (err) {
            alert("Login yoki parol xato");
          }
        }} className="space-y-4">
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500 transition-all" type="email" name="email" placeholder="Email" required />
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500 transition-all" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="w-full bg-orange-500 py-4 rounded-2xl font-black text-xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-900/20">KIRISH</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Yuklanmoqda...</div>;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'questions', label: 'Savollar', icon: BookOpen },
    { id: 'sessions', label: 'Havolalar', icon: Link2 },
    { id: 'results', label: 'Natijalar', icon: Award },
    { id: 'settings', label: 'Sozlamalar', icon: Settings }
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl bg-orange-500 shadow-2xl animate-bounce text-white font-bold">
          {toast}
        </div>
      )}

      {/* Sidebar Menu */}
      <aside className="w-80 bg-[#141414] border-r border-white/5 flex flex-col p-8 sticky top-0 h-screen shrink-0">
        <div className="mb-12">
          <h1 className="text-3xl font-black tracking-tight">Admin <span className="text-orange-500">Panel</span></h1>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-2">v4.0 Premium System</p>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] font-bold transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/30 translate-x-2' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-white/20 group-hover:text-white'} />
              <span className="text-sm uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-8 border-t border-white/5">
          <button onClick={loadData} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white font-bold">
            <RefreshCw size={18} /> Yangilash
          </button>
          <button onClick={() => auth.signOut()} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 rounded-2xl hover:bg-red-500 transition-all text-red-500 hover:text-white font-bold">
            <LogOut size={18} /> Chiqish
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
          
          {/* Header Context */}
          <header className="flex justify-between items-end">
            <div>
              <h2 className="text-5xl font-black capitalize tracking-tight">{activeTab}</h2>
              <p className="text-white/30 mt-2 text-lg">Tizimni boshqarish va tahlil qilish bo'limi</p>
            </div>
            {activeTab === 'questions' && (
              <div className="flex gap-4">
                <button onClick={() => setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correctAnswer: '0' }, ...questions])} className="px-10 py-5 bg-orange-500 hover:bg-orange-600 rounded-[24px] font-black text-sm transition-all shadow-xl shadow-orange-900/20">+ QO'SHISH</button>
              </div>
            )}
          </header>

          {/* Tab Contents */}
          {activeTab === 'dashboard' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Talabalar', val: stats.totalStudents, icon: Users, col: 'text-blue-500' },
                { label: 'Savollar', val: stats.totalQuestions, icon: BookOpen, col: 'text-purple-500' },
                { label: 'O\'rtacha Ball', val: stats.avgScore, icon: BarChart3, col: 'text-orange-500' },
                { label: 'O\'rtacha Baho', val: stats.avgGrade, icon: Award, col: 'text-green-500' },
              ].map((s, i) => (
                <div key={i} className="bg-[#141414] border border-white/5 p-10 rounded-[48px] space-y-6 hover:border-white/10 transition-all group">
                  <div className={`w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center ${s.col} group-hover:scale-110 transition-transform`}><s.icon size={32} /></div>
                  <div><p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{s.label}</p><h3 className="text-5xl font-black mt-1">{s.val}</h3></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-10">
              <div className="bg-[#141414] border border-white/5 p-10 rounded-[48px] flex flex-wrap justify-between items-center gap-8">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                  <input className="w-full bg-black/40 border border-white/5 rounded-[24px] px-20 py-6 text-white text-xl outline-none focus:border-orange-500 transition-all" placeholder="Savollarni qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-4">
                  <button onClick={async () => { if(window.confirm("Barcha savollar o'chirilsinmi?")) { await storage.saveQuestions(adminUid, []); setQuestions([]); showToast("Baza tozalandi!"); } }} className="px-8 py-6 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-[24px] font-bold text-sm transition-all flex items-center gap-2 border border-red-500/20"><Trash size={22} /> TOZALASH</button>
                  <label className="px-10 py-6 bg-white/5 hover:bg-white/10 rounded-[24px] cursor-pointer font-bold text-sm flex items-center gap-2 transition-all border border-white/5"><FileUp size={22} /> Word Yuklash<input type="file" className="hidden" accept=".docx" onChange={async (e) => {
                    const file = e.target.files[0]; if (!file) return;
                    try {
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
                      showToast(`${imported.length} ta savol qo'shildi!`);
                    } catch (err) { alert("Xatolik!"); }
                  }} /></label>
                </div>
              </div>

              <div className="grid gap-8 pb-40">
                {filteredQuestions.map((q, qIdx) => (
                  <div key={q.uid} className="bg-[#141414] border border-white/5 p-12 rounded-[56px] space-y-10 hover:border-white/10 transition-all relative overflow-hidden group">
                    <div className="flex justify-between items-center">
                      <span className="px-6 py-2 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase tracking-widest">SAVOL #{questions.length - qIdx}</span>
                      <button onClick={() => setQuestions(questions.filter(it => it.uid !== q.uid))} className="w-14 h-14 rounded-2xl flex items-center justify-center text-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={24} /></button>
                    </div>
                    <textarea 
                      value={q.text} 
                      onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].text = e.target.value; setQuestions(u); }} 
                      className="w-full bg-transparent border-none text-3xl font-black focus:outline-none text-white resize-none" 
                      rows={2} 
                    />
                    <div className="grid md:grid-cols-2 gap-6">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = String(q.correctAnswer) === String(oIdx);
                        return (
                          <div key={oIdx} className={`p-10 rounded-[40px] border-4 transition-all flex items-start gap-8 ${isCorrect ? 'border-green-500 bg-green-500/5' : 'border-white/5 bg-black/40 hover:border-white/10'}`}>
                            <button onClick={() => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].correctAnswer = String(oIdx); setQuestions(u); }} className={`w-16 h-16 shrink-0 rounded-[20px] flex items-center justify-center font-black text-2xl transition-all ${isCorrect ? 'bg-green-500 text-white shadow-xl shadow-green-900/40' : 'bg-white/5 text-white/20'}`}>{isCorrect ? <Check size={32} strokeWidth={4} /> : String.fromCharCode(65 + oIdx)}</button>
                            <textarea value={opt} onChange={e => { const u = [...questions]; const idx = u.findIndex(it => it.uid === q.uid); u[idx].options[oIdx] = e.target.value; setQuestions(u); }} className="flex-1 bg-transparent border-none font-bold text-xl focus:outline-none resize-none text-white pt-2" rows={2} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-12 right-12 z-50">
                 <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Barcha savollar saqlandi!"))} className="flex items-center gap-4 px-12 py-7 bg-orange-500 rounded-full font-black text-2xl shadow-[0_20px_60px_rgba(255,87,34,0.3)] hover:scale-105 active:scale-95 transition-all text-white">
                   <Save size={36} /> SAQLASH
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-8">
                <div className="bg-[#141414] border border-white/5 p-12 rounded-[56px] space-y-10 shadow-2xl sticky top-12">
                  <h3 className="text-3xl font-black">Yangi Havola</h3>
                  <div className="space-y-8">
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/30 ml-4 tracking-widest">Guruh nomi</label><input className="w-full bg-black/40 border border-white/10 rounded-[32px] px-8 py-6 text-white text-2xl font-black outline-none focus:border-orange-500 transition-all" value={sessionName} onChange={e => setSessionName(e.target.value)} placeholder="Masalan: 401-Guruh" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-white/30 ml-4 tracking-widest">Savollar soni</label><input type="number" className="w-full bg-black/40 border border-white/10 rounded-[32px] px-8 py-6 text-white text-2xl font-black outline-none focus:border-orange-500 transition-all" value={sessionQCount} onChange={e => setSessionQCount(e.target.value)} /></div>
                    <button onClick={async () => {
                      const totalQs = questions.length;
                      const requestedCount = parseInt(sessionQCount);
                      const finalCount = (isNaN(requestedCount) || requestedCount <= 0) ? 20 : requestedCount;
                      const qIds = [...questions].sort(() => 0.5 - Math.random()).slice(0, Math.min(finalCount, totalQs)).map(q => q.uid);
                      if(qIds.length === 0) return alert("Savollar mavjud emas!");
                      await storage.saveQuestions(adminUid, questions);
                      storage.saveSession(adminUid, { name: sessionName || 'Yangi Test', questionIds: qIds }).then(s => { if(s) { setSessions([s, ...sessions]); setSessionName(''); showToast("Havola yaratildi!"); } });
                    }} className="w-full bg-orange-500 py-7 rounded-[32px] font-black text-2xl shadow-xl shadow-orange-900/20 hover:bg-orange-600 transition-all">HAVOLA YARATISH</button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 space-y-8">
                <h3 className="text-2xl font-black px-4 flex items-center gap-4">Aktiv Havolalar <span className="px-4 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-black">{sessions.length} ta</span></h3>
                <div className="grid gap-6">
                  {sessions.map(s => {
                    const qCount = (() => { try { const ids = typeof s.questionIds === 'string' ? JSON.parse(s.questionIds) : s.questionIds; return Array.isArray(ids) ? ids.length : 0; } catch (e) { return 0; } })();
                    return (
                      <div key={s.id} className="bg-[#141414] border border-white/5 p-10 rounded-[48px] flex justify-between items-center hover:border-orange-500/30 transition-all group shadow-xl">
                        <div><h4 className="font-black text-3xl">{s.name}</h4><p className="text-orange-500 text-sm font-black mt-1 uppercase tracking-widest">{qCount} SAVOL</p></div>
                        <div className="flex gap-4">
                          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quiz?testId=${adminUid}_${s.id}`); showToast("Havola nusxalandi!"); }} className="w-16 h-16 bg-white/5 rounded-3xl hover:bg-orange-500 hover:text-white transition-all text-white/20 flex items-center justify-center hover:scale-110"><Copy size={28} /></button>
                          <button onClick={() => { if(window.confirm("O'chirilsinmi?")) { storage.deleteSession(adminUid, s.id).then(() => setSessions(sessions.filter(it => it.id !== s.id))); } }} className="w-16 h-16 bg-white/5 rounded-3xl hover:bg-red-500 hover:text-white transition-all text-white/20 flex items-center justify-center hover:scale-110"><Trash2 size={28} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
             <div className="bg-[#141414] border border-white/5 rounded-[56px] overflow-hidden shadow-2xl">
               <div className="p-16 flex justify-between items-center border-b border-white/5">
                  <h3 className="text-4xl font-black">Talabalar Natijalari</h3>
                  <button onClick={() => window.print()} className="px-12 py-6 bg-green-600 hover:bg-green-500 rounded-[24px] font-black text-sm text-white shadow-xl shadow-green-900/20 transition-all">PRINT (PDF)</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-white/[0.02] text-white/20 text-[11px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                      <tr><th className="p-12">Talaba</th><th className="p-12 text-center">Natija</th><th className="p-12 text-center">Baho</th><th className="p-12 text-right">Sana</th></tr>
                    </thead>
                    <tbody>
                      {results.map(r => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all group">
                            <td className="p-12 font-bold text-2xl">
                              {r.student?.name} {r.student?.surname}
                              <div className="text-xs text-white/20 font-medium mt-1">{r.student?.group} • {r.student?.faculty}</div>
                            </td>
                            <td className="p-12 text-center"><span className="px-6 py-3 bg-black/40 rounded-2xl font-black text-3xl text-orange-500 border border-white/5 shadow-inner">{r.score}/{r.total}</span></td>
                            <td className="p-12 text-center font-black text-6xl text-orange-500 group-hover:scale-110 transition-transform">{r.grade}</td>
                            <td className="p-12 text-right text-white/10 text-sm font-medium">{new Date(r.date).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid lg:grid-cols-2 gap-12 pb-20">
              <div className="bg-[#141414] border border-white/5 p-16 rounded-[56px] space-y-12 shadow-2xl">
                <div className="space-y-3"><h3 className="text-4xl font-black">Baholash Tizimi</h3><p className="text-white/30 text-lg">Minimal ballarni sozlang</p></div>
                <div className="space-y-6">
                  {criteria.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-10 bg-black/40 border border-white/5 rounded-[40px] hover:border-orange-500/30 transition-all">
                      <span className="text-5xl font-black text-orange-500">{c.grade}</span>
                      <div className="space-y-2"><p className="text-[10px] font-black text-white/20 uppercase tracking-widest text-right">Min. Ball</p><input type="number" className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 w-36 text-center text-white text-3xl font-black focus:border-orange-500 outline-none" value={c.min} onChange={e => { const u = [...criteria]; u[i].min = parseInt(e.target.value); setCriteria(u); }} /></div>
                    </div>
                  ))}
                </div>
                <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Mezonlar saqlandi!"))} className="w-full bg-orange-500 py-8 rounded-[32px] font-black text-2xl shadow-xl shadow-orange-900/30">MEZONLARNI SAQLASH</button>
              </div>
              
              <div className="bg-[#141414] border border-white/5 p-16 rounded-[56px] space-y-12 shadow-2xl">
                <div className="space-y-3"><h3 className="text-4xl font-black">Umumiy Sozlamalar</h3><p className="text-white/30 text-lg">Test vaqtini boshqarish</p></div>
                <div className="space-y-10">
                  <div className="space-y-4"><label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-6">Standart Savollar Soni</label><input type="number" className="w-full bg-black/40 border border-white/10 rounded-[40px] px-10 py-8 text-4xl font-black text-white focus:border-orange-500 transition-all outline-none" value={settings.questionsPerTest} onChange={e => setSettings({...settings, questionsPerTest: parseInt(e.target.value)})} /></div>
                  <div className="space-y-4"><label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-6">Vaqt (Sekund / Savol)</label><input type="number" className="w-full bg-black/40 border border-white/10 rounded-[40px] px-10 py-8 text-4xl font-black text-white focus:border-orange-500 transition-all outline-none" value={settings.timePerQuestion} onChange={e => setSettings({...settings, timePerQuestion: parseInt(e.target.value)})} /></div>
                </div>
                <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Sozlamalar saqlandi!"))} className="w-full bg-blue-600 py-8 rounded-[32px] font-black text-2xl shadow-xl shadow-blue-900/30">SOZLAMALARNI SAQLASH</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
