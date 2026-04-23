export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  
  // Matnni HTML'dan toza holatda olamiz
  const rawText = container.innerText || container.textContent;
  
  // Savollarni ? belgisiga qarab bo'lamiz
  const questionBlocks = rawText.split(/\?/).filter(b => b.trim().length > 5);
  const questions = [];

  questionBlocks.forEach(block => {
    // Har bir blokni qatorlarga yoki belgilarga qarab tahlil qilamiz
    // Variantlar + yoki = bilan boshlangan
    const parts = block.split(/([\+\=])/);
    if (parts.length < 2) return;

    const qText = parts[0].trim();
    const options = [];
    let correctIdx = -1;

    for (let i = 1; i < parts.length; i += 2) {
      const symbol = parts[i]; // + yoki =
      const text = parts[i+1]?.trim() || '';
      
      if (text) {
        options.push(symbol + " " + text);
        if (symbol === '+') {
          correctIdx = options.length - 1;
        }
      }
    }

    if (options.length > 0) {
      questions.push({
        text: qText,
        options: options,
        correct: correctIdx
      });
    }
  });

  console.log("Aggressive-Parsed Questions:", questions);
  return questions;
};
