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
  Filter, Trash, Zap, Bug, RefreshCw
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
      // Tozalash va Saqlash mantiqi
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 space-y-10 font-sans">
      {toast && (
        <div className="fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl bg-orange-500 shadow-2xl animate-bounce text-white font-bold">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black">Admin <span className="text-orange-500">Panel</span></h1>
          <button onClick={loadData} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white"><RefreshCw size={20} /></button>
        </div>
        <button onClick={() => auth.signOut()} className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl hover:bg-red-500 transition-all font-bold">
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-2 bg-white/5 border border-white/5 rounded-[24px] inline-flex max-w-7xl mx-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'questions', label: 'Savollar', icon: BookOpen },
          { id: 'sessions', label: 'Havolalar', icon: Link2 },
          { id: 'results', label: 'Natijalar', icon: Award },
          { id: 'settings', label: 'Sozlamalar', icon: Settings }
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === t.id ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/20' : 'text-white/40 hover:text-white'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
        {activeTab === 'dashboard' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Talabalar', val: stats.totalStudents, icon: Users, col: 'text-blue-500' },
              { label: 'Savollar', val: stats.totalQuestions, icon: BookOpen, col: 'text-purple-500' },
              { label: 'O\'rtacha Ball', val: stats.avgScore, icon: BarChart3, col: 'text-orange-500' },
              { label: 'O\'rtacha Baho', val: stats.avgGrade, icon: Award, col: 'text-green-500' },
            ].map((s, i) => (
              <div key={i} className="bg-[#141414] border border-white/5 p-8 rounded-[40px] space-y-4 hover:border-white/10 transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${s.col}`}><s.icon size={28} /></div>
                <div><p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{s.label}</p><h3 className="text-4xl font-black">{s.val}</h3></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-8">
            <div className="bg-[#141414] border border-white/5 p-8 rounded-[40px] flex flex-wrap justify-between items-center gap-6">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                <input className="w-full bg-black/40 border border-white/5 rounded-2xl px-16 py-5 text-white outline-none focus:border-orange-500 transition-all" placeholder="Savollarni qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <button onClick={async () => { 
                  if(window.confirm("Barcha savollar o'chirilsinmi?")) { 
                    await storage.saveQuestions(adminUid, []); 
                    setQuestions([]); 
                    showToast("Baza tozalandi!"); 
                  } 
                }} className="px-6 py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-[20px] font-bold text-sm transition-all border border-red-500/20 flex items-center gap-2">
                  <Trash size={20} /> TOZALASH
                </button>
                <label className="px-10 py-5 bg-white/5 hover:bg-white/10 rounded-[20px] cursor-pointer font-bold text-sm flex items-center gap-2 transition-all border border-white/5">
                  <FileUp size={20} /> Word Yuklash
                  <input type="file" className="hidden" accept=".docx" onChange={async (e) => {
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
                      showToast(`${imported.length} ta savol qo'shildi! 'SAQLASH'ni bosing.`);
                    } catch (err) { alert("Xatolik!"); }
                  }} />
                </label>
                <button onClick={() => setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correctAnswer: '0' }, ...questions])} className="px-10 py-5 bg-orange-500 hover:bg-orange-600 rounded-[20px] font-black text-sm transition-all shadow-xl shadow-orange-900/20">+ QO'SHISH</button>
              </div>
            </div>

            <div className="grid gap-8 pb-32">
              {filteredQuestions.map((q, qIdx) => (
                <div key={q.uid} className="bg-[#141414] border border-white/5 p-10 rounded-[56px] space-y-8 hover:border-white/10 transition-all">
                  <div className="flex justify-between items-center">
                    <span className="px-5 py-2 bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest">SAVOL #{questions.length - qIdx}</span>
                    <button onClick={() => setQuestions(questions.filter(it => it.uid !== q.uid))} className="text-white/10 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
                  </div>
                  <textarea 
                    value={q.text} 
                    onChange={e => { 
                      const u = [...questions]; 
                      const idx = u.findIndex(it => it.uid === q.uid);
                      u[idx].text = e.target.value; 
                      setQuestions(u); 
                    }} 
                    className="w-full bg-transparent border-none text-2xl font-black focus:outline-none text-white resize-none" 
                    rows={2} 
                  />
                  <div className="grid md:grid-cols-2 gap-6">
                    {q.options?.map((opt, oIdx) => {
                      const isCorrect = String(q.correctAnswer) === String(oIdx);
                      return (
                        <div key={oIdx} className={`p-8 rounded-[40px] border-4 transition-all flex items-start gap-6 ${isCorrect ? 'border-green-500 bg-green-500/5' : 'border-white/5 bg-black/40'}`}>
                          <button 
                            onClick={() => {
                              const u = [...questions];
                              const idx = u.findIndex(it => it.uid === q.uid);
                              u[idx].correctAnswer = String(oIdx);
                              setQuestions(u);
                            }}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${isCorrect ? 'bg-green-500 text-white' : 'bg-white/5 text-white/20'}`}
                          >
                            {isCorrect ? <Check size={32} strokeWidth={4} /> : String.fromCharCode(65 + oIdx)}
                          </button>
                          <textarea 
                            value={opt} 
                            onChange={e => {
                              const u = [...questions];
                              const idx = u.findIndex(it => it.uid === q.uid);
                              u[idx].options[oIdx] = e.target.value;
                              setQuestions(u);
                            }}
                            className="flex-1 bg-transparent border-none font-bold text-lg focus:outline-none resize-none text-white"
                            rows={2}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-12 right-12 z-50">
               <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Saqlandi!"))} className="flex items-center gap-4 px-12 py-6 bg-orange-500 rounded-full font-black text-2xl shadow-2xl hover:scale-105 transition-all text-white">
                 <Save size={32} /> SAQLASH
               </button>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-[#141414] border border-white/5 p-10 rounded-[48px] space-y-8">
                <h3 className="text-3xl font-black">Yangi Havola</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-white/40 ml-4">Guruh nomi</label>
                    <input className="w-full bg-black/40 border border-white/10 rounded-3xl px-8 py-5 text-white text-xl font-black outline-none" value={sessionName} onChange={e => setSessionName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-white/40 ml-4">Savollar soni</label>
                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-3xl px-8 py-5 text-white text-xl font-black outline-none" value={sessionQCount} onChange={e => setSessionQCount(e.target.value)} />
                  </div>
                  <button onClick={async () => {
                    const totalQs = questions.length;
                    const requestedCount = parseInt(sessionQCount);
                    const finalCount = (isNaN(requestedCount) || requestedCount <= 0) ? 20 : requestedCount;
                    
                    // Tasodifiy tanlab olish
                    const qIds = [...questions]
                      .sort(() => 0.5 - Math.random())
                      .slice(0, Math.min(finalCount, totalQs))
                      .map(q => q.uid);

                    if(qIds.length === 0) return alert("Savollar mavjud emas!");
                    
                    await storage.saveQuestions(adminUid, questions);
                    showToast("Saqlanmoqda...");

                    storage.saveSession(adminUid, { 
                      name: sessionName || 'Yangi Test', 
                      questionIds: qIds 
                    }).then(s => {
                      if(s) { 
                        setSessions([s, ...sessions]); 
                        setSessionName(''); 
                        showToast(`Muvaffaqiyatli! ${qIds.length} ta savol bilan havola yaratildi.`); 
                      }
                    });
                  }} className="w-full bg-orange-500 py-6 rounded-[32px] font-black text-2xl shadow-2xl hover:bg-orange-600 transition-all">HAVOLA YARATISH</button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
              {sessions.map(s => {
                const qCount = (() => {
                  try {
                    const ids = typeof s.questionIds === 'string' ? JSON.parse(s.questionIds) : s.questionIds;
                    return Array.isArray(ids) ? ids.length : 0;
                  } catch (e) { return 0; }
                })();
                return (
                  <div key={s.id} className="bg-[#141414] border border-white/5 p-8 rounded-[40px] flex justify-between items-center hover:border-orange-500/30 transition-all">
                    <div><h4 className="font-bold text-2xl">{s.name}</h4><p className="text-orange-500 text-xs font-black">{qCount} SAVOL</p></div>
                    <div className="flex gap-4">
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quiz?testId=${adminUid}_${s.id}`); showToast("Havola nusxalandi!"); }} className="p-5 bg-white/5 rounded-2xl hover:bg-orange-500 transition-all"><Copy size={28} /></button>
                      <button onClick={() => { if(window.confirm("O'chirilsinmi?")) { storage.deleteSession(adminUid, s.id).then(() => setSessions(sessions.filter(it => it.id !== s.id))); } }} className="p-5 bg-white/5 rounded-2xl hover:bg-red-500 transition-all"><Trash2 size={28} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
           <div className="bg-[#141414] border border-white/5 rounded-[56px] overflow-hidden">
             <div className="p-12 flex justify-between items-center border-b border-white/5">
                <h3 className="text-3xl font-black">Natijalar</h3>
                <button onClick={() => window.print()} className="px-10 py-5 bg-green-600 rounded-2xl font-black text-sm text-white">PRINT (PDF)</button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-white/20 text-[10px] uppercase font-black tracking-widest border-b border-white/5">
                  <tr><th className="p-10">Talaba</th><th className="p-10 text-center">Ball</th><th className="p-10 text-center">Baho</th><th className="p-10 text-right">Sana</th></tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-b border-white/5">
                        <td className="p-10 font-bold text-xl">{r.student?.name} {r.student?.surname}</td>
                        <td className="p-10 text-center text-orange-500 font-black text-2xl">{r.score}/{r.total}</td>
                        <td className="p-10 text-center font-black text-4xl text-orange-500">{r.grade}</td>
                        <td className="p-10 text-right text-white/20 text-xs">{new Date(r.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-[#141414] border border-white/5 p-12 rounded-[56px] space-y-10">
              <h3 className="text-3xl font-black">Mezonlar</h3>
              <div className="space-y-6">
                {criteria.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-8 bg-black/40 border border-white/5 rounded-[32px]">
                    <span className="text-3xl font-black text-orange-500">{c.grade}</span>
                    <input type="number" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-32 text-center text-white text-2xl" value={c.min} onChange={e => { const u = [...criteria]; u[i].min = parseInt(e.target.value); setCriteria(u); }} />
                  </div>
                ))}
              </div>
              <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Saqlandi!"))} className="w-full bg-orange-500 py-6 rounded-[32px] font-black text-2xl">SAQLASH</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
