import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Baza bilan ishlash uchun umumiy funksiyalar (Bitta hujjatda Massiv shaklida saqlash)
const getData = async (teacherId, collectionName, defaultData = []) => {
  if (!teacherId || teacherId === 'undefined') return defaultData;
  try {
    const docRef = doc(db, 'Teachers', teacherId, 'Data', collectionName);
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

const saveData = async (teacherId, collectionName, items) => {
  if (!teacherId || teacherId === 'undefined') return;
  try {
    const docRef = doc(db, 'Teachers', teacherId, 'Data', collectionName);
    await setDoc(docRef, { items }, { merge: true });
  } catch (error) {
    console.error(`Error saving ${collectionName}:`, error);
  }
};

export const storage = {
  // Savollar uchun
  getQuestions: async (teacherId) => {
    let questions = await getData(teacherId, 'questions');
    let modified = false;
    questions = questions.map(q => {
      if (!q.uid) {
        modified = true;
        return { ...q, uid: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) };
      }
      return q;
    });
    if (modified) await storage.saveQuestions(teacherId, questions);
    return questions;
  },
  saveQuestions: async (teacherId, questions) => {
    const updated = questions.map(q => {
      if (!q.uid) {
        return { ...q, uid: Math.random().toString(36).substr(2, 9) + Date.now().toString(36) };
      }
      return q;
    });
    await saveData(teacherId, 'questions', updated);
  },

  // Test Seanslari (Sessions) uchun
  getSessions: async (teacherId) => await getData(teacherId, 'sessions'),
  saveSession: async (teacherId, session) => {
    const sessions = await storage.getSessions(teacherId);
    const newSession = { 
      ...session, 
      id: session.id || Math.random().toString(36).substr(2, 9),
      createdAt: session.createdAt || new Date().toISOString()
    };
    sessions.push(newSession);
    await saveData(teacherId, 'sessions', sessions);
    return newSession;
  },
  deleteSession: async (teacherId, id) => {
    const sessions = await storage.getSessions(teacherId);
    const updated = sessions.filter(s => s.id !== id);
    await saveData(teacherId, 'sessions', updated);
  },

  // Baholash mezonlari uchun
  getCriteria: async (teacherId) => {
    const data = await getData(teacherId, 'criteria', null);
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
  saveCriteria: async (teacherId, criteria) => await saveData(teacherId, 'criteria', criteria),

  // Natijalar uchun
  getResults: async (teacherId) => await getData(teacherId, 'results'),
  saveResult: async (teacherId, result) => {
    const results = await storage.getResults(teacherId);
    const newResult = { ...result, id: result.id || Date.now() };
    results.push(newResult);
    await saveData(teacherId, 'results', results);
  },
  clearResults: async (teacherId) => await saveData(teacherId, 'results', []),

  // Sozlamalar
  getSettings: async (teacherId) => {
    const data = await getData(teacherId, 'settings', null);
    if (!data || data.length === 0) return { questionsPerTest: 20 };
    return data[0]; // Objectni array orqali o'raymiz db-da
  },
  saveSettings: async (teacherId, settings) => await saveData(teacherId, 'settings', [settings])
};
