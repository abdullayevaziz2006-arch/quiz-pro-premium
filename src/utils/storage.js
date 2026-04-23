let BASE_URL = import.meta.env.VITE_API_URL || 'quiz-pro-premium-production.up.railway.app';
if (!BASE_URL.startsWith('http')) {
  BASE_URL = `https://${BASE_URL}`;
}
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const handleResponse = async (response) => {
  if (!response.ok) {
    const text = await response.text();
    console.error("API Error Response:", text);
    throw new Error(`Server xatosi: ${response.status}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json();
  }
  return null;
};

export const storage = {
  // Savollar
  async getQuestions(uid) {
    try {
      const res = await fetch(`${API_URL}/${uid}/questions`);
      return await handleResponse(res) || [];
    } catch (err) {
      console.error("Error fetching questions:", err);
      return [];
    }
  },
  async saveQuestions(uid, questions) {
    try {
      const res = await fetch(`${API_URL}/${uid}/questions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: questions }) // Backend 'items' kutmoqda
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving questions:", err);
      throw err;
    }
  },

  // Mezonlar
  async getCriteria(uid) {
    try {
      const res = await fetch(`${API_URL}/${uid}/criteria`);
      const data = await handleResponse(res);
      if (data && data.length > 0) return data;
      return [
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
      const res = await fetch(`${API_URL}/${uid}/criteria/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: criteria })
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving criteria:", err);
      throw err;
    }
  },

  // Natijalar
  async getResults(uid) {
    try {
      const res = await fetch(`${API_URL}/${uid}/results`);
      return await handleResponse(res) || [];
    } catch (err) {
      return [];
    }
  },
  async saveResult(uid, result) {
    try {
      const res = await fetch(`${API_URL}/${uid}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving result:", err);
      throw err;
    }
  },
  async clearResults(uid) {
    try {
      const res = await fetch(`${API_URL}/${uid}/results/all`, { method: 'DELETE' });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error clearing results:", err);
      throw err;
    }
  },

  // Havolalar (Sessions)
  async getSessions(uid) {
    try {
      const res = await fetch(`${API_URL}/${uid}/sessions`);
      return await handleResponse(res) || [];
    } catch (err) {
      return [];
    }
  },
  async saveSession(uid, session) {
    try {
      const res = await fetch(`${API_URL}/${uid}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving session:", err);
      throw err;
    }
  },
  async deleteSession(uid, sessionId) {
    try {
      const res = await fetch(`${API_URL}/${uid}/sessions/${sessionId}`, { method: 'DELETE' });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error deleting session:", err);
      throw err;
    }
  },

  // Sozlamalar
  async getSettings(uid) {
    try {
      const res = await fetch(`${API_URL}/${uid}/settings`);
      const data = await handleResponse(res);
      return data || { questionsPerTest: 20 };
    } catch (err) {
      return { questionsPerTest: 20 };
    }
  },
  async saveSettings(uid, settings) {
    try {
      const res = await fetch(`${API_URL}/${uid}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Error saving settings:", err);
      throw err;
    }
  },

  // Fanlar (404 xatosini aylanib o'tish: Settings orqali tunneling)
  async getSubjects(uid) {
    try {
      console.log("Fetching subjects via settings tunnel...");
      const res = await fetch(`${API_URL}/${uid}/settings`);
      const data = await handleResponse(res);
      return data?.subjects || [];
    } catch (err) {
      console.error("Subject fetch failed:", err);
      return [];
    }
  },
  async saveSubjects(uid, subjects) {
    try {
      const resGet = await fetch(`${API_URL}/${uid}/settings`);
      const current = await handleResponse(resGet) || {};
      const updated = { ...current, subjects };
      
      const res = await fetch(`${API_URL}/${uid}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      return await handleResponse(res);
    } catch (err) {
      console.error("Subject save failed:", err);
      throw err;
    }
  }
};
