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
  Filter, Trash
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
    const [qs, cr, rs, ss, st] = await Promise.all([
      storage.getQuestions(adminUid),
      storage.getCriteria(adminUid),
      storage.getResults(adminUid),
      storage.getSessions(adminUid),
      storage.getSettings(adminUid)
    ]);
    setQuestions(qs);
    setCriteria(cr);
    setResults(rs);
    setSessions(ss);
    setSettings(st);
    setLoading(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const exportToCSV = () => {
    const headers = ['Ism', 'Familiya', 'Guruh', 'Fakultet', 'Ball', 'Jami', 'Baho', 'Sana'];
    const rows = results.map(r => [
      r.student.name,
      r.student.surname,
      r.student.group,
      r.student.faculty,
      r.score,
      r.total,
      r.grade,
      new Date(r.date).toLocaleString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `quiz_results_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Natijalar yuklab olindi");
  };

  const stats = useMemo(() => {
    const totalStudents = results.length;
    const avgScore = totalStudents > 0 ? (results.reduce((acc, curr) => acc + curr.score, 0) / totalStudents).toFixed(1) : 0;
    const avgGrade = totalStudents > 0 ? (results.reduce((acc, curr) => acc + parseInt(curr.grade), 0) / totalStudents).toFixed(1) : 0;
    return { totalStudents, avgScore, avgGrade, totalQuestions: questions.length };
  }, [results, questions]);

  const filteredResults = results.filter(r => 
    `${r.student.name} ${r.student.surname} ${r.student.group}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated && !loading) return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-white/5 p-12 rounded-[40px] shadow-2xl space-y-8 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mx-auto text-primary border border-primary/20">
          <Lock size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-heading font-black">Ranch Console</h2>
          <p className="text-white/40 text-sm">Boshqaruv markaziga xush kelibsiz</p>
        </div>
        <form onSubmit={async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value); } catch(err) { showToast("Xato!", "error"); } }} className="space-y-4">
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-primary/50 transition-all font-medium" type="email" name="email" placeholder="Email" required />
          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-primary/50 transition-all font-medium" type="password" name="password" placeholder="Parol" required />
          <button type="submit" className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-primary/20">Kirish</button>
        </form>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Global Toast */}
      {toast && (
        <div className={`fixed bottom-10 right-10 z-[100] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Modern Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-black tracking-tight flex items-center gap-4">
            Boshqaruv <span className="text-primary">Paneli</span>
          </h1>
          <p className="text-white/40 font-medium">Tizim holati: <span className="text-green-500">Aktiv</span> • {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('settings')} className={`p-4 rounded-2xl border transition-all ${activeTab === 'settings' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}>
            <Settings size={20} />
          </button>
          <button onClick={() => auth.signOut()} className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-sm font-bold uppercase tracking-widest">
            <LogOut size={18} /> Chiqish
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-[24px] inline-flex">
        {[
          { id: 'dashboard', label: 'Statistika', icon: BarChart3 },
          { id: 'questions', label: 'Savollar', icon: BookOpen },
          { id: 'sessions', label: 'Havolalar', icon: Share2 },
          { id: 'results', label: 'Natijalar', icon: Award },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:text-white'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Jami Talabalar', value: stats.totalStudents, icon: Users, color: 'text-blue-500' },
                { label: 'Jami Savollar', value: stats.totalQuestions, icon: BookOpen, color: 'text-purple-500' },
                { label: 'O\'rtacha Ball', value: stats.avgScore, icon: BarChart3, color: 'text-orange-500' },
                { label: 'O\'rtacha Baho', value: stats.avgGrade, icon: Award, color: 'text-green-500' },
              ].map((item, i) => (
                <div key={i} className="bg-card border border-white/5 p-8 rounded-[32px] space-y-4 group hover:border-white/10 transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">{item.label}</p>
                    <h3 className="text-3xl font-black font-heading">{item.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-card border border-white/5 p-10 rounded-[40px] space-y-6">
                <h3 className="text-xl font-bold">Tezkor Havolalar</h3>
                <div className="grid gap-4">
                  <button onClick={() => setActiveTab('questions')} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                      <Plus className="text-primary" />
                      <span className="font-bold">Yangi Savollar Qo'shish</span>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => setActiveTab('sessions')} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                    <div className="flex items-center gap-4">
                      <Link2 className="text-blue-500" />
                      <span className="font-bold">Yangi Test Havolasi</span>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="bg-card border border-white/5 p-10 rounded-[40px] flex items-center justify-center text-center space-y-4">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-xl font-bold">Tizim Barqaror</h3>
                  <p className="text-sm text-white/30">Barcha ma'lumotlar bulutli server bilan sinxronizatsiya qilingan.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-8">
            <div className="bg-card border border-white/5 p-8 rounded-[32px] flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex-1 w-full lg:max-w-md relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-primary/50" 
                  placeholder="Savollarni qidirish..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-3 w-full lg:w-auto">
                <label className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-all text-sm font-bold uppercase tracking-widest">
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
                <button onClick={() => { setQuestions([{ uid: Date.now().toString(), text: 'Yangi savol', options: ['A', 'B', 'C', 'D'], correct: 0 }, ...questions]); window.scrollTo({top: 500, behavior: 'smooth'}); }} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all">
                  <Plus size={20} /> Qo'shish
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredQuestions.map((q, idx) => (
                <div key={q.uid} className="bg-card border border-white/5 p-10 rounded-[40px] hover:border-primary/20 transition-all group relative">
                  <div className="flex flex-col xl:flex-row gap-12">
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-widest">ID: {q.uid}</span>
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Savol #{questions.length - idx}</span>
                        </div>
                        <button onClick={() => { if(window.confirm("Savol o'chirilsinmi?")) setQuestions(questions.filter(it => it.uid !== q.uid)); }} className="text-white/10 hover:text-red-500 transition-colors p-2">
                          <Trash2 size={24} />
                        </button>
                      </div>
                      <textarea
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...questions];
                          const qIdx = questions.findIndex(it => it.uid === q.uid);
                          updated[qIdx].text = e.target.value;
                          setQuestions(updated);
                        }}
                        className="w-full bg-transparent border-none text-2xl font-bold text-white focus:outline-none resize-none leading-relaxed"
                        rows={2}
                      />
                    </div>
                    <div className="xl:w-1/2 grid sm:grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className={`p-6 rounded-[24px] border-2 transition-all flex items-center gap-4 ${
                          q.correct === optIdx ? 'border-primary bg-primary/5' : 'border-white/5 bg-black/20'
                        }`}>
                          <button 
                            onClick={() => {
                              const updated = [...questions];
                              const qIdx = questions.findIndex(it => it.uid === q.uid);
                              updated[qIdx].correct = optIdx;
                              setQuestions(updated);
                            }}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                              q.correct === optIdx ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </button>
                          <input
                            value={opt}
                            onChange={(e) => {
                              const updated = [...questions];
                              const qIdx = questions.findIndex(it => it.uid === q.uid);
                              updated[qIdx].options[optIdx] = e.target.value;
                              setQuestions(updated);
                            }}
                            className="bg-transparent border-none flex-1 text-white font-semibold text-lg focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fixed bottom-12 right-12 z-[50]">
              <button onClick={() => storage.saveQuestions(adminUid, questions).then(() => showToast("Barcha savollar muvaffaqiyatli saqlandi"))} className="flex items-center gap-4 px-12 py-6 bg-primary hover:bg-primary/90 rounded-[32px] font-black text-2xl shadow-[0_20px_50px_rgba(255,59,0,0.4)] transition-all transform hover:scale-105 active:scale-95">
                <Save size={28} /> Barchasini Saqlash
              </button>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="bg-card border border-white/5 rounded-[48px] overflow-hidden">
            <div className="p-10 md:p-14 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.01]">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-3xl font-heading font-black">Imtihon Natijalari</h3>
                <p className="text-white/30 text-sm">Jami {results.length} ta natija mavjud</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-primary/50" placeholder="Talabani qidirish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={exportToCSV} className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-sm font-bold uppercase tracking-widest text-primary">
                  <Download size={20} /> Excel (CSV)
                </button>
                <button onClick={() => { if(window.confirm("Barcha natijalar o'chirilsinmi?")) storage.clearResults(adminUid).then(() => { setResults([]); showToast("Tozalandi", "error"); }); }} className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all">
                  <Trash size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 border-b border-white/5 bg-white/[0.01]">
                    <th className="p-10">Talaba F.I.SH</th>
                    <th className="p-10 text-center">Guruh / Fakultet</th>
                    <th className="p-10 text-center">To'g'ri / Jami</th>
                    <th className="p-10 text-center">Baho</th>
                    <th className="p-10 text-right">Sana / Vaqt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredResults.map(r => (
                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-10">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">{r.student.name[0]}</div>
                          <div className="flex flex-col">
                            <span className="font-bold text-xl">{r.student.name} {r.student.surname}</span>
                            <span className="text-[10px] text-white/20 uppercase tracking-widest">Tizim ID: {r.id.substr(0,8)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <div className="inline-flex flex-col p-3 rounded-2xl bg-white/[0.02] border border-white/5 min-w-[120px]">
                          <span className="font-bold text-white/80">{r.student.group}</span>
                          <span className="text-[9px] text-white/20 uppercase tracking-widest">{r.student.faculty}</span>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <div className="text-2xl font-mono font-bold">
                          {r.score} <span className="text-white/20">/ {r.total}</span>
                        </div>
                      </td>
                      <td className="p-10 text-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto font-black text-2xl shadow-xl ${
                          r.grade >= 4 ? 'bg-green-500/10 text-green-500 shadow-green-500/10' : 'bg-primary/10 text-primary shadow-primary/10'
                        }`}>
                          {r.grade}
                        </div>
                      </td>
                      <td className="p-10 text-right">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white/60">{new Date(r.date).toLocaleDateString()}</span>
                          <span className="text-[10px] text-white/20 uppercase">{new Date(r.date).toLocaleTimeString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredResults.length === 0 && (
                <div className="p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                    <Search size={40} />
                  </div>
                  <p className="text-white/30 font-bold uppercase tracking-widest">Natijalar topilmadi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-heading font-black tracking-tight">Tizim <span className="text-primary">Sozlamalari</span></h2>
              <p className="text-white/40">Loyihani o'zingizga moslashtiring</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-card border border-white/5 p-10 rounded-[40px] space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Award className="text-primary" size={24} /> Baholash Mezonlari
                </h3>
                <div className="space-y-4">
                  {criteria.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl font-black text-primary">
                          {c.grade}
                        </div>
                        <span className="text-sm font-bold text-white/40 uppercase tracking-widest">Baho uchun</span>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center font-black text-xl focus:outline-none focus:border-primary"
                          value={c.min}
                          onChange={(e) => {
                            const updated = [...criteria];
                            updated[idx].min = parseInt(e.target.value);
                            setCriteria(updated);
                          }}
                        />
                        <p className="text-[9px] text-center mt-2 uppercase text-white/20">Min. Ball</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => storage.saveCriteria(adminUid, criteria).then(() => showToast("Baholash mezonlari saqlandi"))} className="w-full bg-primary hover:bg-primary/90 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20">
                  Mezonlarni Saqlash
                </button>
              </div>

              <div className="bg-card border border-white/5 p-10 rounded-[40px] space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Settings className="text-blue-500" size={24} /> Test Parametrlari
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Har bir testdagi savollar soni</label>
                    <input 
                      type="number" 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-primary/50" 
                      value={settings.questionsPerTest} 
                      onChange={e => setSettings({...settings, questionsPerTest: parseInt(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">Savol uchun vaqt (sekund)</label>
                    <input 
                      type="number" 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-bold focus:outline-none focus:border-primary/50" 
                      value={settings.timePerQuestion} 
                      onChange={e => setSettings({...settings, timePerQuestion: parseInt(e.target.value)})} 
                    />
                  </div>
                </div>
                <button onClick={() => storage.saveSettings(adminUid, settings).then(() => showToast("Sozlamalar saqlandi"))} className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20">
                  Sozlamalarni Saqlash
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;
