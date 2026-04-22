const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fetchData = async (teacherId, path, defaultData = []) => {
  if (!teacherId || teacherId === 'undefined') return defaultData;
  try {
    const res = await fetch(`${API_URL}/${teacherId}/${path}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return defaultData;
  }
};

const postData = async (teacherId, path, data) => {
  if (!teacherId || teacherId === 'undefined') return;
  try {
    const res = await fetch(`${API_URL}/${teacherId}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (error) {
    console.error(`Error posting ${path}:`, error);
  }
};

export const storage = {
  // Savollar uchun
  getQuestions: async (teacherId) => {
    return await fetchData(teacherId, 'questions');
  },
  saveQuestions: async (teacherId, questions) => {
    await postData(teacherId, 'questions/bulk', { items: questions });
  },

  // Test Seanslari (Sessions) uchun
  getSessions: async (teacherId) => await fetchData(teacherId, 'sessions'),
  saveSession: async (teacherId, session) => {
    return await postData(teacherId, 'sessions', session);
  },
  deleteSession: async (teacherId, id) => {
    try {
      await fetch(`${API_URL}/${teacherId}/sessions/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  },

  // Baholash mezonlari uchun
  getCriteria: async (teacherId) => {
    const data = await fetchData(teacherId, 'criteria', null);
    if (!data || data.length === 0) {
      return [
        { grade: 5, min: 18 },
        { grade: 4, min: 15 },
        { grade: 3, min: 10 },
        { grade: 2, min: 0 }
      ];
    }
    return data;
  },
  saveCriteria: async (teacherId, criteria) => {
    await postData(teacherId, 'criteria/bulk', { items: criteria });
  },

  // Natijalar uchun
  getResults: async (teacherId) => {
    return await fetchData(teacherId, 'results');
  },
  saveResult: async (teacherId, result) => {
    await postData(teacherId, 'results', result);
  },
  clearResults: async (teacherId) => {
    try {
      await fetch(`${API_URL}/${teacherId}/results/all`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error clearing results:', err);
    }
  },

  // Sozlamalar
  getSettings: async (teacherId) => {
    return await fetchData(teacherId, 'settings', { questionsPerTest: 20 });
  },
  saveSettings: async (teacherId, settings) => {
    await postData(teacherId, 'settings', settings);
  }
};
