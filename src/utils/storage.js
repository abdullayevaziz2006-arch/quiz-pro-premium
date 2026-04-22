const API_URL = import.meta.env.VITE_API_URL || 'https://ranch-quiz-backend.railway.app/api'; // Iltimos, o'zingizning Railway manzilingizni shu erga yozing

const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    console.error("API Error Response:", text);
    throw new Error(`Server xatosi: ${response.status}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json();
  } else {
    const text = await response.text();
    console.warn("Expected JSON, but got:", text.substring(0, 100));
    return null;
  }
};

export const storage = {
  async getQuestions(uid) {
    try {
      const res = await fetch(`${API_URL}/questions/${uid}`);
      return await handleResponse(res) || [];
    } catch (err) {
      console.error("Error fetching questions:", err);
      return [];
    }
  },
  async saveQuestions(uid, questions) {
    try {
      const res = await fetch(`${API_URL}/questions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, questions })
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving questions:", err);
      throw err;
    }
  },
  async getCriteria(uid) {
    try {
      const res = await fetch(`${API_URL}/criteria/${uid}`);
      const data = await handleResponse(res);
      return data || [
        { grade: 5, min: 90 },
        { grade: 4, min: 70 },
        { grade: 3, min: 50 },
        { grade: 2, min: 0 }
      ];
    } catch (err) {
      return [
        { grade: 5, min: 90 },
        { grade: 4, min: 70 },
        { grade: 3, min: 50 },
        { grade: 2, min: 0 }
      ];
    }
  },
  async saveCriteria(uid, criteria) {
    try {
      const res = await fetch(`${API_URL}/criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, criteria })
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving criteria:", err);
      throw err;
    }
  },
  async getResults(uid) {
    try {
      const res = await fetch(`${API_URL}/results/${uid}`);
      return await handleResponse(res) || [];
    } catch (err) {
      return [];
    }
  },
  async saveResult(uid, result) {
    try {
      const res = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, result })
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving result:", err);
      throw err;
    }
  },
  async clearResults(uid) {
    try {
      const res = await fetch(`${API_URL}/results/${uid}`, { method: 'DELETE' });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error clearing results:", err);
      throw err;
    }
  },
  async getSessions(uid) {
    try {
      const res = await fetch(`${API_URL}/sessions/${uid}`);
      return await handleResponse(res) || [];
    } catch (err) {
      return [];
    }
  },
  async saveSession(uid, session) {
    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, session })
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving session:", err);
      throw err;
    }
  },
  async deleteSession(uid, sessionId) {
    try {
      const res = await fetch(`${API_URL}/sessions/${uid}/${sessionId}`, { method: 'DELETE' });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error deleting session:", err);
      throw err;
    }
  },
  async getSettings(uid) {
    try {
      const res = await fetch(`${API_URL}/settings/${uid}`);
      const data = await handleResponse(res);
      return data || { questionsPerTest: 20, timePerQuestion: 120 };
    } catch (err) {
      return { questionsPerTest: 20, timePerQuestion: 120 };
    }
  },
  async saveSettings(uid, settings) {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, settings })
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving settings:", err);
      throw err;
    }
  }
};
