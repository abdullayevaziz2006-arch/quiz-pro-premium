export const parseWordQuiz = (text) => {
  // Matnni ? belgisi bo'yicha bo'laklarga bo'lamiz
  // Har bir bo'lak bitta savol va uning javoblarini o'z ichiga oladi
  const segments = text.split(/\n\?|\r\n\?|^\?/).filter(s => s.trim().length > 0);
  const questions = [];

  segments.forEach(segment => {
    const lines = segment.split(/\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return;

    let questionText = '';
    const options = [];
    let correctIdx = -1;

    // Birinchi qismni savol matni sifatida yig'amiz (to + yoki = belgisi kelguncha)
    let parsingOptions = false;

    lines.forEach(line => {
      if (line.startsWith('+') || line.startsWith('=')) {
        parsingOptions = true;
        const isCorrect = line.startsWith('+');
        const optText = line.substring(1).trim();
        
        if (optText) {
          if (isCorrect) correctIdx = options.length;
          options.push(optText);
        }
      } else if (!parsingOptions) {
        // Savol matni bir necha qatordan iborat bo'lishi mumkin
        questionText += (questionText ? ' ' : '') + line;
      }
    });

    // Savol oxiridagi so'roq belgisini tozalash (agar bo'lsa)
    questionText = questionText.replace(/\?$/, '').trim();

    if (questionText && options.length >= 2 && correctIdx !== -1) {
      questions.push({
        text: questionText,
        options: options,
        correct: correctIdx
      });
    }
  });

  return questions;
};

