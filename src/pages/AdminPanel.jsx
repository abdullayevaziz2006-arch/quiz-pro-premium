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
  Filter, Trash, Zap, Bug
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
  const [debugMode, setDebugMode] = useState(false);

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
      
      const normalizedQs = (qs || []).map(q => ({
        ...q,
        correctAnswer: String(q.correctAnswer !== undefined ? q.correctAnswer : (q.correct !== undefined ? q.correct : ''))
      }));

      setQuestions(normalizedQs);
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = useMemo(() => ({
    totalStudents: results?.length || 0,
    totalQuestions: questions?.length || 0,
    avgScore: results?.length > 0 ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length).toFixed(1) : 0,
    avgGrade: results?.length > 0 ? (results.reduce((acc, curr) => acc + parseInt(curr.grade || 0), 0) / results.length).toFixed(1) : 0
  }), [results, questions]);

  const filteredQuestions = (questions || []).filter(q => q.text?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isAuthenticated && !loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6 text-white">
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
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white" type="email" name="email" placeholder="Email" required />
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="w-full bg-orange-500 py-4 rounded-2xl font-black text-xl">KIRISH</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 space-y-10">
      {toast && (
        <div className="fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl bg-green-500 shadow-2xl animate-bounce">
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black">Admin <span className="text-orange-500">Panel</span></h1>
        <button onClick={() => auth.signOut()} className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl">
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl inline-flex">
        {['dashboard', 'questions', 'sessions', 'results', 'settings'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest ${activeTab === t ? 'bg-orange-500 text-white' : 'text-white/40'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {activeTab === 'dashboard' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Talabalar', val: stats.totalStudents, icon: Users, col: 'text-blue-500' },
              { label: 'Savollar', val: stats.totalQuestions, icon: BookOpen, col: 'text-purple-500' },
              { label: 'O\'rtacha Ball', val: stats.avgScore, icon: BarChart3, col: 'text-orange-500' },
              { label: 'O\'rtacha Baho', val: stats.avgGrade, icon: Award, col: 'text-green-500' },
            ].map((s, i) => (
              <div key={i} className="bg-[#141414] border border-white/5 p-8 rounded-[32px] space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${s.col}`}><s.icon size={24} /></div>
                <div><p className="text-[10px] font-bold text-white/30 uppercase">{s.label}</p><h3 className="text-3xl font-black">{s.val}</h3></div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-8">
            <div className="bg-[#141414] border border-white/5 p-8 rounded-[32px] flex flex-wrap justify-between items-center gap-6">
              <input className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white" placeholder="Qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <div className="flex gap-4">
                <label className="px-8 py-4 bg-white/5 rounded-2xl cursor-pointer font-bold text-sm">
                  Word Yuklash
                  <input type="file" className="hidden" accept=".docx" onChange={async (e) => {
                    const file = e.target.files[0]; if (!file) return;
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
                <button onClick={() => setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correctAnswer: '0' }, ...questions])} className="px-8 py-4 bg-orange-500 rounded-2xl font-black text-sm">+ QO'SHISH</button>
              </div>
            </div>

            <div className="grid gap-8">
              {filteredQuestions.map((q, qIdx) => (
                <div key={q.uid} className="bg-[#141414] border border-white/5 p-10 rounded-[48px] space-y-8">
                  <div className="flex justify-between items-center">
                    <span className="px-4 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-[10px] font-bold">SAVOL #{questions.length - qIdx} ({q.correctAnswer})</span>
                    <button onClick={() => setQuestions(questions.filter(it => it.uid !== q.uid))} className="text-white/10 hover:text-red-500"><Trash2 size={24} /></button>
                  </div>
                  <textarea value={q.text || ''} onChange={e => { const u = [...questions]; u[questions.findIndex(it => it.uid === q.uid)].text = e.target.value; setQuestions(u); }} className="w-full bg-transparent border-none text-2xl font-bold focus:outline-none text-white" rows={2} />
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    {q.options?.map((opt, oIdx) => {
                      const sanitize = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                      const sCorrect = sanitize(q.correctAnswer);
                      const sOpt = sanitize(opt);
                      const sLetter = String.fromCharCode(97 + oIdx);
                      const sIndex = String(oIdx);

                      const isCorrect = sCorrect === sIndex || sCorrect === sLetter || sCorrect === sOpt || (sCorrect.length > 0 && sOpt.startsWith(sCorrect));

                      return (
                        <div key={oIdx} className={`p-8 rounded-[32px] border-4 transition-all flex items-start gap-6 ${isCorrect ? 'border-green-500 bg-green-500/5 border-l-[16px]' : 'border-white/5 bg-black/20'}`}>
                          <button 
                            onClick={() => { const u = [...questions]; u[questions.findIndex(it => it.uid === q.uid)].correctAnswer = String(oIdx); setQuestions(u); }} 
                            className={`w-14 h-14 min-w-[56px] rounded-2xl flex items-center justify-center font-black text-xl ${isCorrect ? 'bg-green-500 text-white' : 'bg-white/5 text-white/30'}`}
                          >
                            {isCorrect ? <Check size={32} strokeWidth={4} /> : String.fromCharCode(65 + oIdx)}
                          </button>
                          <textarea 
                            value={opt || ''} 
                            onChange={e => { const u = [...questions]; u[questions.findIndex(it => it.uid === q.uid)].options[oIdx] = e.target.value; setQuestions(u); }} 
                            className="flex-1 bg-transparent border-none font-black text-lg focus:outline-none text-white"
                            rows={Math.max(1, Math.ceil((opt || '').length / 40))}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="fixed bottom-12 right-12 z-50">
               <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Barchasi saqlandi!"))} className="px-12 py-6 bg-orange-500 rounded-full font-black text-2xl shadow-2xl text-white">SAQLASH</button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
           <div className="bg-[#141414] border border-white/5 rounded-[48px] overflow-hidden">
             <div className="p-12 flex justify-between items-center border-b border-white/5">
                <h3 className="text-3xl font-black">Natijalar</h3>
                <button onClick={() => window.print()} className="px-10 py-5 bg-green-600 rounded-2xl font-black text-sm text-white">PRINT</button>
             </div>
             <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-white/20 uppercase border-b border-white/5"><th className="p-10">Talaba</th><th className="p-10 text-center">Natija</th><th className="p-10 text-center">Baho</th><th className="p-10 text-right">Sana</th></tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="p-10 font-bold text-xl">{r.student?.name} {r.student?.surname}</td>
                      <td className="p-10 text-center"><span className="text-orange-500">{r.score}/{r.total}</span></td>
                      <td className="p-10 text-center font-black text-3xl">{r.grade}</td>
                      <td className="p-10 text-right text-white/20">{new Date(r.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-[#141414] border border-white/5 p-12 rounded-[48px] space-y-10">
              <h3 className="text-3xl font-black">Mezonlar</h3>
              <div className="space-y-4">
                {criteria.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-8 bg-black/40 border border-white/5 rounded-[32px]">
                    <span className="text-3xl font-black text-orange-500">{c.grade}</span>
                    <input type="number" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-32 text-center text-white" value={c.min} onChange={e => { const u = [...criteria]; u[i].min = parseInt(e.target.value); setCriteria(u); }} />
                  </div>
                ))}
              </div>
              <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Saqlandi"))} className="w-full bg-orange-500 py-6 rounded-[32px] font-black">SAQLASH</button>
            </div>
            <div className="bg-[#141414] border border-white/5 p-12 rounded-[48px] space-y-10">
              <h3 className="text-3xl font-black">Test Sozlamalari</h3>
              <div className="space-y-8">
                <div className="space-y-3"><label className="text-xs text-white/40">Savollar soni</label><input type="number" className="w-full bg-black/40 border border-white/10 rounded-3xl px-8 py-5 text-white" value={settings.questionsPerTest} onChange={e => setSettings({...settings, questionsPerTest: parseInt(e.target.value)})} /></div>
              </div>
              <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Saqlandi"))} className="w-full bg-blue-600 py-6 rounded-[32px] font-black">SAQLASH</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;