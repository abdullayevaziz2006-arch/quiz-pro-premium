export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  
  // Mammoth barcha qatorlarni <p> tegi ichiga soladi
  const paragraphs = Array.from(container.querySelectorAll('p, li, div'));
  const questions = [];
  let currentQ = null;

  paragraphs.forEach(p => {
    const line = p.innerText?.trim() || p.textContent?.trim();
    if (!line) return;

    // Savol aniqlash:
    // 1. ? bilan boshlansa
    // 2. Raqam bilan boshlansa (masalan: "1. Savol")
    // 3. Savol belgisi bilan tugasa (?)
    const isQuestion = line.startsWith('?') || /^\d+[\.\)]/.test(line) || line.endsWith('?');

    if (isQuestion) {
      if (currentQ && currentQ.options.length > 0) {
        questions.push(currentQ);
      }
      currentQ = {
        text: line.replace(/^\?|^\d+[\.\)]\s*/, '').trim(),
        options: [],
        correct: -1
      };
    } else if (currentQ) {
      // Variant aniqlash:
      // Word'da variantlar +, =, -, * yoki A), B) kabi boshlanishi mumkin
      const isCorrect = line.startsWith('+') || line.includes('(to\'g\'ri)') || line.includes('(correct)');
      
      currentQ.options.push(line);
      if (isCorrect) {
        currentQ.correct = currentQ.options.length - 1;
      }
    }
  });

  // Oxirgi savolni qo'shish
  if (currentQ && currentQ.options.length > 0) {
    questions.push(currentQ);
  }

  // Debug uchun konsolga chiqaramiz
  console.log("Imported Questions:", questions);
  return questions;
};
