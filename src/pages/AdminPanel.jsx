import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { parseWordQuiz } from '../utils/wordParser';
import mammoth from 'mammoth';
import { 
  Plus, Trash2, Check, Copy, Share2, LogOut, 
  BookOpen, AlertCircle, CheckCircle, Link2,
  BarChart3, Award, Settings, FileUp, Save, Lock,
  ChevronRight, MoreVertical, Search
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

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      showToast("Tizimga kirishda xatolik yuz berdi", "error");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const result = await mammoth.extractRawText({ arrayBuffer });
      const importedQuestions = parseWordQuiz(result.value).map(q => ({ ...q, uid: Math.random().toString(36).substr(2, 9) }));
      
      if (importedQuestions.length > 0) {
        setQuestions([...questions, ...importedQuestions]);
        showToast(`${importedQuestions.length} ta savol yuklandi`);
      } else {
        showToast("Format xato yoki savollar topilmadi", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center py-20 hero-mesh px-6">
      <div className="card-premium max-w-md w-full space-y-10 animate-slide-up text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center mx-auto text-primary">
          <Lock size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-h2">Ranch Console</h2>
          <p className="text-dim">Admin boshqaruviga xush kelibsiz</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.email.value, e.target.password.value); }}>
          <input className="input-premium" type="email" name="email" placeholder="Email manzilingiz" required />
          <input className="input-premium" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="btn btn-primary w-full py-5 text-lg">Kirish</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen hero-mesh pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[1000] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up ${
          toast.type === 'success' ? 'bg-[#00D68F] text-white' : 'bg-[#FF4D4D] text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="container">
        {/* Modern Navbar */}
        <header className="flex justify-between items-center py-10 border-b border-white/5 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">R</div>
            <div>
              <h1 className="text-xl font-black">Ranch <span className="text-primary">Admin</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-muted font-black">Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-bold">Adminstrator</span>
              <span className="text-[10px] text-muted">{auth.currentUser?.email}</span>
            </div>
            <button onClick={() => auth.signOut()} className="btn btn-secondary px-6">
              <LogOut size={18} /> Chiqish
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex gap-2 mb-12 bg-white/[0.03] p-2 rounded-2xl border border-white/5 inline-flex">
          {[
            { id: 'questions', label: 'Savollar', icon: BookOpen },
            { id: 'sessions', label: 'Havolalar', icon: Share2 },
            { id: 'results', label: 'Natijalar', icon: BarChart3 },
            { id: 'criteria', label: 'Baholash', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary border-none bg-transparent'} px-8 rounded-xl`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>

        {/* Dynamic Content */}
        <main className="anim-up">
          {activeTab === 'questions' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[32px] border border-white/5">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">Savollar Bazasi</h3>
                  <p className="text-dim text-sm">Jami {questions.length} ta savol mavjud</p>
                </div>
                <div className="flex gap-4">
                  <label className="btn btn-secondary cursor-pointer">
                    <FileUp size={20} /> Word Yuklash
                    <input type="file" className="hidden" accept=".docx" onChange={handleFileUpload} />
                  </label>
                  <button onClick={() => { setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correct: 0 }, ...questions]); }} className="btn btn-primary">
                    <Plus size={20} /> Savol Qo'shish
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                {questions.map((q, idx) => (
                  <div key={q.uid} className="card-premium group hover:border-primary/20 transition-colors">
                    <div className="flex flex-col gap-8">
                      <div className="flex justify-between items-start gap-10">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="badge-premium">Savol #{questions.length - idx}</span>
                            <span className="text-[10px] text-muted font-bold tracking-widest uppercase">ID: {q.uid}</span>
                          </div>
                          <textarea
                            value={q.text}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].text = e.target.value;
                              setQuestions(updated);
                            }}
                            className="bg-transparent border-none text-2xl font-bold w-full resize-none text-white focus:outline-none leading-relaxed"
                            rows={2}
                          />
                        </div>
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-muted hover:text-primary transition-colors p-2">
                          <Trash2 size={24} />
                        </button>
                      </div>

                      <div className="grid grid-2 gap-4">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className={`flex items-center gap-4 p-6 rounded-[20px] border-2 transition-all ${
                            q.correct === optIdx ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/[0.02]'
                          }`}>
                            <button 
                              onClick={() => {
                                const updated = [...questions];
                                updated[idx].correct = optIdx;
                                setQuestions(updated);
                              }}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                                q.correct === optIdx ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-muted hover:bg-white/10'
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
                              className="bg-transparent border-none flex-1 text-white font-medium text-lg focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-12 right-12 z-50">
                <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Barcha savollar muvaffaqiyatli saqlandi"))} className="btn btn-primary px-12 py-6 rounded-[24px] text-xl shadow-[0_20px_50px_rgba(255,59,0,0.4)] scale-110">
                  <Save size={28} /> Barchasini Saqlash
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="grid grid-2 gap-10">
              <div className="card-premium space-y-10">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Yangi Havola Yaratish</h3>
                  <p className="text-dim text-sm">Talabalarga yuborish uchun test seansi yarating</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Test Nomi</label>
                    <input 
                      className="input-premium" 
                      placeholder="Masalan: Yakuniy Nazorat 2026" 
                      value={sessionName}
                      onChange={e => setSessionName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-2 gap-4">
                    <button onClick={() => setGenMode('random')} className={`btn ${genMode === 'random' ? 'btn-primary' : 'btn-secondary'} py-5`}>Tasodifiy</button>
                    <button onClick={() => setGenMode('manual')} className={`btn ${genMode === 'manual' ? 'btn-primary' : 'btn-secondary'} py-5`}>Tanlash</button>
                  </div>
                  {genMode === 'random' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Savollar Soni</label>
                      <input type="number" className="input-premium" value={randomCount} onChange={e => setRandomCount(parseInt(e.target.value))} />
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                      {questions.map(q => (
                        <div key={q.uid} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedQIds.includes(q.uid) ? 'border-primary bg-primary/5' : 'border-white/5 bg-black/20'
                        }`} onClick={() => {
                          if (selectedQIds.includes(q.uid)) setSelectedQIds(selectedQIds.filter(id => id !== q.uid));
                          else setSelectedQIds([...selectedQIds, q.uid]);
                        }}>
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${selectedQIds.includes(q.uid) ? 'bg-primary text-white' : 'bg-white/10'}`}>
                            {selectedQIds.includes(q.uid) && <Check size={14} />}
                          </div>
                          <span className="truncate text-sm font-medium">{q.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={() => {
                    if (genMode === 'random' && questions.length < randomCount) return showToast("Savollar yetarli emas", "error");
                    const qIds = genMode === 'random' ? [...questions].sort(() => 0.5-Math.random()).slice(0, randomCount).map(q => q.uid) : selectedQIds;
                    if (qIds.length === 0) return showToast("Savollarni tanlang", "error");
                    storage.saveSession(adminUid, { name: sessionName || `Test ${sessions.length + 1}`, questionIds: qIds }).then(s => {
                      setSessions([s, ...sessions]);
                      setSessionName('');
                      setSelectedQIds([]);
                      showToast("Test havolasi yaratildi");
                    });
                  }} className="btn btn-primary w-full py-6 text-xl shadow-xl shadow-primary/20">
                    <Link2 size={24} /> Havola Yaratish
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Share2 size={24} className="text-primary" /> Mavjud Havolalar
                </h3>
                <div className="grid gap-4">
                  {sessions.map(s => (
                    <div key={s.id} className="card-premium !p-6 flex justify-between items-center gap-4 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-dim group-hover:text-primary transition-colors">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold">{s.name}</h4>
                          <p className="text-[10px] text-muted uppercase tracking-widest font-black">{s.questionIds.length} savol • {new Date(s.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const url = `${window.location.origin}/quiz?testId=${adminUid}_${s.id}`;
                          navigator.clipboard.writeText(url).then(() => showToast("Nusxalandi"));
                        }} className="btn btn-secondary px-5 py-2.5 text-sm">Nusxa</button>
                        <button onClick={() => {
                          if (window.confirm("O'chirilsinmi?")) {
                            storage.deleteSession(adminUid, s.id);
                            setSessions(sessions.filter(it => it.id !== s.id));
                            showToast("Havola o'chirildi", "error");
                          }
                        }} className="text-muted hover:text-primary transition-colors p-2"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="card-premium !p-0 overflow-hidden">
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Imtihon Natijalari</h3>
                  <p className="text-dim text-sm">Barcha urinishlar va baholar statistikasi</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input className="input-premium py-3 pl-12 w-64 text-sm" placeholder="Talaba ismi..." />
                  </div>
                </div>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    <th className="p-8 text-[10px] font-black text-muted uppercase tracking-widest">Talaba F.I.SH</th>
                    <th className="p-8 text-[10px] font-black text-muted uppercase tracking-widest text-center">To'g'ri Javoblar</th>
                    <th className="p-8 text-[10px] font-black text-muted uppercase tracking-widest text-center">Baho</th>
                    <th className="p-8 text-[10px] font-black text-muted uppercase tracking-widest text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">{r.student.name[0]}</div>
                          <span className="font-bold text-lg">{r.student.name} {r.student.surname}</span>
                        </div>
                      </td>
                      <td className="p-8 text-center">
                        <span className="px-4 py-2 bg-white/5 rounded-lg font-mono font-bold text-xl">{r.score}/{r.total}</span>
                      </td>
                      <td className="p-8 text-center">
                        <span className={`px-5 py-2 rounded-xl font-black text-xl shadow-lg ${
                          r.grade >= 4 ? 'bg-[#00D68F]/10 text-[#00D68F]' : 'bg-primary/10 text-primary'
                        }`}>
                          {r.grade}
                        </span>
                      </td>
                      <td className="p-8 text-right text-dim text-sm">{new Date(r.date).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="max-w-xl mx-auto py-10 space-y-10">
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-black gradient-text">Baholash Mezonlari</h3>
                <p className="text-dim">Har bir baho uchun minimal ballarni belgilang</p>
              </div>
              <div className="card-premium space-y-6">
                {criteria.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-8 p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-primary/20 transition-all">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl font-black text-primary shadow-xl shadow-primary/10">
                      {c.grade}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Minimal Ball</label>
                      <input
                        type="number"
                        className="input-premium py-4"
                        value={c.min}
                        onChange={(e) => {
                          const updated = [...criteria];
                          updated[idx].min = parseInt(e.target.value);
                          setCriteria(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Mezonlar saqlandi"))} className="btn btn-primary w-full py-6 text-xl mt-6">
                  <Save size={24} /> O'zgarishlarni Tasdiqlash
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
