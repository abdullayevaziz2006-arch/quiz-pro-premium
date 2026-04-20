import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { parseWordQuiz } from '../utils/wordParser';
import mammoth from 'mammoth';
import { 
  Plus, Trash, Edit2, Upload, Download, Check, Copy, Share2, Eye, X, 
  ChevronDown, ChevronUp, ChevronLeft, BookOpen, AlertCircle, CheckCircle2, Link as LinkIcon,
  Dices, ScrollText, ListChecks, Search, Trash2, Edit3, Award, Users, FileUp
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [results, setResults] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [genMode, setGenMode] = useState('random');
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [randomCount, setRandomCount] = useState(20);
  const [settings, setSettings] = useState({ questionsPerTest: 20 });
  const [selectedResult, setSelectedResult] = useState(null);
  
  const [newQuestion, setNewQuestion] = useState({ text: '', options: ['', '', '', ''], correct: 0 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setQuestions(storage.getQuestions());
    setCriteria(storage.getCriteria());
    setResults(storage.getResults());
    setSettings(storage.getSettings());
    setSessions(storage.getSessions());
  }, []);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (editingId !== null) {
      const updated = questions.map((q, idx) => idx === editingId ? newQuestion : q);
      storage.saveQuestions(updated);
      setQuestions(updated);
      setEditingId(null);
    } else {
      const updated = [...questions, { ...newQuestion, uid: Date.now().toString() }];
      storage.saveQuestions(updated);
      setQuestions(updated);
    }
    setNewQuestion({ text: '', options: ['', '', '', ''], correct: 0 });
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
        storage.saveQuestions(updated);
        setQuestions(updated);
        alert(`${importedQuestions.length} ta savol yuklandi!`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const deleteQuestion = (index) => {
    if(window.confirm("Savolni o'chirmoqchimisiz?")) {
      const updated = questions.filter((_, i) => i !== index);
      storage.saveQuestions(updated);
      setQuestions(updated);
    }
  };

  const handleCreateSession = () => {
    let qIds = [];
    if (genMode === 'random') {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      qIds = shuffled.slice(0, randomCount).map(q => q.uid);
    } else {
      qIds = selectedQIds;
    }

    if (qIds.length === 0) {
      alert("Savollarni tanlang!");
      return;
    }

    const newSession = storage.saveSession({
      name: sessionName || `Test ${sessions.length + 1}`,
      questionIds: qIds
    });

    setSessions([...sessions, newSession]);
    setSessionName('');
    setSelectedQIds([]);
    alert("Test seansi yaratildi!");
  };

  const handleDeleteSession = (id) => {
    if (window.confirm("O'chirmoqchimisiz?")) {
      storage.deleteSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  const copySessionLink = (id) => {
    const link = id ? `${window.location.origin}/quiz?testId=${id}` : `${window.location.origin}/quiz`;
    navigator.clipboard.writeText(link);
    alert("Havola nusxalandi!");
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  const toggleQuestionSelection = (uid) => {
    setSelectedQIds(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleCriteriaChange = (index, field, value) => {
    const updated = [...criteria];
    updated[index][field] = parseInt(value) || 0;
    setCriteria(updated);
    storage.saveCriteria(updated);
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-20 px-4 md:px-8">
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-3 p-2.5 glass rounded-[40px] sticky top-6 z-[100] shadow-2xl backdrop-blur-2xl border-white/5 mx-auto bg-white/5">
        {[
          { id: 'questions', label: 'Savollar', icon: BookOpen },
          { id: 'criteria', label: 'Baholash', icon: Award },
          { id: 'results', label: 'Natijalar', icon: Users },
          { id: 'access', label: 'Ulashish', icon: Share2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[28px] transition-all duration-500 font-bold border-none outline-none cursor-pointer group ${
              activeTab === tab.id 
              ? 'bg-accent text-white shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)] scale-105' 
              : 'text-text-secondary hover:bg-white/10 hover:text-accent'
            }`}
          >
            <tab.icon size={22} className={activeTab === tab.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
            <span className="hidden lg:inline text-sm tracking-wide">{tab.label}</span>
          </button>
        ))}
        
        <div className="w-[1px] h-8 bg-white/10 mx-2 hidden lg:block"></div>

        <label className="flex items-center gap-3 px-8 py-4 rounded-[28px] bg-bg-accent text-accent font-bold cursor-pointer hover:bg-accent hover:text-white transition-all duration-500 border-none outline-none shadow-sm">
          <FileUp size={22} />
          <span className="hidden lg:inline text-sm">Word yuklash</span>
          <input type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {activeTab === 'questions' && (
        <div className="animate-fade flex flex-col gap-10">
          <form onSubmit={handleAddQuestion} className="card p-8 md:p-12 flex flex-col gap-8 relative overflow-hidden shadow-2xl border-white/10 relative z-10 group">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-purple-500 to-accent"></div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                <Edit3 size={24} />
              </div>
              <h3 className="text-3xl font-black tracking-tight">{editingId !== null ? 'Savolni Tahrirlash' : 'Yangi Savol Yaratish'}</h3>
            </div>

            <div className="relative group/textarea z-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-[22px] blur-md opacity-20 group-focus-within/textarea:opacity-60 transition duration-500"></div>
              <textarea 
                required
                className="relative w-full p-6 rounded-[20px] border border-white/10 bg-bg-secondary focus:bg-white/5 outline-none text-xl transition-all shadow-inner resize-none font-medium text-text-primary placeholder:text-text-secondary/50 focus:ring-2 focus:ring-accent/50"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                placeholder="Bu yerga ajoyib savolingizni yozing..."
                style={{ minHeight: '140px' }}
              />
            </div>

            <div className="space-y-3">
               <label className="text-xs font-black uppercase tracking-[0.2em] text-text-secondary ml-2">Javob variantlari (To'g'risini belgilang)</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 z-20">
                 {newQuestion.options.map((opt, idx) => (
                   <div key={idx} className={`relative flex gap-4 items-center p-3 rounded-[24px] border-2 transition-all duration-300 overflow-hidden ${newQuestion.correct === idx ? 'border-accent bg-accent/5 ring-4 ring-accent/10 shadow-lg shadow-accent/10 scale-[1.02] z-10' : 'border-white/10 bg-white/5 hover:border-accent/40'}`}>
                     {newQuestion.correct === idx && <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-accent shadow-[0_0_10px_rgba(79,70,229,1)]"></div>}
                     
                     <label className="cursor-pointer flex items-center justify-center ml-2 p-2 rounded-full hover:bg-accent/10 transition-all shrink-0">
                       <input 
                         type="radio" 
                         name="correct" 
                         className="cursor-pointer scale-[1.8] accent-accent"
                         checked={newQuestion.correct === idx}
                         onChange={() => setNewQuestion({...newQuestion, correct: idx})}
                       />
                     </label>

                     <input 
                       required
                       className="flex-1 py-4 pr-4 border-none bg-transparent outline-none text-text-primary placeholder:text-text-secondary/40 font-bold text-lg"
                       value={opt}
                       onChange={(e) => {
                         const newOpts = [...newQuestion.options];
                         newOpts[idx] = e.target.value;
                         setNewQuestion({...newQuestion, options: newOpts});
                       }}
                       placeholder={`${String.fromCharCode(65+idx)}-javobni yozing`}
                     />
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex justify-end mt-4">
               <button type="submit" className="btn btn-primary py-5 px-12 text-xl rounded-[24px] shadow-[0_10px_25px_rgba(79,70,229,0.4)] flex items-center gap-3"> 
                  {editingId !== null ? <><Check size={24} /> Tahrirni saqlash</> : <><Plus size={24} /> Savolni qo'shish</>}
               </button>
            </div>
          </form>

          <div className="grid grid-cols-1 gap-6">
            {questions.length === 0 ? (
                <div className="p-16 flex flex-col items-center justify-center gap-4 text-text-secondary border-2 border-dashed border-white/10 rounded-[32px] bg-black/10 mx-4">
                   <AlertCircle size={48} className="opacity-50" />
                   <p className="font-medium text-lg">Hali savollar kiritilmagan. Yuqoridagi formadan qo'shing yoki Word fayl yuklang.</p>
                </div>
            ) : (
                questions.map((q, idx) => (
                  <div key={idx} className="card glass p-8 flex flex-col gap-6 hover:border-accent/40 transition-all duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-xl leading-snug flex-1"><span className="text-accent">{idx+1}.</span> {q.text}</h4>
                      <div className="flex gap-2 shrink-0 bg-black/20 p-2 rounded-2xl border border-white/5">
                        <button onClick={() => {setNewQuestion(q); setEditingId(idx); window.scrollTo({top:0, behavior:'smooth'})}} className="p-3 text-accent hover:bg-accent/20 rounded-xl transition-all"><Edit3 size={20} /></button>
                        <button onClick={() => deleteQuestion(idx)} className="p-3 text-danger hover:bg-danger/20 rounded-xl transition-all"><Trash2 size={20} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-4 rounded-xl border-2 text-[15px] font-medium flex items-center gap-3 transition-all ${oIdx === q.correct ? 'border-success bg-success/10 text-success' : 'border-white/5 bg-black/10 opacity-70'}`}>
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black border ${oIdx === q.correct ? 'bg-success text-white border-success' : 'border-white/20'}`}>
                             {String.fromCharCode(65+oIdx)}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'criteria' && (
        <div className="card glass p-8 md:p-12 flex flex-col gap-8 animate-fade">
          <h3 className="text-3xl font-black">Baholash Mezonlari</h3>
          <p className="text-text-secondary">Ushbu jarayonda har bir 5 baholik shkala uchun kamida nechta to'g'ri javob kerakligini belgilaysiz.</p>
          <div className="flex flex-col gap-4">
            {criteria.map((c, idx) => (
              <div key={idx} className="flex items-center gap-6 p-6 border-2 border-white/5 rounded-2xl bg-black/10 hover:border-accent/30 transition-all">
                <div className="w-12 h-12 shrink-0 rounded-full bg-accent text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-accent/20">
                   {c.grade}
                </div>
                <div className="flex-1 flex items-center gap-4">
                   <span className="text-text-secondary font-bold uppercase tracking-widest text-xs hidden md:inline">O'tish bali:</span>
                   <input 
                     type="number" 
                     value={c.min} 
                     onChange={(e) => handleCriteriaChange(idx, 'min', e.target.value)}
                     className="flex-1 md:w-32 md:flex-none p-4 rounded-xl border-2 border-white/10 bg-transparent text-xl font-bold focus:border-accent outline-none transition-all text-center text-accent"
                   />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="animate-fade">
          {!selectedResult ? (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-3xl font-black">Talabalar Natijalari</h3>
                {results.length > 0 && (
                   <button onClick={() => {if(window.confirm("Barcha natijalar ochib ketadi, ishonchingiz komilmi?")){storage.clearResults(); setResults([])}}} className="text-danger flex items-center gap-2 px-6 py-3 rounded-[20px] bg-danger/10 hover:bg-danger hover:text-white transition-all font-bold">
                      <Trash size={18}/> Tozalash
                   </button>
                )}
              </div>
              
              {results.length === 0 ? (
                 <div className="p-16 border-2 border-dashed border-white/10 rounded-[32px] bg-black/10 flex flex-col items-center gap-4">
                    <Users size={48} className="opacity-30" />
                    <p className="text-text-secondary font-medium">Hali hech qanday talaba test topshirmadi.</p>
                 </div>
              ) : (
                 <div className="overflow-x-auto glass rounded-[32px] p-6 border-white/5 shadow-xl bg-white/5">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-white/10 text-text-secondary text-sm uppercase tracking-widest">
                         <th className="p-6 font-black">F.I.Sh</th>
                         <th className="p-6 font-black">To'g'ri</th>
                         <th className="p-6 font-black">Baho</th>
                         <th className="p-6 font-black text-center">Batafsil</th>
                       </tr>
                     </thead>
                     <tbody>
                       {results.map((res, idx) => (
                         <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-all">
                           <td className="p-6 font-bold text-lg">{res.student?.name} {res.student?.surname}</td>
                           <td className="p-6"><span className="bg-success/20 text-success px-4 py-2 rounded-xl font-bold tracking-widest">{res.score}/{res.total}</span></td>
                           <td className="p-6"><span className="bg-accent/20 text-accent px-4 py-2 rounded-xl font-black text-xl">{res.grade}</span></td>
                           <td className="p-6 text-center">
                              <button onClick={() => {setSelectedResult(res); window.scrollTo(0, 0);}} className="inline-flex items-center gap-2 text-accent px-6 py-3 rounded-[16px] bg-accent/10 hover:bg-accent hover:text-white transition-all font-bold shadow-sm">
                                 <Eye size={18}/> Tahlil
                              </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8 animate-fade pb-10 max-w-5xl mx-auto w-full">
               <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 md:p-8 glass rounded-[32px] shadow-lg border-white/5 bg-accent/5">
                  <div className="flex flex-col gap-2 relative z-10">
                     <span className="text-xs font-black uppercase tracking-[0.2em] text-accent">O'quvchi Tahlili</span>
                     <h3 className="text-3xl md:text-4xl font-black text-text-primary">
                        {selectedResult.student?.name} {selectedResult.student?.surname}
                     </h3>
                  </div>
                  <button onClick={() => setSelectedResult(null)} className="btn py-4 px-10 rounded-[20px] bg-black/20 hover:bg-black/30 border border-white/10 font-bold shrink-0 shadow-xl">
                     <ChevronLeft size={20} className="mr-2" /> Orqaga qytish
                  </button>
               </div>
               
               <div className="grid grid-cols-1 gap-6">
                 {!selectedResult.analysis || selectedResult.analysis.length === 0 ? (
                    <div className="p-12 text-center text-text-secondary border-2 border-dashed border-white/10 rounded-[32px] bg-black/10">
                       <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
                       <p className="font-bold text-lg">Ushbu natija uchun tahlil ma'lumotlari saqlanmagan.</p>
                       <p className="text-sm opacity-70 mt-2">(Faqatgina yangi ishlangan testlarda batafsil tahlil mavjud)</p>
                    </div>
                 ) : (
                    selectedResult.analysis.map((item, idx) => (
                      <div key={idx} className={`card glass p-5 md:p-6 rounded-[24px] border-l-[8px] bg-white/5 transition-all shadow-sm ${item.isCorrect ? 'border-l-success' : 'border-l-danger'}`}>
                        <div className="flex justify-between items-start gap-3 mb-5">
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${item.isCorrect ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                  {item.isCorrect ? 'To\'g\'ri javob' : 'Xato qilingan'}
                                </span>
                                {(item.selected === undefined || item.selected === null) && (
                                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-warning/20 text-warning">
                                    Javob belgilanmagan
                                  </span>
                                )}
                              </div>
                              <h4 className="text-lg font-bold leading-snug">{idx+1}. {item.question}</h4>
                           </div>
                           {item.isCorrect ? <CheckCircle2 size={24} className="text-success shrink-0" /> : <AlertCircle size={24} className="text-danger shrink-0" />}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(Array.isArray(item.options) ? item.options : []).map((opt, oIdx) => {
                             let statusClass = 'border-white/5 bg-black/10 opacity-70';
                             let label = null;
                             
                             if (oIdx === item.correct) {
                                statusClass = 'border-success bg-success/10 text-success opacity-100 ring-2 ring-success/20 font-bold';
                                if (oIdx === item.selected) {
                                   label = <span className="ml-auto text-[10px] font-black uppercase bg-success text-white px-2 py-1 rounded-md">Sizning javobingiz</span>;
                                } else {
                                   label = <span className="ml-auto text-[10px] font-black uppercase bg-success/20 text-success px-2 py-1 rounded-md">To'g'ri javob</span>;
                                }
                             } else if (oIdx === item.selected && !item.isCorrect) {
                                statusClass = 'border-danger bg-danger/10 text-danger opacity-100 font-bold shadow-sm shadow-danger/10';
                                label = <span className="ml-auto text-[10px] font-black uppercase bg-danger text-white px-2 py-1 rounded-md">Belgilangan xato</span>;
                             }
                             
                             return (
                               <div key={oIdx} className={`p-3 rounded-xl border-2 text-[14px] flex items-center gap-3 transition-all ${statusClass}`}>
                                  <span className="w-7 h-7 shrink-0 flex items-center justify-center font-black rounded-lg bg-white/5 text-xs border border-white/10">
                                     {String.fromCharCode(65+oIdx)}
                                  </span>
                                  <span className="flex-1">{opt}</span>
                                  {label}
                               </div>
                             )
                          })}
                        </div>
                      </div>
                    ))
                 )}
               </div>
               <div className="flex justify-center mt-6">
                  <button onClick={() => setSelectedResult(null)} className="btn btn-primary py-5 px-12 rounded-[24px] shadow-2xl">Yopish</button>
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'access' && (
        <div className="animate-fade space-y-12 py-4">
          
          {/* Header Section */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
             <div className="inline-flex p-5 bg-accent/10 rounded-[40px] text-accent mb-4 shadow-inner ring-1 ring-accent/20">
                <Share2 size={48} className="animate-bounce" />
             </div>
             <h2 className="text-5xl font-black tracking-tighter">Testlarni Ulashish</h2>
             <p className="text-text-secondary text-lg">Talabalar uchun maxsus havolalar yarating va ularni nazorat qiling.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create Section */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="card glass p-8 md:p-12 space-y-10 relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700"></div>
                
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30">
                    <Plus size={24} />
                  </div>
                  <h4 className="text-3xl font-black tracking-tight">Yangi Test Yaratish</h4>
                </div>

                <div className="space-y-8 relative z-10">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-accent ml-2">Testga nom bering</label>
                    <input 
                      value={sessionName} 
                      onChange={(e) => setSessionName(e.target.value)} 
                      placeholder="Masalan: 2-Smena matematika..." 
                      className="w-full p-5 rounded-[24px] border-2 border-white/5 bg-white/5 focus:border-accent focus:bg-white/10 outline-none transition-all text-xl font-bold placeholder:opacity-30" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-accent ml-2">Tanlash usuli</label>
                    <div className="flex gap-2 p-1.5 bg-black/10 rounded-[22px] border border-white/5">
                      <button 
                        type="button"
                        onClick={() => setGenMode('random')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all duration-300 font-bold border-none outline-none cursor-pointer ${genMode === 'random' ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                      >
                        <Dices size={18} /> Tasodifiy
                      </button>
                      <button 
                        type="button"
                        onClick={() => setGenMode('manual')} 
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all duration-300 font-bold border-none outline-none cursor-pointer ${genMode === 'manual' ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
                      >
                        <ListChecks size={18} /> Manuel
                      </button>
                    </div>
                  </div>

                  {genMode === 'random' ? (
                    <div className="space-y-4 animate-fade">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-accent ml-2">Savollar soni</label>
                      <input 
                        type="number" 
                        value={randomCount} 
                        onChange={(e) => setRandomCount(e.target.value)} 
                        className="w-full p-4 rounded-[20px] border-2 border-white/5 bg-white/5 focus:border-accent text-3xl font-black text-center text-accent outline-none" 
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade">
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-accent" size={18} />
                        <input 
                          value={sessionSearch} 
                          onChange={(e) => setSessionSearch(e.target.value)} 
                          placeholder="Savollarni qidirish..." 
                          className="w-full pl-14 pr-6 py-4 border-2 border-white/5 rounded-[20px] bg-white/5 focus:border-accent outline-none" 
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredQuestions.map((q) => {
                          const isSelected = selectedQIds.includes(q.uid);
                          return (
                            <div 
                              key={q.uid} 
                              onClick={() => toggleQuestionSelection(q.uid)} 
                              className={`p-4 rounded-[18px] border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 ${
                                isSelected 
                                ? 'border-accent bg-accent/10 shadow-sm' 
                                : 'border-white/5 bg-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-accent border-accent text-white' : 'border-white/20'
                              }`}>
                                {isSelected && <Check size={14} strokeWidth={4} />}
                              </div>
                              <p className={`text-sm leading-snug truncate ${isSelected ? 'text-white font-bold' : 'text-text-secondary'}`}>
                                {q.text}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleCreateSession} 
                    className="w-full py-5 rounded-[22px] bg-accent text-white text-lg font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3 mt-4 border-none outline-none cursor-pointer"
                  >
                    <Plus size={22} /> Havola Yaratish
                  </button>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <ScrollText className="text-accent" />
                  <h4 className="text-2xl font-black tracking-tight">Mavjud Testlar</h4>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-text-secondary">{sessions.length} ta seans</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {sessions.length === 0 ? (
                  <div className="p-20 text-center glass rounded-[40px] opacity-30 italic flex flex-col items-center gap-4">
                    <AlertCircle size={48} />
                    <p>Hali testlar yaratilmagan</p>
                  </div>
                ) : (
                  sessions.map((s) => (
                    <div key={s.id} className="card glass p-6 space-y-6 group hover:translate-y-[-8px] transition-all duration-500 border-white/10 hover:border-accent/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => handleDeleteSession(s.id)} 
                            className="w-10 h-10 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all flex items-center justify-center"
                          >
                           <Trash size={18} />
                         </button>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-[10px] font-black text-accent uppercase tracking-widest">{new Date(s.createdAt).toLocaleDateString()}</div>
                        <h5 className="font-black text-2xl tracking-tighter truncate pr-10">{s.name}</h5>
                        <div className="flex items-center gap-2 text-text-secondary font-medium">
                           <BookOpen size={14} /> {s.questionIds.length} ta savol
                        </div>
                      </div>

                      <div className="flex gap-2 p-2 bg-black/20 rounded-[20px] border border-white/5">
                        <div className="flex-1 px-4 py-2 font-mono text-[10px] text-accent/80 truncate self-center">
                          /quiz?testId={s.id}
                        </div>
                        <button 
                          onClick={() => copySessionLink(s.id)} 
                          className="w-12 h-12 rounded-2xl bg-accent text-white shadow-lg shadow-accent/20 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shrink-0"
                          title="Nusxalash"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ).reverse()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
