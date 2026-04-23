export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const rawText = (container.innerText || container.textContent || '').trim();
  
  // OLTYIN STANDART: Regex orqali belgilarni va ulardan keyingi matnni qidiramiz
  // (\?|\+|\=) -> Belgini ushlaydi
  // ([^\?\+\=]*) -> Keyingi belgiga qadar barcha matnni ushlaydi
  const regex = /(\?|\+|\=)([^\?\+\=]*)/g;
  const matches = [...rawText.matchAll(regex)];
  
  const questions = [];
  let currentQ = null;

  matches.forEach(match => {
    const symbol = match[1]; // ?, +, yoki =
    const content = match[2].trim(); // Matn
    
    if (!content && symbol !== '?') return;

    if (symbol === '?') {
      if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
      currentQ = {
        text: content,
        options: [],
        correct: -1
      };
    } else if (currentQ) {
      const optText = symbol + " " + content;
      currentQ.options.push(optText);
      if (symbol === '+') {
        currentQ.correct = currentQ.options.length - 1;
      }
    }
  });

  if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
  
  console.log("Regex-Matched Questions:", questions);
  return questions;
};
