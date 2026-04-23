export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const rawText = container.innerText || container.textContent;
  
  // Belgilarni qidiramiz va ularni maxsus marker bilan o'raymiz (lekin belgilarni o'zini saqlab qolamiz)
  const preparedText = rawText
    .replace(/\?/g, '[[[QUEST]]]')
    .replace(/\+/g, '[[[CORRECT]]]')
    .replace(/\=/g, '[[[WRONG]]]');

  // Markerni o'ziga qarab bo'lamiz
  const segments = preparedText.split(/\[\[\[|\]\]\]/).filter(s => s.trim().length > 0);
  
  const questions = [];
  let currentQ = null;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i].trim();
    
    if (seg === 'QUEST') {
      if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
      currentQ = {
        text: segments[i + 1]?.trim() || '',
        options: [],
        correct: -1
      };
      i++; // Matnni o'tkazib yuboramiz
    } else if (seg === 'CORRECT' && currentQ) {
      const optText = '+' + (segments[i + 1]?.trim() || '');
      currentQ.options.push(optText);
      currentQ.correct = currentQ.options.length - 1;
      i++;
    } else if (seg === 'WRONG' && currentQ) {
      const optText = '=' + (segments[i + 1]?.trim() || '');
      currentQ.options.push(optText);
      i++;
    }
  }

  if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
  
  console.log("Safe-Parsed Questions:", questions);
  return questions;
};
