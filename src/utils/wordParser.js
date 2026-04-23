export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const rawText = container.innerText || container.textContent;
  
  // Matnni mutlaq tozalash va belgilarga qarab bo'lish (Split)
  // Biz ?, +, = belgilaridan oldin maxsus belgi qo'shib olamiz, keyin o'sha bo'yicha bo'lamiz
  const preparedText = rawText
    .replace(/\?/g, '###QUEST###')
    .replace(/\+/g, '###OPT_CORRECT###')
    .replace(/\=/g, '###OPT_WRONG###');

  const parts = preparedText.split(/###/);
  const questions = [];
  let currentQ = null;

  parts.forEach(part => {
    const cleanPart = part.trim();
    if (!cleanPart) return;

    if (cleanPart.startsWith('QUEST')) {
      if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
      currentQ = {
        text: cleanPart.replace('QUEST', '').trim(),
        options: [],
        correct: -1
      };
    } else if (cleanPart.startsWith('OPT_CORRECT') && currentQ) {
      const optText = '+' + cleanPart.replace('OPT_CORRECT', '').trim();
      currentQ.options.push(optText);
      currentQ.correct = currentQ.options.length - 1;
    } else if (cleanPart.startsWith('OPT_WRONG') && currentQ) {
      const optText = '=' + cleanPart.replace('OPT_WRONG', '').trim();
      currentQ.options.push(optText);
    }
  });

  if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
  
  console.log("Symbol-Parsed Questions:", questions);
  return questions;
};
