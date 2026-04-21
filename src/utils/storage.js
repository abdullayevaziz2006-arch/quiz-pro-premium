import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Baza bilan ishlash uchun umumiy funksiyalar (Bitta hujjatda Massiv shaklida saqlash)
const getData = async (collectionName, defaultData = []) => {
  try {
    const docRef = doc(db, 'QuizSystem', collectionName);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().items) {
      return snap.data().items;
    }
    return defaultData;
  } catch (error) {
    console.error(`Error getting ${collectionName}:`, error);
    return defaultData;
  }
};

const saveData = async (collectionName, items) => {
  try {
    const docRef = doc(db, 'QuizSystem', collectionName);
    await setDoc(docRef, { items }, { merge: true });
  } catch (error) {
    console.error(`Error saving ${collectionName}:`, error);
  }
};

export const storage = {
  // Savollar uchun
  getQuestions: async () => {
    let questions = await getData('questions');
    let modified = false;
    questions = questions.map(q => {
      if (!q.uid) {
        modified = true;
        return { ...q, uid: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) };
      }
      return q;
    });
    if (modified) await storage.saveQuestions(questions);
    return questions;
  },
  saveQuestions: async (questions) => {
    const updated = questions.map(q => {
      if (!q.uid) {
        return { ...q, uid: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) };
      }
      return q;
    });
    await saveData('questions', updated);
  },

  // Test Seanslari (Sessions) uchun
  getSessions: async () => await getData('sessions'),
  saveSession: async (session) => {
    const sessions = await storage.getSessions();
    const newSession = { 
      ...session, 
      id: session.id || Math.random().toString(36).substr(2, 9),
      createdAt: session.createdAt || new Date().toISOString()
    };
    sessions.push(newSession);
    await saveData('sessions', sessions);
    return newSession;
  },
  deleteSession: async (id) => {
    const sessions = await storage.getSessions();
    const updated = sessions.filter(s => s.id !== id);
    await saveData('sessions', updated);
  },

  // Baholash mezonlari uchun
  getCriteria: async () => {
    const data = await getData('criteria', null);
    if (!data) {
      return [
        { grade: 5, min: 18 },
        { grade: 4, min: 15 },
        { grade: 3, min: 10 },
        { grade: 2, min: 0 }
      ];
    }
    return data;
  },
  saveCriteria: async (criteria) => await saveData('criteria', criteria),

  // Natijalar uchun
  getResults: async () => await getData('results'),
  saveResult: async (result) => {
    const results = await storage.getResults();
    const newResult = { ...result, id: result.id || Date.now() };
    results.push(newResult);
    await saveData('results', results);
  },
  clearResults: async () => await saveData('results', []),

  // Sozlamalar
  getSettings: async () => {
    const data = await getData('settings', null);
    if (!data || data.length === 0) return { questionsPerTest: 20 };
    return data[0]; // Objectni array orqali o'raymiz db-da
  },
  saveSettings: async (settings) => await saveData('settings', [settings])
};
