import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
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
        setQuestions([...questions, ...importedQuestions]);
        showToast(`${importedQuestions.length} ta savol yuklandi!`);
      } else {
        showToast("Formatni tekshiring.", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveQuestions = async () => {
    await storage.saveQuestions(adminUid, questions);
    showToast("Saqlandi!");
  };

  const handleCreateSession = async () => {
    let qIds = [];
    if (genMode === 'random') {
      if (questions.length < randomCount) {
        showToast(`Savollar kam!`, "error");
        return;
      }
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      qIds = shuffled.slice(0, randomCount).map(q => q.uid);
    } else {
      qIds = selectedQIds;
    }

    if (qIds.length === 0) {
      showToast("Tanlang!", "error");
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
      showToast("Havola yaratildi!");
    }
  };

  const copyToClipboard = (id) => {
    const url = `${window.location.origin}/quiz?testId=${adminUid}_${id}`;
    navigator.clipboard.writeText(url);
    showToast("Nusxalandi!");
  };

  if (!isAuthenticated) return (
    <div className="flex items-center justify-center py-20">
      <div className="premium-card max-w-md w-full text-center space-y-6 animate-slide-up">
        <Lock className="text-primary mx-auto" size={48} />
        <h2 className="text-2xl">Admin Panel</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(e.target.email.value, e.target.password.value); }}>
          <input className="input-field" type="email" name="email" placeholder="Email" required />
          <input className="input-field" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="btn btn-primary w-full">Kirish</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[1000] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-[#00D68F] text-white' : 'bg-[#FF4D4D] text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl">Ranch Quiz</h1>
          <p className="text-dim">Admin Boshqaruv Paneli</p>
        </div>
        <button onClick={() => auth.signOut()} className="btn btn-secondary">
          <LogOut size={18} /> Chiqish
        </button>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2">
        {[
          { id: 'questions', label: 'Savollar', icon: BookOpen },
          { id: 'sessions', label: 'Havolalar', icon: Share2 },
          { id: 'results', label: 'Natijalar', icon: BarChart3 },
          { id: 'criteria', label: 'Baholash', icon: Award },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main>
        {activeTab === 'questions' && (
          <div className="space-y-6">
            <div className="premium-card flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold">Savollar ({questions.length})</h3>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <label className="btn btn-secondary cursor-pointer flex-1 md:flex-none">
                  <FileUp size={18} /> Word
                  <input type="file" className="hidden" accept=".docx" onChange={handleFileUpload} />
                </label>
                <button onClick={() => { setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correct: 0 }, ...questions]); }} className="btn btn-primary flex-1 md:flex-none">
                  <Plus size={18} /> Qo'shish
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {questions.map((q, idx) => (
                <div key={q.uid} className="premium-card space-y-4">
                  <div className="flex justify-between gap-4">
                    <textarea
                      value={q.text}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].text = e.target.value;
                        setQuestions(updated);
                      }}
                      className="bg-transparent border-none text-xl font-bold w-full resize-none text-white focus:outline-none"
                      rows={2}
                    />
                    <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-[#FF4D4D] hover:opacity-70 transition-opacity">
                      <Trash2 size={24} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className={`flex items-center gap-3 p-3 rounded-xl border ${
                        q.correct === optIdx ? 'border-[#00D68F] bg-[#00D68F]/5' : 'border-white/5'
                      }`}>
                        <button 
                          onClick={() => {
                            const updated = [...questions];
                            updated[idx].correct = optIdx;
                            setQuestions(updated);
                          }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            q.correct === optIdx ? 'bg-[#00D68F] text-white' : 'bg-white/10'
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
                          className="bg-transparent border-none flex-1 text-white focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 flex justify-center">
              <button onClick={handleSaveQuestions} className="btn btn-primary px-12 py-5 text-xl rounded-2xl">
                <Save size={24} /> Barcha O'zgarishlarni Saqlash
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="premium-card max-w-2xl mx-auto space-y-4">
              <h2 className="text-xl font-bold">Yangi Test Yaratish</h2>
              <input 
                className="input-field" 
                placeholder="Test nomi..." 
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setGenMode('random')} className={`btn ${genMode === 'random' ? 'btn-primary' : 'btn-secondary'}`}>Random</button>
                <button onClick={() => setGenMode('manual')} className={`btn ${genMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}>Manual</button>
              </div>
              <button onClick={handleCreateSession} className="btn btn-primary w-full">Yaratish</button>
            </div>

            <div className="grid gap-4">
              {sessions.map(s => (
                <div key={s.id} className="premium-card flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-bold">{s.name}</h4>
                    <p className="text-dim text-sm">{s.questionIds.length} savol</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(s.id)} className="btn btn-secondary px-4 py-2 text-sm"><Copy size={16} /> Link</button>
                    <button onClick={() => { storage.deleteSession(adminUid, s.id); setSessions(sessions.filter(it => it.id !== s.id)); }} className="text-[#FF4D4D] p-2"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="premium-card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-4 px-2 text-dim text-sm uppercase">Talaba</th>
                  <th className="py-4 px-2 text-dim text-sm uppercase">Ball</th>
                  <th className="py-4 px-2 text-dim text-sm uppercase">Baho</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className="py-4 px-2 font-bold">{r.student.name} {r.student.surname}</td>
                    <td className="py-4 px-2">{r.score}/{r.total}</td>
                    <td className="py-4 px-2 font-black text-[#00D68F]">{r.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
