import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { parseWordQuiz } from '../utils/wordParser';
import mammoth from 'mammoth';
import { 
  Plus, Trash2, Check, Copy, Share2, LogOut, 
  BookOpen, AlertCircle, CheckCircle, Link2,
  BarChart3, Award, Settings, FileUp, Save, Lock
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
      showToast("Email yoki parol xato!", "error");
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
        const updated = [...questions, ...importedQuestions];
        setQuestions(updated);
        showToast(`${importedQuestions.length} ta savol yuklandi!`);
      } else {
        showToast("Savollar topilmadi. Formatni tekshiring.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveQuestions = async () => {
    if (questions.length === 0) {
      showToast("Saqlash uchun savollar yo'q!", "error");
      return;
    }
    await storage.saveQuestions(adminUid, questions);
    showToast("Barcha savollar saqlandi!");
  };

  const handleCreateSession = async () => {
    let qIds = [];
    if (genMode === 'random') {
      if (questions.length < randomCount) {
        showToast(`Savollar yetarli emas! (Jami: ${questions.length})`, "error");
        return;
      }
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      qIds = shuffled.slice(0, randomCount).map(q => q.uid);
    } else {
      qIds = selectedQIds;
    }

    if (qIds.length === 0) {
      showToast("Savollarni tanlang!", "error");
      return;
    }

    const newSession = await storage.saveSession(adminUid, {
      name: sessionName || `Test ${sessions.length + 1}`,
      questionIds: qIds
    });

    if (newSession) {
      setSessions([newSession, ...sessions]);
      setSessionName('');
      setSelectedQIds([]);
      showToast("Test havolasi yaratildi!");
    } else {
      showToast("Saqlashda xatolik yuz berdi.", "error");
    }
  };

  const copyToClipboard = (id) => {
    const url = `${window.location.origin}/quiz?testId=${adminUid}_${id}`;
    navigator.clipboard.writeText(url);
    showToast("Havola nusxalandi!");
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm("Ushbu testni o'chirmoqchimisiz?")) {
      await storage.deleteSession(adminUid, id);
      setSessions(sessions.filter(s => s.id !== id));
      showToast("Test o'chirildi.");
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center p-6 mesh-bg">
      <div className="premium-card glass max-w-md w-full text-center space-y-8 animate-slide-up">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Lock className="text-primary" size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black heading-gradient">Ranch Admin</h2>
          <p className="text-text-dim">Boshqaruv paneliga xush kelibsiz</p>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.email.value, e.target.password.value); }}>
          <input className="input-field" type="email" name="email" placeholder="Email" required />
          <input className="input-field" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="btn btn-primary w-full py-5 text-lg">Kirish</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 mesh-bg">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-slide-up flex items-center gap-4 ${
          toast.type === 'success' ? 'bg-success/20 text-success border border-success/30' : 'bg-danger/20 text-danger border border-danger/30'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <header className="py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 animate-slide-up">
          <div className="space-y-2">
            <h1 className="text-5xl font-black heading-primary">Ranch Quiz</h1>
            <p className="text-text-dim font-medium">Savollarni boshqarish va testlar yaratish portali</p>
          </div>
          <button onClick={() => auth.signOut()} className="btn btn-secondary px-8">
            <LogOut size={20} /> Chiqish
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-3 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {[
            { id: 'questions', label: 'Savollar', icon: BookOpen },
            { id: 'sessions', label: 'Havolalar', icon: Share2 },
            { id: 'results', label: 'Natijalar', icon: BarChart3 },
            { id: 'criteria', label: 'Baholash', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'} rounded-2xl px-6 py-4`}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {activeTab === 'questions' && (
            <div className="space-y-8">
              <div className="premium-card glass flex flex-col md:flex-row gap-6 justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">Savollar Bazasi</h3>
                  <p className="text-text-dim">Jami {questions.length} ta savol yuklangan</p>
                </div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <label className="btn btn-secondary cursor-pointer flex-1 md:flex-none">
                    <FileUp size={20} /> Word Yuklash
                    <input type="file" className="hidden" accept=".docx" onChange={handleFileUpload} />
                  </label>
                  <button onClick={() => { setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correct: 0 }, ...questions]); }} className="btn btn-primary flex-1 md:flex-none">
                    <Plus size={20} /> Qo'shish
                  </button>
                </div>
              </div>

              <div className="grid gap-6">
                {questions.map((q, idx) => (
                  <div key={q.uid} className="premium-card glass group">
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <textarea
                            value={q.text}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].text = e.target.value;
                              setQuestions(updated);
                            }}
                            className="bg-transparent border-none text-xl font-bold w-full resize-none focus:ring-0 p-0 text-white"
                            rows={2}
                          />
                        </div>
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-danger/40 hover:text-danger p-2 transition-colors">
                          <Trash2 size={24} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                            q.correct === optIdx ? 'border-success bg-success/5' : 'border-white/5 bg-black/20'
                          }`}>
                            <button 
                              onClick={() => {
                                const updated = [...questions];
                                updated[idx].correct = optIdx;
                                setQuestions(updated);
                              }}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                q.correct === optIdx ? 'bg-success text-white' : 'bg-white/5 text-text-dim'
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
                              className="bg-transparent border-none flex-1 font-medium text-white focus:ring-0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="fixed bottom-10 right-10 z-50">
                <button onClick={handleSaveQuestions} className="btn btn-primary px-10 py-6 rounded-3xl shadow-[0_20px_50px_rgba(255,59,0,0.5)] scale-110">
                  <Save size={24} /> Barcha O'zgarishlarni Saqlash
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-8">
              <div className="premium-card glass grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-primary uppercase tracking-widest">Test Nomi</label>
                    <input 
                      className="input-field" 
                      placeholder="Masalan: 2-Smena matematika..." 
                      value={sessionName}
                      onChange={e => setSessionName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setGenMode('random')} className={`btn ${genMode === 'random' ? 'btn-primary' : 'btn-secondary'} py-5`}>
                      Tasodifiy
                    </button>
                    <button onClick={() => setGenMode('manual')} className={`btn ${genMode === 'manual' ? 'btn-primary' : 'btn-secondary'} py-5`}>
                      Tanlash
                    </button>
                  </div>
                  {genMode === 'random' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-black text-primary uppercase tracking-widest">Savollar soni</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        value={randomCount}
                        onChange={e => setRandomCount(parseInt(e.target.value))}
                      />
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2">
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
                  <button onClick={handleCreateSession} className="btn btn-primary w-full py-5 text-lg">
                    <Link2 size={20} /> Havola Yaratish
                  </button>
                </div>
                <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Share2 size={32} />
                  </div>
                  <h4 className="text-xl font-bold">Ulashish</h4>
                  <p className="text-sm text-text-dim">Havola yarating va uni talabalarga yuboring. Ular darhol testni boshlashlari mumkin.</p>
                </div>
              </div>

              <div className="grid gap-4">
                {sessions.map(s => (
                  <div key={s.id} className="premium-card glass flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                        <BookOpen size={28} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{s.name}</h4>
                        <p className="text-text-dim text-sm">{s.questionIds.length} ta savol • {new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button onClick={() => copyToClipboard(s.id)} className="btn btn-secondary flex-1 md:flex-none">
                        <Copy size={18} /> Nusxa
                      </button>
                      <button onClick={() => handleDeleteSession(s.id)} className="btn btn-secondary text-danger hover:bg-danger/10 border-danger/20 flex-1 md:flex-none">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-8">
              <div className="premium-card glass flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">Imtihon Natijalari</h3>
                  <p className="text-text-dim">Jami {results.length} ta urinish</p>
                </div>
              </div>

              <div className="premium-card glass overflow-x-auto p-0">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-6 text-sm font-black text-primary uppercase">Talaba</th>
                      <th className="p-6 text-sm font-black text-primary uppercase">Ball</th>
                      <th className="p-6 text-sm font-black text-primary uppercase">Baho</th>
                      <th className="p-6 text-sm font-black text-primary uppercase">Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                              {r.student.name[0]}
                            </div>
                            <span className="font-bold">{r.student.name} {r.student.surname}</span>
                          </div>
                        </td>
                        <td className="p-6 font-mono font-bold text-lg">{r.score}/{r.total}</td>
                        <td className="p-6">
                          <span className={`badge ${r.grade >= 4 ? 'badge-success' : 'badge-primary'}`}>
                            {r.grade} Baho
                          </span>
                        </td>
                        <td className="p-6 text-text-dim text-sm">{new Date(r.date).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="premium-card glass space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black heading-gradient">Baholash Mezonlari</h3>
                  <p className="text-text-dim">Ballarga qarab baholarni belgilang</p>
                </div>
                <div className="space-y-6">
                  {criteria.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-6 p-6 bg-black/20 rounded-3xl border border-white/5">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl font-black text-primary">
                        {c.grade}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-black text-text-dim uppercase tracking-widest">Minimal Ball</label>
                        <input
                          type="number"
                          className="input-field"
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
                  <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Mezonlar saqlandi!"))} className="btn btn-primary w-full py-5 text-lg">
                    <Save size={20} /> Mezonlarni Saqlash
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
