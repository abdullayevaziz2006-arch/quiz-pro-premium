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
  Filter, Trash, Zap
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [questions, setQuestions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [results, setResults] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState({ questionsPerTest: 20, timePerQuestion: 120 });
  const [genMode, setGenMode] = useState('random');
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [sessionName, setSessionName] = useState('');
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
      // Normalize questions: ensure correctAnswer is a string representation of index
      const normalizedQs = (qs || []).map(q => {
        let correctVal = q.correctAnswer !== undefined ? q.correctAnswer : q.correct;
        return {
          ...q,
          correctAnswer: String(correctVal !== null && correctVal !== undefined ? correctVal : '')
        };
      });
      setQuestions(normalizedQs);
      setCriteria(Array.isArray(cr) ? cr : []);
      setResults(Array.isArray(rs) ? rs : []);
      setSessions(Array.isArray(ss) ? ss : []);
      if (st) setSettings(st);
    } catch (err) {
      console.error("Data load error:", err);
      showToast("Ma'lumotlarni yuklashda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const exportToCSV = () => {
    if(!results || results.length === 0) return showToast("Natijalar yo'q", "error");
    const headers = ['Ism', 'Familiya', 'Guruh', 'Fakultet', 'Ball', 'Jami', 'Baho', 'Sana'];
    const rows = results.map(r => [
      r.student?.name || '',
      r.student?.surname || '',
      r.student?.group || '',
      r.student?.faculty || '',
      r.score || 0,
      r.total || 0,
      r.grade || 0,
      new Date(r.date).toLocaleString()
    ]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "quiz_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => ({
    totalStudents: results?.length || 0,
    totalQuestions: questions?.length || 0,
    avgScore: results?.length > 0 ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length).toFixed(1) : 0,
    avgGrade: results?.length > 0 ? (results.reduce((acc, curr) => acc + parseInt(curr.grade || 0), 0) / results.length).toFixed(1) : 0
  }), [results, questions]);

  const filteredQuestions = questions.filter(q => q.text?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredResults = results.filter(r => `${r.student?.name} ${r.student?.surname} ${r.student?.group}`.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isAuthenticated && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 text-white">
      <div className="w-full max-w-md bg-card border border-white/5 p-12 rounded-[40px] shadow-2xl space-y-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
          <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black">Ranch Admin</h2>
          <p className="text-white/40 text-sm">Tizimga kirish</p>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
          } catch(err) {
            showToast("Xato!", "error");
          }
        }} className="space-y-4">
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary text-white" type="email" name="email" placeholder="Email" required />
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary text-white" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 transition-all hover:bg-primary/90">KIRISH</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-10 pb-20 text-white">
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black">Admin <span className="text-primary">Panel</span></h1>
        <button onClick={() => auth.signOut()} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl inline-flex">
        {['dashboard', 'questions', 'sessions', 'results', 'settings'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === t ? 'bg-primary text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'dashboard' && (
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Talabalar', val: stats.totalStudents, icon: Users, col: 'text-blue-500' },
                { label: 'Savollar', val: stats.totalQuestions, icon: BookOpen, col: 'text-purple-500' },
                { label: 'O\'rtacha Ball', val: stats.avgScore, icon: BarChart3, col: 'text-orange-500' },
                { label: 'O\'rtacha Baho', val: stats.avgGrade, icon: Award, col: 'text-green-500' },
              ].map((s, i) => (
                <div key={i} className="bg-card border border-white/5 p-8 rounded-[32px] space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${s.col}`}><s.icon size={24} /></div>
                  <div><p className="text-[10px] font-bold text-white/30 uppercase">{s.label}</p><h3 className="text-3xl font-black">{s.val}</h3></div>
                </div>
              ))}
           </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-8">
            <div className="bg-card border border-white/5 p-8 rounded-[32px] flex justify-between items-center gap-6">
              <input className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 flex-1 text-white focus:border-primary/50" placeholder="Qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <div className="flex gap-4">
                <label className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all font-bold text-sm flex items-center gap-2">
                    <FileUp size={20} /> Word Yuklash
                    <input type="file" className="hidden" accept=".docx" onChange={async (e) => {
                      const file = e.target.files[0]; if(!file) return;
                      const arrayBuffer = await file.arrayBuffer();
                      const res = await mammoth.convertToHtml({ arrayBuffer });
                      const imported = parseWordQuiz(res.value).map(q => ({ 
                        uid: Math.random().toString(36).substr(2, 9),
                        text: q.text,
                        options: q.options,
                        correctAnswer: String(q.correct)
                      }));
                      setQuestions([...questions, ...imported]);
                      showToast(`${imported.length} ta savol qo'shildi`);
                    }} />
                </label>
                <button onClick={() => setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correctAnswer: '0' }, ...questions])} className="px-8 py-4 bg-primary rounded-2xl font-black text-sm shadow-xl shadow-primary/20">+ QO'SHISH</button>
              </div>
            </div>
            <div className="grid gap-6">
              {filteredQuestions.map((q, qIdx) => (
                <div key={q.uid} className={`bg-card border p-10 rounded-[40px] space-y-8 transition-all ${(!q.correctAnswer || q.correctAnswer === '' || q.correctAnswer === '-1') ? 'border-red-500/50 shadow-lg shadow-red-500/5' : 'border-white/5 shadow-2xl'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">SAVOL #{questions.length - qIdx}</span>
                      {(!q.correctAnswer || q.correctAnswer === '' || q.correctAnswer === '-1') ? (
                        <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-2 animate-pulse"><AlertCircle size={14} /> To'g'ri javobni tanlang!</span>
                      ) : (
                        <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-2"><CheckCircle size={14} /> To'g'ri javob tayyor</span>
                      )}
                    </div>
                    <button onClick={() => setQuestions(questions.filter(it => it.uid !== q.uid))} className="text-white/10 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
                  </div>
                  <textarea value={q.text} onChange={e => { const u = [...questions]; u[questions.findIndex(it => it.uid === q.uid)].text = e.target.value; setQuestions(u); }} className="w-full bg-transparent border-none text-2xl font-bold focus:outline-none resize-none text-white leading-tight" rows={2} />
                  <div className="grid md:grid-cols-2 gap-5">
                    {q.options?.map((opt, oIdx) => {
                      // Ultra-flexible matching: index, letter, or text
                      const isCorrect = 
                        String(q.correctAnswer) === String(oIdx) || 
                        String(q.correctAnswer).toUpperCase() === String.fromCharCode(65 + oIdx) ||
                        String(q.correctAnswer).trim() === String(opt).trim();
                        
                      return (
                        <div key={oIdx} className={`p-6 rounded-[32px] border-2 transition-all relative flex items-start gap-6 ${isCorrect ? 'border-green-500 bg-green-500/20 border-l-[16px] border-l-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)] opacity-100' : 'border-white/5 bg-black/20 opacity-30'}`}>
                          <button 
                            onClick={() => { const u = [...questions]; u[questions.findIndex(it => it.uid === q.uid)].correctAnswer = String(oIdx); setQuestions(u); }} 
                            className={`w-14 h-14 min-w-[56px] rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-all ${isCorrect ? 'bg-green-500 text-white shadow-xl shadow-green-500/40 scale-110' : 'bg-white/5 text-white/30 hover:text-white'}`}
                          >
                            {isCorrect ? <Check size={28} strokeWidth={4} /> : String.fromCharCode(65 + oIdx)}
                          </button>
                          <div className="flex-1 space-y-2 pt-1">
                             <textarea 
                              value={opt} 
                              onChange={e => { const u = [...questions]; u[questions.findIndex(it => it.uid === q.uid)].options[oIdx] = e.target.value; setQuestions(u); }} 
                              className={`w-full bg-transparent border-none font-black text-lg focus:outline-none resize-none leading-relaxed transition-colors ${isCorrect ? 'text-white' : 'text-white/40'}`}
                              rows={Math.max(1, Math.ceil(opt.length / 40))}
                            />
                            {isCorrect && (
                              <div className="flex items-center gap-2 text-green-400 font-black text-[11px] uppercase tracking-[0.2em] animate-pulse">
                                <CheckCircle size={14} strokeWidth={3} /> TO'G'RI JAVOB
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="fixed bottom-12 right-12">
               <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Barchasi saqlandi!"))} className="px-12 py-6 bg-primary rounded-[32px] font-black text-2xl shadow-2xl shadow-primary/40 transform hover:scale-105 active:scale-95 transition-all text-white">SAQLASH</button>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-card border border-white/5 p-10 rounded-[40px] space-y-8">
              <h3 className="text-2xl font-bold">Yangi Havola</h3>
              <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-primary" placeholder="Test Nomi" value={sessionName} onChange={e => setSessionName(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setGenMode('random')} className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] border transition-all ${genMode === 'random' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}>
                    <Zap size={16} /> Tasodifiy
                  </button>
                  <button onClick={() => setGenMode('manual')} className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] border transition-all ${genMode === 'manual' ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}>
                    <Filter size={16} /> Qo'lda
                  </button>
                </div>
                {genMode === 'random' && (
                  <div className="space-y-3 animate-in zoom-in duration-300">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Tasodifiy savollar soni</label>
                    <input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 transition-all text-white font-bold" placeholder="Masalan: 20" value={settings.questionsPerTest} onChange={e => setSettings({...settings, questionsPerTest: parseInt(e.target.value)})} />
                  </div>
                )}
              {genMode === 'manual' && (
                <div className="max-h-60 overflow-y-auto bg-black/40 rounded-2xl p-4 space-y-2 border border-white/5">
                  {questions.map(q => (
                    <div key={q.uid} onClick={() => setSelectedQIds(prev => prev.includes(q.uid) ? prev.filter(id => id !== q.uid) : [...prev, q.uid])} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedQIds.includes(q.uid) ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5 text-white/40'}`}>
                      <span className="text-sm truncate block">{q.text}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => {
                const qIds = genMode === 'random' ? [...questions].sort(() => 0.5-Math.random()).slice(0, settings.questionsPerTest || 20).map(q => q.uid) : selectedQIds;
                if(qIds.length === 0) return showToast("Savollarni tanlang!", "error");
                storage.saveSession(adminUid, { name: sessionName || 'Test', questionIds: qIds }).then(s => {
                  if(s) { setSessions([s, ...sessions]); setSessionName(''); setSelectedQIds([]); showToast("Havola yaratildi!"); }
                });
              }} className="w-full bg-primary py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">YARATISH</button>
            </div>
            <div className="space-y-6">
               <h3 className="text-xl font-bold px-2">Aktiv Havolalar</h3>
               {sessions.map(s => (
                 <div key={s.id} className="bg-card border border-white/5 p-8 rounded-[32px] flex justify-between items-center group">
                    <div>
                      <h4 className="font-bold text-xl">{s.name}</h4>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{s.questionIds?.length || 0} ta savol</span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/quiz?testId=${adminUid}_${s.id}`); showToast("Nusxalandi!"); }} className="px-6 py-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">NUSXA</button>
                       <button onClick={() => { if(window.confirm("O'chirilsinmi?")) { storage.deleteSession(adminUid, s.id); setSessions(sessions.filter(it => it.id !== s.id)); } }} className="p-3 text-white/10 hover:text-red-500"><Trash2 size={20} /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
           <div className="bg-card border border-white/5 rounded-[40px] overflow-hidden">
             <div className="p-10 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
                <div><h3 className="text-2xl font-black">Natijalar</h3><p className="text-white/20 text-xs">{results.length} ta jami</p></div>
                <button onClick={exportToCSV} className="px-8 py-4 bg-primary rounded-2xl font-black text-sm shadow-lg shadow-primary/20">EXCEL (CSV)</button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <tr className="text-[10px] font-bold text-white/20 uppercase border-b border-white/5"><th className="p-10">Talaba</th><th className="p-10 text-center">Guruh</th><th className="p-10 text-center">Natija</th><th className="p-10 text-center">Baho</th><th className="p-10 text-right">Sana</th></tr>
                   {filteredResults.map(r => (
                     <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                        <td className="p-10 font-bold">{r.student?.name} {r.student?.surname}</td>
                        <td className="p-10 text-center text-white/40">{r.student?.group}</td>
                        <td className="p-10 text-center font-mono font-bold">{r.score}/{r.total}</td>
                        <td className="p-10 text-center font-black text-2xl text-primary">{r.grade}</td>
                        <td className="p-10 text-right text-white/20 text-xs">{new Date(r.date).toLocaleDateString()}</td>
                     </tr>
                   ))}
                </table>
             </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="grid lg:grid-cols-2 gap-12">
              <div className="bg-card border border-white/5 p-10 rounded-[40px] space-y-8">
                 <h3 className="text-xl font-bold flex items-center gap-2"><Award className="text-primary" /> Baholash</h3>
                 {criteria.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl">
                       <span className="text-2xl font-black text-primary">{c.grade}</span>
                       <input type="number" className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 w-24 text-center font-bold text-xl" value={c.min} onChange={e => { const u = [...criteria]; u[i].min = parseInt(e.target.value); setCriteria(u); }} />
                    </div>
                 ))}
                 <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Saqlandi!"))} className="w-full bg-primary py-4 rounded-xl font-black">SAQLASH</button>
              </div>
              <div className="bg-card border border-white/5 p-10 rounded-[40px] space-y-8">
                 <h3 className="text-xl font-bold">Parametrlar</h3>
                 <div className="space-y-4">
                    <div className="space-y-2"><label className="text-[10px] font-bold text-white/40 uppercase ml-2">Savollar soni</label><input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 font-bold text-xl" value={settings.questionsPerTest} onChange={e => setSettings({...settings, questionsPerTest: parseInt(e.target.value)})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-bold text-white/40 uppercase ml-2">Vaqt (sekund)</label><input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 font-bold text-xl" value={settings.timePerQuestion} onChange={e => setSettings({...settings, timePerQuestion: parseInt(e.target.value)})} /></div>
                 </div>
                 <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Saqlandi!"))} className="w-full bg-blue-600 py-4 rounded-xl font-black">SAQLASH</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
