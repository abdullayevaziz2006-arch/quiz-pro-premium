export const parseWordQuiz = (html) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  const rawText = (container.innerText || container.textContent || '').trim();
  
  // Savollarni aniqlash: faqat matn boshidagi yoki variantlardan oldingi ? belgisini olamiz
  // Biz ? belgisi bilan boshlanib, + yoki = belgisigacha bo'lgan bloklarni ajratamiz
  const questions = [];
  
  // Matnni ? belgilariga qarab bo'lamiz, lekin bo'shlarini olib tashlaymiz
  const blocks = rawText.split(/\n\s*\?|^\s*\?/).filter(b => b.trim().length > 0);

  blocks.forEach(block => {
    // Har bir blok savol va uning variantlaridan iborat
    // Variantlarni + yoki = belgisiga qarab kesamiz
    const parts = block.split(/([\+\=])/);
    if (parts.length < 2) return;

    const qText = parts[0].trim();
    const options = [];
    let correctIdx = -1;

    for (let i = 1; i < parts.length; i += 2) {
      const symbol = parts[i]; 
      const text = parts[i+1]?.trim() || '';
      
      if (text) {
        options.push(text);
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

  console.log("Smart Parsed Questions:", questions);
  return questions;
};
