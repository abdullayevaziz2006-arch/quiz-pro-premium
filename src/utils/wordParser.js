export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const text = container.innerText || container.textContent;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQ = null;

  lines.forEach(line => {
    // Savol aniqlash: ? bilan boshlansa yoki raqam bilan
    if (line.startsWith('?') || /^\d+[\.\)]/.test(line)) {
      if (currentQ) questions.push(currentQ);
      currentQ = {
        text: line.replace(/^\?|^\d+[\.\)]\s*/, '').trim(),
        options: [],
        correct: -1
      };
    } else if (currentQ) {
      // Variant aniqlash: +, =, A), B) va h.k.
      const isCorrect = line.startsWith('+');
      // Matnni tozalash: faqat boshidagi + yoki = ni olib tashlamaymiz, 
      // Admin panelda ko'rinishi uchun + ni qoldiramiz agar kerak bo'lsa
      
      currentQ.options.push(line);
      if (isCorrect) {
        currentQ.correct = currentQ.options.length - 1;
      }
    }
  });

  if (currentQ) questions.push(currentQ);
  return questions;
};
