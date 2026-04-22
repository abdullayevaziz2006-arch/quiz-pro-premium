import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { parseWordQuiz } from '../utils/wordParser';
import mammoth from 'mammoth';
import { 
  Plus, Trash2, Check, Copy, Share2, LogOut, 
  BookOpen, AlertCircle, CheckCircle, Link2,
  BarChart3, Award, FileUp, Save, Lock,
  Search, Calendar, ChevronRight
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [results, setResults] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [genMode, setGenMode] = useState('random');
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [sessionName, setSessionName] = useState('');
  const [randomCount, setRandomCount] = useState(20);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUid, setAdminUid] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
       if (user) {
          setIsAuthenticated(true);
          setAdminUid(user.uid);
       } else {
          setIsAuthenticated(false);
          setAdminUid(null);
       }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (adminUid) loadData();
  }, [adminUid]);

  const loadData = async () => {
    if(!adminUid) return;
    setQuestions(await storage.getQuestions(adminUid));
    setCriteria(await storage.getCriteria(adminUid));
    setResults(await storage.getResults(adminUid));
    setSessions(await storage.getSessions(adminUid));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value);
    } catch (err) {
      showToast("Email yoki parol xato!", "error");
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-white/5 p-10 rounded-[32px] shadow-2xl space-y-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
          <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-black">Ranch Console</h2>
          <p className="text-white/40 text-sm">Boshqaruv markaziga xush kelibsiz</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/50 transition-all" type="email" name="email" placeholder="Email manzilingiz" required />
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/50 transition-all" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl font-black text-lg transition-all shadow-lg shadow-primary/20">Kirish</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight">Xayrli kun, <span className="text-primary">Admin!</span></h1>
          <p className="text-white/40 font-medium">Barcha tizimlar barqaror ishlamoqda.</p>
        </div>
        <button onClick={() => auth.signOut()} className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-sm font-bold uppercase tracking-widest">
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-2xl inline-flex">
        {[
          { id: 'questions', label: 'Savollar', icon: BookOpen },
          { id: 'sessions', label: 'Havolalar', icon: Share2 },
          { id: 'results', label: 'Natijalar', icon: BarChart3 },
          { id: 'criteria', label: 'Baholash', icon: Award },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'questions' && (
          <div className="space-y-8">
            <div className="bg-card border border-white/5 p-8 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Savollar Bazasi</h3>
                <p className="text-sm text-white/40">Jami {questions.length} ta savol yuklangan</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <label className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-all text-sm font-bold uppercase tracking-widest">
                  <FileUp size={20} /> Word Yuklash
                  <input type="file" className="hidden" accept=".docx" onChange={async (e) => {
                    const file = e.target.files[0];
                    if(!file) return;
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    const imported = parseWordQuiz(result.value).map(q => ({ ...q, uid: Math.random().toString(36).substr(2, 9) }));
                    setQuestions([...questions, ...imported]);
                    showToast(`${imported.length} ta savol qo'shildi`);
                  }} />
                </label>
                <button onClick={() => setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correct: 0 }, ...questions])} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary/90 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all">
                  <Plus size={20} /> Savol Qo'shish
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {questions.map((q, idx) => (
                <div key={q.uid} className="bg-card border border-white/5 p-8 rounded-[32px] hover:border-primary/20 transition-all group">
                  <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/40">Savol #{idx + 1}</div>
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-white/20 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <textarea
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].text = e.target.value;
                          setQuestions(updated);
                        }}
                        className="w-full bg-transparent border-none text-2xl font-bold text-white focus:outline-none resize-none leading-relaxed"
                        rows={2}
                      />
                    </div>
                    <div className="lg:w-1/2 grid sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                          q.correct === optIdx ? 'border-primary bg-primary/5' : 'border-white/5 bg-black/20'
                        }`}>
                          <button 
                            onClick={() => {
                              const updated = [...questions];
                              updated[idx].correct = optIdx;
                              setQuestions(updated);
                            }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                              q.correct === optIdx ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </button>
                          <input
                            value={opt}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].options[optIdx] = e.target.value;
                              setQuestions(updated);
                            }}
                            className="bg-transparent border-none flex-1 text-white font-medium focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-10 pb-20">
              <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Barcha o'zgarishlar saqlandi"))} className="flex items-center gap-3 px-12 py-5 bg-primary hover:bg-primary/90 rounded-2xl font-black text-xl shadow-2xl shadow-primary/40 transition-all">
                <Save size={24} /> Barchasini Saqlash
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-card border border-white/5 p-10 rounded-[40px] space-y-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Yangi Havola</h3>
                <p className="text-white/40 text-sm">Talabalar uchun test seansini yarating</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Test Nomi</label>
                  <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary/50 transition-all" placeholder="Masalan: Yakuniy Nazorat" value={sessionName} onChange={e => setSessionName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setGenMode('random')} className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-xs border transition-all ${genMode === 'random' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/40'}`}>Tasodifiy</button>
                  <button onClick={() => setGenMode('manual')} className={`py-4 rounded-2xl font-bold uppercase tracking-widest text-xs border transition-all ${genMode === 'manual' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/40'}`}>Tanlash</button>
                </div>
                <button onClick={() => {
                  const qIds = genMode === 'random' ? [...questions].sort(() => 0.5-Math.random()).slice(0, randomCount).map(q => q.uid) : selectedQIds;
                  if(qIds.length === 0) return showToast("Savollarni tanlang", "error");
                  storage.saveSession(adminUid, { name: sessionName || 'Yangi Test', questionIds: qIds }).then(s => {
                    setSessions([s, ...sessions]);
                    setSessionName('');
                    showToast("Muvaffaqiyatli yaratildi");
                  });
                }} className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3">
                  <Link2 size={24} /> Havola Yaratish
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold px-2">Mavjud Havolalar</h3>
              <div className="grid gap-4">
                {sessions.map(s => (
                  <div key={s.id} className="bg-card border border-white/5 p-6 rounded-3xl flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                        <Share2 size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold">{s.name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{s.questionIds.length} savol</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/quiz?testId=${adminUid}_${s.id}`);
                        showToast("Nusxalandi");
                      }} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">Link</button>
                      <button onClick={() => {
                        if(window.confirm("O'chirilsinmi?")) {
                          storage.deleteSession(adminUid, s.id);
                          setSessions(sessions.filter(it => it.id !== s.id));
                          showToast("Havola o'chirildi", "error");
                        }
                      }} className="text-white/20 hover:text-red-500 p-2"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-card border border-white/5 rounded-[40px] overflow-hidden">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="text-2xl font-bold">Imtihon Natijalari</h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input className="bg-black/40 border border-white/5 rounded-xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-primary/50 w-64" placeholder="Qidirish..." />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <th className="p-10">Talaba F.I.SH</th>
                    <th className="p-10 text-center">Natija</th>
                    <th className="p-10 text-center">Baho</th>
                    <th className="p-10 text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">{r.student.name[0]}</div>
                          <span className="font-bold text-lg">{r.student.name} {r.student.surname}</span>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <span className="px-4 py-2 bg-white/5 rounded-xl font-mono font-bold text-lg">{r.score}/{r.total}</span>
                      </td>
                      <td className="p-10 text-center">
                        <span className={`px-5 py-2 rounded-xl font-black text-xl ${
                          r.grade >= 4 ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'
                        }`}>{r.grade}</span>
                      </td>
                      <td className="p-10 text-right text-white/30 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
