export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  
  // Matnni HTML'dan toza holatda olamiz (lekin belgilarni saqlab qolamiz)
  const rawText = (container.innerText || container.textContent || '').trim();
  
  // REGEX: Belgini va undan keyin kelgan matnni ushlaydi
  const regex = /(\?|\+|\=)([^\?\+\=]*)/g;
  const matches = [...rawText.matchAll(regex)];
  
  const questions = [];
  let currentQ = null;

  matches.forEach(match => {
    const symbol = match[1]; 
    const content = match[2].trim(); 
    
    if (symbol === '?') {
      // Yangi savol boshlandi
      if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
      currentQ = {
        text: content, // Savol matni (belgisiz)
        options: [],
        correct: -1
      };
    } else if (currentQ) {
      // Variant (belgisiz saqlaymiz)
      currentQ.options.push(content);
      if (symbol === '+') {
        currentQ.correct = currentQ.options.length - 1;
      }
    }
  });

  if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
  
  console.log("Clean Parsed Questions:", questions);
  return questions;
};
