const STORAGE_KEYS = {
  QUESTIONS: 'quiz_questions',
  CRITERIA: 'quiz_criteria',
  RESULTS: 'quiz_results',
  SETTINGS: 'quiz_settings',
  SESSIONS: 'quiz_sessions',
};

export const storage = {
  // Savollar uchun
  getQuestions: () => {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    let questions = data ? JSON.parse(data) : [];
    
    // Har bir savolga UID borligini ta'minlash
    let modified = false;
    questions = questions.map(q => {
      if (!q.uid) {
        modified = true;
        return { ...q, uid: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) };
      }
      return q;
    });

    if (modified) storage.saveQuestions(questions);
    return questions;
  },
  saveQuestions: (questions) => {
    const updated = questions.map(q => {
      if (!q.uid) {
        return { ...q, uid: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) };
      }
      return q;
    });
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(updated));
  },

  // Test Seanslari (Sessions) uchun
  getSessions: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },
  saveSession: (session) => {
    const sessions = storage.getSessions();
    const newSession = { 
      ...session, 
      id: session.id || Math.random().toString(36).substr(2, 9),
      createdAt: session.createdAt || new Date().toISOString()
    };
    sessions.push(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return newSession;
  },
  deleteSession: (id) => {
    const sessions = storage.getSessions();
    const updated = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  },

  // Baholash mezonlari uchun
  getCriteria: () => {
    const data = localStorage.getItem(STORAGE_KEYS.CRITERIA);
    return data ? JSON.parse(data) : [
      { grade: 5, min: 18 },
      { grade: 4, min: 15 },
      { grade: 3, min: 10 },
      { grade: 2, min: 0 }
    ];
  },
  saveCriteria: (criteria) => {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  },

  // Natijalar uchun
  getResults: () => {
    const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
    return data ? JSON.parse(data) : [];
  },
  saveResult: (result) => {
    const results = storage.getResults();
    // Re-use the existing ID if it exists, otherwise create new
    const newResult = { ...result, id: result.id || Date.now() };
    results.push(newResult);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  },
  clearResults: () => {
    localStorage.removeItem(STORAGE_KEYS.RESULTS);
  },

  // Sozlamalar (Savollar soni va h.k.)
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { questionsPerTest: 20 };
  },
  saveSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
};
