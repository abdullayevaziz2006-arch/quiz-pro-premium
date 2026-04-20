export const parseWordQuiz = (text) => {
  // Regex: ? belgilari orasidagi matnni (savol) va keyingi ? gacha bo'lgan qismni (variantlar) oladi
  const regex = /\?([\s\S]+?)\?([\s\S]+?)(?=\?|$)/g;
  const questions = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const questionText = match[1].trim();
    const optionsBlock = match[2].trim();
    
    // Variantlarni +, = va qator tashlashlar bo'yicha ajratamiz
    const lines = optionsBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    const options = [];
    let correctIdx = -1;

    lines.forEach(line => {
      // Ba'zida mammoth qo'shimcha belgilarni qo'shishi mumkin, shuning uchun startsWith dan ehtiyotkorlik bilan foydalanamiz
      if (line.includes('+')) {
        const text = line.replace(/^\+/, '').trim();
        if (text) {
          correctIdx = options.length;
          options.push(text);
        }
      } else if (line.includes('=')) {
        const text = line.replace(/^=/, '').trim();
        if (text) {
          options.push(text);
        }
      }
    });

    if (options.length >= 2 && correctIdx !== -1) {
      questions.push({
        text: questionText,
        options: options,
        correct: correctIdx
      });
    }
  }

  return questions;
};
