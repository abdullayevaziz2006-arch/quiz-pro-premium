export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const rawText = (container.innerText || container.textContent || '').trim();
  
  const questions = [];
  // Regex: belgi (? yoki + yoki =) va undan keyin keladigan barcha matn (keyingi belgiga qadar)
  const regex = /(\?|\+|\=)([^\?\+\=]*)/g;
  
  let currentQ = null;
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    const symbol = match[1];
    const content = match[2].trim();

    // Agar matn bo'sh bo'lsa va bu ? bo'lsa, uni o'tkazib yuboramiz (gap oxiridagi so'roq bo'lishi mumkin)
    if (symbol === '?' && content.length === 0) continue;

    if (symbol === '?') {
      // Yangi savol boshlandi
      if (currentQ && currentQ.options.length > 0) {
        questions.push(currentQ);
      }
      currentQ = {
        text: content,
        options: [],
        correct: -1
      };
    } else if (currentQ) {
      // Variant qo'shish (+ yoki =)
      if (content.length > 0) {
        currentQ.options.push(content);
        if (symbol === '+') {
          currentQ.correct = currentQ.options.length - 1;
        }
      }
    }
  }

  // Oxirgi savolni qo'shish
  if (currentQ && currentQ.options.length > 0) {
    questions.push(currentQ);
  }

  console.log("Ultra Smart Parsed Questions:", questions);
  return questions;
};
