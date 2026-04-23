export const parseWordQuiz = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Savollarni ajratib olish (savollar odatda yangi qatordan boshlanadi va ? bilan tugaydi yoki boshlanadi)
  // Biz har bir <p> ni tekshiramiz
  const pTags = Array.from(doc.querySelectorAll('p, li'));
  const questions = [];
  let currentQuestion = null;

  pTags.forEach(p => {
    const text = p.innerText.trim();
    if (!text) return;

    // Agar matn ? bilan tugasa yoki segment boshida ? bo'lsa - bu SAVOL
    if (text.includes('?') || text.length > 50 && !currentQuestion) {
      if (currentQuestion && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        text: text.replace(/^\d+[\s.)]*/, '').trim(), // Raqamlarni tozalash (1. Savol...)
        options: [],
        correct: -1
      };
    } else if (currentQuestion) {
      // Bu VARIANT bo'lishi mumkin
      // TO'G'RI JAVOBNI ANIQLASH (HAR XIL USULLAR):
      const isBold = p.querySelector('strong, b, span[style*="bold"]') !== null;
      const isUnderlined = p.querySelector('u, span[style*="underline"]') !== null;
      const hasCorrectText = /\(to['`]?g['`]?ri\)/i.test(text) || /\(correct\)/i.test(text) || /\(t\)/i.test(text);
      const hasMarker = text.startsWith('+') || text.startsWith('*');

      let cleanOpt = text
        .replace(/^\([a-z]\)/i, '') // (a) (b) larni tozalash
        .replace(/^[a-z][\s.)]*/i, '') // a) b. larni tozalash
        .replace(/\(to['`]?g['`]?ri\)/i, '')
        .replace(/\(correct\)/i, '')
        .replace(/\(t\)/i, '')
        .replace(/^[+*]/, '')
        .trim();

      if (cleanOpt) {
        if (isBold || isUnderlined || hasCorrectText || hasMarker) {
          currentQuestion.correct = currentQuestion.options.length;
        }
        currentQuestion.options.push(cleanOpt);
      }
    }
  });

  // Oxirgi savolni qo'shish
  if (currentQuestion && currentQuestion.options.length >= 2) {
    questions.push(currentQuestion);
  }

  return questions;
};
